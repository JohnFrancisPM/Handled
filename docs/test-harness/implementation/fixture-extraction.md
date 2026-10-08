# Fixture Extraction + Data Model (no database)

**Source:** engineering-doc §7 (all), §10 F1 · **Replaces** `supabase-schema.sql` (this app
has no DB — see README "Why there is no supabase-schema.sql").
**Inputs parsed:** `supabase/seed/04_end_customers_30.sql`, `05_conversations_messages.sql`,
`06_appointments.sql` (+ `01_acme_profile.sql` for the service-id → name map).
**Output committed artifact:** `apps/test-harness/fixtures/customers.json`.

The fixture is a **derived artifact**, built ONCE by a builder-side script and committed.
The seed SQL stays canonical; regenerate + re-commit when the seed changes. There is **zero
runtime DB coupling** — the app imports the JSON directly.

---

## 1. The extraction script — `scripts/build-harness-fixture.ts`

- **Location:** repo-root `scripts/` (builder-side utilities, outside the apps — matches
  the existing `scripts/` convention in CLAUDE.md). NOT shipped in the app bundle.
- **Run:** `npx tsx scripts/build-harness-fixture.ts`
  (or `npm run build:fixture` from `apps/test-harness`). No DB creds, no network — it reads
  static `.sql` files from disk.
- **Parser:** `pgsql-ast-parser` (pure-JS Postgres AST parser). Do NOT hand-roll a regex
  tokenizer — message bodies contain SQL-escaped quotes (`''`), commas, brackets, and
  Spanish/accented text (`¡Claro!`, `¿Cuánto…`) that break naive parsing.

### 1.1 Algorithm (deterministic, idempotent)

```
1. Read the four SQL files as UTF-8 text.
2. Parse each with pgsql-ast-parser → AST statements. Keep only INSERT statements whose
   table is end_customers / conversations / messages / appointments / services.
3. For each INSERT, read its explicit column list and VALUES rows. Build row objects
   {column: value}. Decode AST literals:
     - string → unescaped JS string (parser already handles '' → ');
     - null  → null;
     - `now() + interval 'N seconds'` and `now() - interval 'N days'` → see §4 (normalize);
     - `::jsonb` casts (tool_calls) → JSON.parse the inner string literal into an array.
4. Build lookup maps:
     servicesById   : services.id → { name, category }           (from seed 01)
     techLabels     : fixed map (see §3) Dave/Luis/Sam/etc.
5. For each end_customers row (30), assemble a Customer (schema §2):
     - find its conversation by end_customer_id (conversations.end_customer_id);
     - collect that conversation's messages, ORDER BY created_at ASC (normalized offset);
     - map each message → HistoryTurn (role, content, intent, agent, actions, ts);
     - derive last_intent/status from the conversation row;
     - find appointments by end_customer_id; pick the most relevant as last_job (§3).
6. Emit the fixture object (schema §2) and write fixtures/customers.json with 2-space
   indent, customers sorted by numeric id suffix (01..30). Stable output => git-clean reruns.
7. Print a summary: customers written, turns written, customers with null name, spam
   threads (no assistant reply), appointments linked.
```

### 1.2 Join logic (exact)

- `end_customers.id` → `conversations.end_customer_id` (**one conversation per customer**;
  all 30 have exactly one in seed 05 — if 0 or >1 are ever found, the script errors loudly).
- `conversations.id` → `messages.conversation_id`.
- `end_customers.id` → `appointments.end_customer_id` (0..N; Tom Becker #6 has 3, two with
  `source_conversation_id = null` = prior-job history).
- `appointments.service_id` → `services.id` (seed 01) for the human service name.

### 1.3 `tool_calls` → `actions` mapping

`messages.tool_calls` is a JSON array like
`[{"tool":"check_availability"},{"tool":"create_appointment","price":180}]`.
Map each element to a `HistoryTurn.actions[]` entry preserving all keys, renaming `tool`→`type`
so the fixture's shape matches the **live** webhook's `actions[]` (`{type, ...}`) — the UI
renders backfilled and live actions with one component. User turns have `tool_calls = null`
→ `actions: null`.

---

## 2. Fixture schema — `apps/test-harness/fixtures/customers.json`

```jsonc
{
  "generated_from": [
    "supabase/seed/04_end_customers_30.sql",
    "supabase/seed/05_conversations_messages.sql",
    "supabase/seed/06_appointments.sql",
    "supabase/seed/01_acme_profile.sql"
  ],
  "generated_at": "2026-10-08T00:00:00.000Z",   // ISO; informational only
  "business_id_note": "business_id comes from env (ACME_BUSINESS_ID), NOT from this file",
  "customer_count": 30,
  "customers": [
    {
      "id": "c0000000-0000-0000-0000-000000000001",   // seed UUID — fixture key only
      "phone": "+15551230001",                          // → contract from_phone (UNIQUE per customer)
      "name": "Jane Doe",                               // string | null  (#23 is null)
      "address": "112-20 72nd Ave, Forest Hills, Queens, NY 11375", // string | null
      "last_intent": "book",                            // from conversations.last_intent
      "status": "booked",                               // from conversations.status
      "history": [
        {
          "role": "user",                               // "user" | "assistant"
          "content": "My kitchen sink is clogged, can someone come out?",
          "intent": "book",                             // string | null
          "agent": null,                                // string | null (user turns = null)
          "actions": null,                              // Array<{type:string,[k]:unknown}> | null
          "ts": "t+0s"                                  // normalized relative label (see §4)
        },
        {
          "role": "assistant",
          "content": "I can help! You're in Forest Hills ...",
          "intent": "book",
          "agent": "new_booking",
          "actions": [
            { "type": "check_service_offered", "service": "drain" },
            { "type": "check_availability" },
            { "type": "create_appointment", "price": 180 }
          ],
          "ts": "t+10s"
        }
      ],
      "last_job": {                                     // object | null  (from appointments)
        "service": "Drain clearing & clog removal",
        "price": 180,
        "status": "closed_won",
        "scheduled_rel": "6 days ago"                   // normalized from now()-interval (§4)
      }
    }
    // ... 30 customers total, sorted 01..30
  ]
}
```

