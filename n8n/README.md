# Handled — n8n Agentic SMS Backend

This folder contains the importable n8n workflow that powers the **single agentic entry point** for
the Handled customer-app: one webhook that accepts an inbound end-customer text, runs the
spam/injection guard → intent router → specialist-agent → tool-layer → persistence pipeline, and
returns the AI reply as a fixed JSON envelope.

The Test Harness app and a future real SMS gateway both POST to this same webhook. The contract is
fixed in [`docs/customer-app/implementation/n8n-webhook-contract.md`](../docs/customer-app/implementation/n8n-webhook-contract.md).

```
n8n/
├── handled-agentic.json     # import this into n8n
├── prompts/                 # the 10 verbatim prompts (also embedded in the workflow nodes)
│   ├── shared-preamble.md   # prepended to every specialist (§0)
│   ├── guard.md             # spam / injection classifier (Haiku)
│   ├── router.md            # intent router (Haiku)
│   ├── new-booking.md
│   ├── reschedule-cancel.md
│   ├── emergency-triage.md
│   ├── pricing-quote.md
│   ├── out-of-area.md
│   ├── general-faq.md
│   └── fallback.md          # no-LLM safe reply template
└── README.md
```

---

## 1. Import

1. In n8n: **Workflows → Import from File →** select `n8n/handled-agentic.json`.
2. The workflow imports as **Handled — Agentic SMS Backend** (inactive).
3. Open the **Claude Sonnet (Specialist)** node and select (or create) your **Anthropic** credential.
   The import ships a placeholder credential reference (`Anthropic account`) — n8n will prompt you to
   pick a real credential. The Guard and Router nodes call the Anthropic API over **HTTP Request** and
   read the API key from an environment variable (no credential needed — see below).
4. **Save**, then toggle **Active** to register the production webhook.

---

## 2. Environment variables / credentials

All secrets are referenced **by name**; nothing is hardcoded in the JSON. Set these in the n8n
environment (e.g. `docker-compose` env, `.env`, or the host) so `{{ $env.* }}` resolves:

| Variable | Used by | Purpose |
|---|---|---|
| `N8N_WEBHOOK_SECRET` | `Validate & Auth` | Shared secret; must equal the inbound `X-Handled-Secret` header. |
| `SUPABASE_URL` | Context Loader, all tools, persistence | Supabase project URL (REST base is `${SUPABASE_URL}/rest/v1`). |
| `SUPABASE_SERVICE_ROLE_KEY` | Context Loader, all tools, persistence | Service-role key (bypasses RLS; org scoping enforced in the tool layer). |
| `ANTHROPIC_API_KEY` | Guard LLM, Router LLM (HTTP Request header `x-api-key`) | Claude API key. |
| `ANTHROPIC_MODEL_GUARD` | Build Guard Request | Haiku-class model id, e.g. `claude-haiku-4-5`. |
| `ANTHROPIC_MODEL_ROUTER` | Build Router Request | Haiku-class model id. |
| `ANTHROPIC_MODEL_SPECIALIST` | Claude Sonnet (Specialist) | Sonnet-class model id, e.g. `claude-sonnet-4-5`. |

> The **Anthropic credential** on the `Claude Sonnet (Specialist)` LangChain model node is separate
> from `ANTHROPIC_API_KEY` (which the Guard/Router HTTP nodes use). Point both at the same key.
> `ANTHROPIC_API_KEY` must live in the n8n environment only — never in the browser/dashboard.

The Supabase schema must already be created (run
[`docs/customer-app/implementation/supabase-schema.sql`](../docs/customer-app/implementation/supabase-schema.sql))
and seeded (see `seed-data.md`) before the workflow can read config or write rows.

---

## 3. Webhook URL & secret

- **Endpoint:** `POST {N8N_WEBHOOK_URL}` — the registered path is `handled/message`, so the full URL is
  `https://<your-n8n-host>/webhook/handled/message` (and `/webhook-test/handled/message` while testing
  from the n8n editor).
- **Auth header:** `X-Handled-Secret: <N8N_WEBHOOK_SECRET>` (server-to-server). A missing/wrong secret
  returns `401`.
- **Content-Type:** `application/json`.

Set `N8N_WEBHOOK_URL` and `N8N_WEBHOOK_SECRET` in the customer-app / Test-Harness environment to match.

---

## 4. How the Test Harness calls it

The Test Harness (separate app) impersonates the 30 seeded end-customers by POSTing to this exact
endpoint with different `from_phone` values and renders the returned `reply` as an SMS bubble. It needs
only the endpoint URL, the `X-Handled-Secret`, and the contract schema — no other coupling.

**Request** (full schema in the contract doc):

```jsonc
{
  "business_id": "acme-plumbing",   // org slug OR uuid (required)
  "from_phone":  "+15551230001",    // E.164-ish, the end-customer id (required)
  "text":        "My kitchen sink is clogged, can someone come out?", // 1–2000 chars (required)
  "channel":     "sms",             // optional, default "sms"
  "customer_name": "Jane Doe",      // optional
  "media_url":   "https://.../photo.jpg", // optional (MMS → attached to a lead)
  "message_id":  "th-0001"          // optional idempotency key
}
```

