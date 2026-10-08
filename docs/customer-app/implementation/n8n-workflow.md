# n8n Workflow — topology & node-by-node

**Sub-system:** n8n agentic backend (`n8n/workflows/handled-agentic.json`)
**Source:** engineering-doc §8.2, §8.6, §6.2
**Related:** `n8n-webhook-contract.md` (I/O), `n8n-tools.md` (tool layer), `n8n-agent-prompts.md` (prompts)

---

## Topology

```
Webhook ─► Validate+Auth ─► Context Loader ─► Spam/Injection Guard (Haiku)
   ├─ spam ──────────────► Persist(spam) ─► Respond {intent:spam, billed:false}
   ├─ injection ─────────► Persist(injection) ─► Respond {safe refusal}
   └─ legitimate ─► Intent Router (Haiku) ─► switch(intent)
        book          -> New-Booking Agent (Sonnet)
        reschedule    -> Reschedule-Cancel Agent
        cancel        -> Reschedule-Cancel Agent
        emergency     -> Emergency-Triage Agent
        pricing       -> Pricing-Quote Agent
        out_of_area   -> Out-of-Area Agent
        faq           -> General-FAQ Agent
     (any agent) ─► Tool calls (n8n-tools) ─► Persist + Eval-extractor ─► Respond
   (any failure) ─► Fallback ─► Persist(fallback) ─► Respond {safe reply}
```

---

## Node-by-node

### 1. Webhook (trigger)
- `POST /webhook/handled/message`, respond "Using Respond to Webhook node".
- Reads body + headers.

### 2. Validate + Auth (Function/IF)
- Check `X-Handled-Secret == N8N_WEBHOOK_SECRET` → else Respond 401.
- Validate `business_id`, `from_phone` (`^\+?[0-9]{7,15}$`), `text` (1–2000) → else Respond 400.
- Resolve `business_id` (slug or uuid) → `org_id` via Supabase; if none → Respond 404.
- Idempotency: if `message_id` already processed → Respond with stored result.

### 3. Context Loader (Supabase reads; NOT an LLM) — ED §6.2, §8.7
Resolve/create `end_customers` by `(org_id, from_phone)` and `conversations` (latest open or new). If `opted_out` → Respond with compliant message. Then assemble the **context bundle**:

```jsonc
{
  "org_id": "uuid",
  "business": { "legal_name", "trade", "about", "ai_disclosure_text", "spanish_enabled", "base_zip" },
  "services_offered": [ { "id","name","category","description","notes" } ],
  "services_not_offered": [ "name ..." ],
  "service_areas_serve": [ "Queens","Brooklyn","Manhattan","Nassau" ],
  "service_areas_deny":  [ "Bronx","Westchester","Suffolk","New Jersey","upstate" ],
  "pricing_table": [ { "service","price_min","price_max","unit","notes" } ],
  "business_hours": [ { "day_of_week","open_time","close_time" } ],
  "closed_dates": [ "2026-12-25", ... ],
  "technicians_available": [ { "id","name","skills" } ],     // excludes sick/vacation
  "emergency_rules": [ { "keyword_or_pattern","severity","action","guidance_text" } ],
  "customer": { "phone","name","address","known": bool },
  "previous_jobs": [ { "service","scheduled_at","status","price" } ],
  "chat_history": [ { "role","content","created_at" } ],      // last N=10 messages
  "now_local": "2026-10-07T14:30:00-04:00",
  "language_hint": "en|es",
  "conversation_id": "uuid",
  "message_id": "th-0001"
}
```
Reads: `organizations, business_profiles, services, service_pricing, service_areas, business_hours, technicians, emergency_rules, end_customers, conversations, messages, appointments`. Trim `chat_history` to last 10 and `previous_jobs` to last 5 for cost (ED §8.6).

### 4. Spam/Injection Guard (LLM — Haiku, temp 0)
- Prompt = `spam-injection-guard.md`. Input = `text` + minimal context.
- `spam:true` → branch: Persist(spam) → Respond `{intent:"spam", reply:null, billed:false}`.
- `injection:true` → branch: Persist(injection) → Respond `{intent:"injection", reply:safe_refusal}`.
- else continue.

### 5. Intent Router (LLM — Haiku, temp 0)
- Prompt = `intent-router.md`. Outputs `{intent, multi, language}`. Set `language_hint` from here.

### 6. Switch → Specialist Agent (LLM — Sonnet, temp 0.3)
- Route per intent map. Each agent uses prompt from `n8n-agent-prompts.md` with the shared preamble + its tool set wired as n8n tools (see `n8n-tools.md`). The AI Agent node executes tool calls in a loop until the model returns the final JSON.
- `multi:true` → the routed primary agent also answers the secondary question in `reply`.

### 7. Tool execution (sub-nodes)
- Each tool = a Supabase operation using the SERVICE ROLE key, always filtering by `org_id`. See `n8n-tools.md` for exact I/O. `create_appointment`/`update_appointment` enforce `confirmed_readback` + availability re-check.

### 8. Persist + Eval-extractor (Supabase writes)
Insert two `messages` rows:
- user turn: `role='user'`, `content=text`, `question=text`, `intent`, `created_at`.
- assistant turn: `role='assistant'`, `content=reply`, `question`, `response`, `citation`, `reasoning` (from the agent's `eval` object), `intent`, `agent`, `tool_calls` (full array incl. args + results + `external_message_id`).
Update `conversations.last_intent` and `status` (`booked` on create_appointment, `escalated` on escalation, `spam` on spam, else `open`). Appointment/lead/escalation/notification rows are written by the tools themselves.

### 9. Respond to Webhook
Build the response body per `n8n-webhook-contract.md` from the agent output + persisted ids.

### 10. Fallback (error workflow) — eval Ha-09
Wire an n8n **Error Trigger** / try-catch so any node failure routes to the Fallback node: compose the safe templated reply (emergency-aware), Persist(`intent='fallback'`), create an owner `notifications` row (`kind='escalation'`, `channel='owner'`), Respond `200` with the fallback `reply`. Never a silent drop, never a 500 to the sender. (Only add an `escalations` row if the message was emergency-flagged.)

---

## Models & config (ED §8.1, PRD §5)
| Node | Model env | Temp | Max tokens | Rationale |
|---|---|---|---|---|
| Guard | `ANTHROPIC_MODEL_GUARD` (Haiku) | 0 | 256 | cheap pre-filter; avoids Sonnet spend on spam |
| Router | `ANTHROPIC_MODEL_ROUTER` (Haiku) | 0 | 256 | fast classification |
| 6 Specialists | `ANTHROPIC_MODEL_SPECIALIST` (Sonnet) | 0.3 | 1024 | dialog + tool use + read-back |

- Context window 32K+ holds config + history + tool results (ED §8.1).
- Text in/out only; English + Spanish.
- `ANTHROPIC_API_KEY` lives in n8n env only (never browser).

## Cost / latency / abuse controls (ED §8.6)
- Two-tier routing; spam filtered before any Sonnet call; max-token caps above; history trimmed to last 10.
- Webhook shared-secret + per-phone throttle (rate-limit repeated inbound from one `from_phone`).
- Latency target < ~3s round-trip.

## Export artifact
Final workflow is exported to `n8n/workflows/handled-agentic.json` for import. `n8n/README.md` documents import steps + required env (`ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `N8N_WEBHOOK_SECRET`, model ids).
