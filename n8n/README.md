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
3. Select (or create) your **Anthropic** credential on the three model nodes — **Claude Sonnet
   (Specialist)**, **Guard LLM (Haiku)**, and **Router LLM (Haiku)**. All three ship a placeholder
   credential reference (`Anthropic account`); n8n prompts you to pick a real one. The Guard/Router
   HTTP Request nodes authenticate with the same credential (`Predefined Credential Type → Anthropic`),
   so there is **no `ANTHROPIC_API_KEY` env var** — one Anthropic credential covers all three.
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
| `ANTHROPIC_MODEL_GUARD` | Build Guard Request | Haiku-class model id, e.g. `claude-haiku-4-5`. |
| `ANTHROPIC_MODEL_ROUTER` | Build Router Request | Haiku-class model id. |
| `ANTHROPIC_MODEL_SPECIALIST` | Claude Sonnet (Specialist) | **Dated** Sonnet-class id, e.g. `claude-sonnet-4-5-20250929` (the LangChain model node rejects the undated alias). |

> Claude auth is a **credential, not an env var.** All three model nodes (Specialist, Guard, Router)
> use the n8n **Anthropic** credential you select on import — there is no `ANTHROPIC_API_KEY` to set.

### n8n Cloud (Starter) — no `$env`

n8n Cloud blocks custom `$env` variables and gates Variables (`$vars`) to Pro+. For a Starter instance,
inline the values before importing with `scripts/build-cloud-workflow.js` (repo root) — it reads
`N8N_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (and optional model ids) from your
shell and writes an import-ready copy; secrets stay out of chat and git. You still pick the Anthropic
credential on the three model nodes after import (step 3).

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

All prompts use a consistent **XML-tag format** — `<Role> <Instruction> <Context> <Examples> <Task>
<OutputFormat> <Guardrails>`, in that order, omitting any tag with no content — and several carry
curated few-shot `<Examples>`.

Each of the 6 specialist prompt files is a **complete, self-contained XML document**: the shared blocks
(`<Role>`-base, `<Context>`, `<OutputFormat>`, `<Guardrails>`) merged verbatim with that specialist's own
role line, `<Instruction>`, `<Examples>`, `<Task>`, and tool list. That full document is embedded as the
agent node's `systemMessage`. The Guard and Router prompts are their own self-contained XML docs embedded
verbatim as the `SYSTEM` string in the `Build Guard Request` / `Build Router Request` nodes.

`prompts/shared-preamble.md` is the **canonical source** of the shared blocks — edit them there first,
then re-sync every specialist file. The `prompts/` folder holds the same text as standalone files for
editing/review. If you change a prompt file, re-embed it (or re-run the generator) so the node and the
file stay in sync.

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