**Success response (200):**

```jsonc
{
  "ok": true,
  "reply": "…text to send the customer…",
  "intent": "book",                 // book|reschedule|cancel|emergency|pricing|out_of_area|faq|spam|injection|fallback
  "agent": "new_booking",
  "actions": [ { "type": "create_appointment", "appointment_id": "…", "price": 180 } ],
  "conversation_id": "uuid",
  "message_id": "uuid",             // persisted assistant message id
  "billed": true,
  "eval": { "question": "…", "response": "…", "citation": "service_pricing#…, check_availability", "reasoning": "…" }
}
```

**Response variants**

| Case | Shape |
|---|---|
| Spam | `200 { ok:true, intent:"spam", reply:null, billed:false }` — no owner notify |
| Injection | `200 { ok:true, intent:"injection", agent:"guard", reply:"<safe refusal>", billed:true }` |
| Opt-out | `200 { ok:true, intent:"faq", reply:"You're unsubscribed. Text START to opt back in." }` |
| Idempotent replay | `200 { … , idempotent:true }` (stored prior response) |
| Internal error | `200 { ok:true, intent:"fallback", reply:"<safe fallback>", billed:false }` — never a 500 |

**Hard errors** (the only non-200 statuses — all sender-fixable):

| Status | Body |
|---|---|
| `400` | `{ ok:false, error:"validation", detail:"…" }` |
| `401` | `{ ok:false, error:"unauthorized" }` |
| `404` | `{ ok:false, error:"unknown_business" }` |

---

## 5. Topology (what the workflow does)

```
Webhook → Validate & Auth → [invalid → Respond 4xx]
        → Context Loader (Supabase reads, builds the context bundle)
        → Context Gate ─┬ not_found → Respond 404
                        ├ opted_out → Respond Opt-out (200, compliant)
                        ├ duplicate → Respond Stored (idempotent)
                        └ ok → Build Guard Request → Guard LLM (Haiku) → Parse Guard → Guard Gate
                                 ├ spam      → Persist Spam      → Respond Spam
                                 ├ injection → Persist Injection → Respond Injection
                                 └ legit → Build Router Request → Router LLM (Haiku) → Parse Router
                                        → Intent Router (Switch) ─┬ book        → New-Booking Agent
                                                                  ├ reschedule  → Reschedule-Cancel Agent
                                                                  ├ cancel      → Reschedule-Cancel Agent
                                                                  ├ emergency   → Emergency-Triage Agent
                                                                  ├ pricing     → Pricing-Quote Agent
                                                                  ├ out_of_area → Out-of-Area Agent
                                                                  └ faq / else  → General-FAQ Agent
                                           (each agent) → Persist + Eval → Respond Normal
        (any agent / LLM / persist failure) → Fallback Handler → Respond Fallback (200)
```

- **Models:** Guard + Router are Haiku-class (temp 0, 256 tokens); the 6 specialists share one
  Sonnet-class model node (temp 0.3, 1024 tokens).
- **Shared tool layer:** 20 `toolCode` nodes (one per tool in `n8n-tools.md`) are wired to the agents
  via `ai_tool` connections exactly per the tool→agent access matrix. Every tool is an org-scoped
  Supabase REST operation using the service-role key — **no free-form SQL from the model**. The
  appointment write tools enforce `confirmed_readback` + an availability re-check (misbooking guard).
- **Persistence / eval:** `Persist + Eval` writes the user turn and the assistant turn (with
  `question / response / citation / reasoning / intent / agent / tool_calls`, including the external
  `message_id` for idempotency) and updates `conversations.last_intent` + `status`.
- **Fallback (eval Ha-09):** every agent / LLM / persistence node routes its error output to
  `Fallback Handler`, which composes an emergency-aware safe reply, notifies the owner, and returns
  `200` — the sender never sees a hard failure.

### Prompts in nodes

The specialist agents embed **shared-preamble + their role block** as the system message; the Guard and
Router prompts are embedded verbatim in the `Build Guard Request` / `Build Router Request` nodes. The
`prompts/` folder holds the same text as standalone files for editing/review. If you change a prompt
file, re-embed it (or re-run the generator) so the node and the file stay in sync.

---

## 6. Notes & assumptions

- **DB ops via REST.** Tools and the Context Loader call Supabase PostgREST with
  `this.helpers.httpRequest` rather than the n8n Supabase node, so the whole workflow is
  self-contained in one importable file and needs only env vars (no per-table credential wiring).
  Swap in the n8n **Supabase/Postgres** nodes if you prefer a GUI credential.
- **FSM adapter seam (ED §6.6).** `check_availability`, `create_appointment`, `update_appointment`,
  `cancel_appointment`, and `lookup_appointment` are thin Supabase implementations that can be swapped
  for a Jobber / Housecall Pro / ServiceTitan adapter later without touching the agent prompts.
- **Error handling.** Inline error outputs (`onError: continueErrorOutput`) feed the Fallback node.
  For cross-workflow coverage you can additionally set this workflow as its own **Error Workflow**
  (Settings → Error Workflow) and add an `Error Trigger` node.
- **Do not run n8n in CI without secrets** — the model and DB calls require the env above.