### 2.1 TypeScript types — `lib/fixtures/types.ts`

```ts
export interface HistoryTurn {
  role: "user" | "assistant";
  content: string;
  intent: string | null;
  agent: string | null;
  actions: Array<{ type: string; [k: string]: unknown }> | null;
  ts: string;                       // relative label, e.g. "t+0s"
}

export interface LastJob {
  service: string;
  price: number | null;
  status: string;                   // closed_won | booked | cancelled
  scheduled_rel: string;            // e.g. "6 days ago" | "in 3 days"
}

export interface Customer {
  id: string;
  phone: string;
  name: string | null;
  address: string | null;
  last_intent: string | null;
  status: string | null;
  history: HistoryTurn[];           // [] allowed; spam customers have 1 user turn, no reply
  last_job: LastJob | null;
}

export interface CustomersFixture {
  generated_from: string[];
  generated_at: string;
  business_id_note: string;
  customer_count: number;
  customers: Customer[];
}
```

---

## 3. Provenance tables (verified against the seed)

**Service id → name/category** (seed 01), used for `last_job.service`:

| service_id suffix | name | category |
|---|---|---|
| …001 | Drain clearing & clog removal | drain |
| …002 | Household fixture installation & repair | fixture |
| …003 | Residential water heater installation/maintenance/repair | water_heater |
| …004 | Household leak detection & pipe repair | leak_pipe |
| …005 | Sump pump installation & maintenance | sump_pump |
| …007 | Hydronic boiler maintenance | gas_heating |

**Customer notables the script MUST handle** (verified in seed 04/05):
- `#23` (`c…23`, `+15551230023`): `name = null`, `address = null`. UI shows the phone as the
  display name. `customer_name` is omitted from the webhook body when null (`webhook-proxy.md` §3).
- `#24` "Spam Source" / `#25` "Robo Caller": `address = null`; their conversation has a
  **single user message and NO assistant reply** (`status='spam'`). `history` has 1 turn.
- `#26` María González / `#27` José Ramírez: Spanish content with accented characters — must
  round-trip exactly.
- Content with escaped apostrophes (`You''re`, `I''m`, `don''t`) decodes to single `'`.

**`last_job` selection rule:** among a customer's appointments, prefer the one whose
`source_conversation_id` matches the customer's conversation; if none, the most recent by
`scheduled_at`. For Tom Becker (#6), that yields his current sump job (the two
`source_conversation_id = null` prior jobs remain available but are not the headline
`last_job`). Customers with no appointment (emergencies #16–19, out-of-area #20/21,
not-offered #22/23, spam #24/25, pricing-only #13/14/15/27, injection #29) → `last_job: null`.

---

## 4. Relative-date normalization

The seed uses `now() + interval '…seconds'` (message ordering) and
`now() ± interval '…days'` (appointments). The fixture is static, so the extractor converts:

- **`messages.created_at`** `now() + interval 'N seconds'` → `ts: "t+<N>s"` (bare `now()` →
  `"t+0s"`). This preserves intra-thread ordering without implying an absolute date. The UI
  renders these as relative labels ("just now", "+10s") or sequential timestamps off a fixed
  demo anchor — ordering is what matters.
- **`appointments.scheduled_at`** `now() - interval 'N days'` → `scheduled_rel: "N days ago"`;
  `now() + interval 'N days'` → `scheduled_rel: "in N days"`. Used only for the `last_job` chip.

No wall-clock dates are embedded, so the fixture never looks stale.

---

## 5. Loaders — `lib/fixtures/load.ts`

```ts
import customersJson from "@/fixtures/customers.json";
import type { CustomersFixture, Customer } from "@/lib/fixtures/types";

const fixture = customersJson as CustomersFixture;

export function getCustomers(): Customer[] {
  return fixture.customers;
}

export function getCustomerById(id: string): Customer | undefined {
  return fixture.customers.find((c) => c.id === id);
}

/** Display label: name when present, else the phone (handles #23 null name). */
export function customerLabel(c: Customer): string {
  return c.name ?? c.phone;
}
```

- Import is synchronous (bundled JSON); the roster renders with **no backend call** (ED §4.1).
- `getCustomerById` is used server-side by `/api/send` to resolve `from_phone`/`name`
  (`webhook-proxy.md` §5) and client-side by the thread view.
- Both `customers.json` and `scenarios.json` (see `scenario-set.md`) are loadable in the
  server runtime (Route Handlers) and the browser (roster/thread) — they are plain JSON.

---

## 6. Regeneration note (ships in app README)

> If `supabase/seed/04…06` (or `01`) change, re-run `npx tsx scripts/build-harness-fixture.ts`
> and commit the updated `apps/test-harness/fixtures/customers.json`. The script is
> idempotent; a no-op change produces no diff.

---

## Requirement coverage
- **TH-1** (30 impersonatable customers) — §1, §2, §5.
- **TH-2** (backfilled history) — §1.1–§1.3, §2, §4.
- **TH-7** (seed SQL → committed JSON, justified) — whole file; README omission rationale.
- **TH-6** (no live Supabase at runtime) — §1 (static file read), §5 (bundled import).
- **TH-8** (unique from_phone per customer) — §2 (`phone`), §3 (notables).
