# n8n Shared Tool Layer

**Sub-system:** n8n agentic backend (`n8n/tools/`)
**Source:** engineering-doc §8.4, §6.6; evals.xlsx
**Principle:** Tools are the ONLY way an agent reads or writes data. Every tool is a **parameterized, org-scoped** Supabase operation executed with the service-role key. **No free-form SQL from the model.** Every tool implicitly receives `org_id` (resolved from the webhook `business_id`) and must filter by it (ED §7.15). Writes that change appointments require a prior verbatim read-back + confirmation by the agent (misbooking guard).

Each tool below gives: purpose · input JSON schema · Supabase operation · return shape · guardrails.

---

## Read tools

### `check_service_offered`
- **Purpose:** is the requested service one the business provides? (eval Ha-05)
- **Input:** `{ "service_query": string }`
- **Op:** `select * from services where org_id=$org and offered=true` then fuzzy/category match against `service_query`; also check `offered=false` rows for an explicit decline.
- **Returns:** `{ "offered": bool, "service_id": uuid|null, "matched_name": string|null, "category": string|null, "decline_reason": string|null }`
- **Guardrail:** if it matches an `offered=false` row, return `offered:false` with `decline_reason`.

### `validate_service_area`
- **Purpose:** is an address/location in the service area? (eval Ha-04)
- **Input:** `{ "address": string|null, "zip": string|null, "region": string|null }`
- **Op:** check DENY rows first (`service_areas where org_id=$org and mode='deny'`); if the location matches a deny region/zip → out of area. Else check SERVE rows; match → in area. No match in either → treat as out of area and flag `uncertain:true`.
- **Returns:** `{ "in_area": bool, "matched": "serve|deny|none", "region": string|null, "uncertain": bool }`

### `check_availability`
- **Purpose:** real open slots for a service/day. Availability NEVER comes from the model. (eval Ho-03)
- **Input:** `{ "service_id": uuid|null, "category": string|null, "window_start": timestamptz, "window_end": timestamptz }`
- **Op:** load `business_hours` (respect open/close + `closed_dates`), load `technicians where org_id=$org and status='available'` (exclude `sick`/`vacation`, and exclude techs whose `status_until >= window date`); subtract existing `appointments` in the window (status in booked/requested). Generate candidate slots within business hours matching a tech whose `skills` include the service category.
- **Returns:** `{ "slots": [ { "start": timestamptz, "end": timestamptz, "technician_id": uuid, "technician_name": string } ], "closed_day": bool }`
- **Guardrail:** returns `[]` when nothing is open (agent must say so, never fabricate). (eval Ho-13 closed day → `closed_day:true`.)

### `lookup_technician`
- **Purpose:** find a named tech + availability. (eval H-08)
- **Input:** `{ "name": string }`
- **Op:** `select * from technicians where org_id=$org and name ilike $name`.
- **Returns:** `{ "technician_id": uuid|null, "name": string|null, "status": string|null, "status_until": date|null }`

### `lookup_appointment`
- **Purpose:** find a customer's appointment(s) (reschedule/cancel/status/confirm). (eval H-03/04/11/14/15)
- **Input:** `{ "phone": string, "appointment_id": uuid|null }`
- **Op:** resolve `end_customer` by `(org_id, phone)`; `select * from appointments where org_id=$org and end_customer_id=$id order by scheduled_at desc` (or by id).
- **Returns:** `{ "appointments": [ { "id", "service_name", "scheduled_at", "arrival_window", "status", "technician_name", "price", "confirmed" } ] }`

### `get_service_pricing`
- **Purpose:** configured price range for a service. (eval Ho-01/02)
- **Input:** `{ "service_id": uuid|null, "service_query": string|null }`
- **Op:** resolve service, then `select price_min, price_max, unit, notes from service_pricing where org_id=$org and service_id=$sid`.
- **Returns:** `{ "found": bool, "price_min": num|null, "price_max": num|null, "unit": string|null, "notes": string|null, "citation": "service_pricing#<service>" }`
- **Guardrail:** `found:false` → agent must NOT invent a price; capture a lead instead.

### `get_business_facts`
- **Purpose:** config-only facts (licensed/insured, hours, financing, customer types, about). (eval Ho-05/09/10)
- **Input:** `{ "topic": string }`
- **Op:** read `business_profiles` (+ `business_hours`) for the org; return only configured fields.
- **Returns:** `{ "found": bool, "fact": string|null, "citation": "business_profiles#<field>" }`
- **Guardrail:** `found:false` → agent says "owner will confirm"; never fabricate.

### `match_emergency_rule`
- **Purpose:** classify urgency against owner rules. (eval Ha-01/02/03/17/18)
- **Input:** `{ "text": string }`
- **Op:** `select * from emergency_rules where org_id=$org`; match keyword/pattern against text.
- **Returns:** `{ "matched": bool, "severity": "emergency|urgent"|null, "action": "escalate_oncall|advise_911|same_day_priority"|null, "guidance_text": string|null }`

---

## Write tools (org-scoped; appointment writes require prior read-back)

> **Notification channel convention (NOT NULL `notifications.channel`).** Every `notifications` insert below MUST set `channel` explicitly: `kind='new_booking' | 'lead' | 'after_hours_summary'` → `channel='owner'`; `kind='escalation'` → `channel='on_call_tech'` for an emergency escalation, `channel='owner'` for a human-transfer escalation. No notification insert may omit `channel`.
>
> **`end_customer_id` resolution (NOT NULL on leads/escalations/appointments).** Any write tool that takes `phone` as input resolves the `end_customer_id` from `(org_id, phone)` using the row already created/looked-up by the Context Loader step (`n8n-workflow.md` §3); all such inserts use that resolved id (upserting the customer first if needed).

### `create_appointment`
- **Purpose:** book a job. (eval H-01/02/08/09/16/17, Ho-04/08)
- **Input:** `{ "end_customer": {"phone","name","address"}, "service_id": uuid, "technician_id": uuid|null, "scheduled_at": timestamptz, "arrival_window": string|null, "price": num|null, "recurrence": "none|seasonal|monthly|quarterly", "waitlist": bool, "notes": string|null, "conversation_id": uuid, "confirmed_readback": true }`
- **Op:** upsert `end_customers` by `(org_id, phone)` (store name/address if provided); **re-run availability check**; insert `appointments` row (status `booked`); insert a `notifications` row (`kind='new_booking'`, `channel='owner'`). After-hours non-urgent bookings also insert a `kind='after_hours_summary'`, `channel='owner'` notification (eval H-02).
- **Returns:** `{ "appointment_id": uuid, "scheduled_at", "price", "status": "booked" }`
- **Guardrail:** reject if `confirmed_readback != true` (enforces verbatim read-back, eval Ho-04) or if the slot is no longer open (eval Ho-08 → return `{ "error": "slot_taken", "alternatives": [...] }`). `price` must be null or within the configured range.

### `update_appointment`
- **Input:** `{ "appointment_id": uuid, "scheduled_at": timestamptz, "technician_id": uuid|null, "confirmed_readback": true }`
- **Op:** re-check availability, update row, insert `notifications` (`kind='new_booking'`, `channel='owner'`). (eval H-03)
- **Returns:** `{ "appointment_id", "scheduled_at", "status":"booked" }`

### `cancel_appointment`
- **Input:** `{ "appointment_id": uuid, "reason": string|null }`
- **Op:** set `status='cancelled'`, store reason in `notes`, insert `notifications` (`kind='new_booking'`, `channel='owner'`). (eval H-04)
- **Returns:** `{ "appointment_id", "status":"cancelled" }`

### `mark_confirmed`
- **Input:** `{ "appointment_id": uuid }`
- **Op:** set `confirmed=true`. No new job. (eval H-14)
- **Returns:** `{ "appointment_id", "confirmed": true }`

### `add_waitlist`
- **Input:** `{ "appointment_id": uuid }`  → set `waitlist=true`. (eval H-17)

### `capture_notes`
- **Input:** `{ "appointment_id": uuid, "notes": string }` → append to `appointments.notes`. (eval H-16)

### `schedule_callback`
- **Input:** `{ "phone": string, "name": string|null, "time_window": string, "conversation_id": uuid }`
- **Op:** insert `leads` (`reason='callback'`, `detail=time_window`) + `notifications` (`kind='lead'`, `channel='owner'`). (eval H-12)
- **Returns:** `{ "lead_id": uuid }`

### `capture_lead`
- **Purpose:** record follow-up the AI can't close. (eval Ho-02 Critical, Ha-04, H-09/18, Ho-07)
- **Input:** `{ "phone": string, "name": string|null, "conversation_id": uuid, "reason": "unknown_price|out_of_area|recurring_plan|unknown_warranty|callback|photo_followup|other", "requested_service": string|null, "detail": string|null, "media_url": string|null }`
- **Op:** upsert `end_customers`; insert `leads`; insert `notifications` (`kind='lead'`, `channel='owner'`).
- **Returns:** `{ "lead_id": uuid }`

### `escalate_to_human`
- **Purpose:** emergency or human-transfer handoff. (eval Ha-01/02/03/17/18, H-05, Ha-08/10)
- **Input:** `{ "phone": string, "conversation_id": uuid, "type": "emergency|human_transfer", "severity": "emergency|urgent|standard", "target": "on_call_tech|owner", "guidance_sent": string|null, "context_summary": string }`
- **Op:** insert `escalations` (with the supplied `type`, `severity`, `target`); set `conversations.status='escalated'`; insert `notifications` (`kind='escalation'`, `channel` = `'on_call_tech'` when `type='emergency'`, else `'owner'`).
- **Returns:** `{ "escalation_id": uuid }`

### `log_emergency`
- **Purpose:** ensure every emergency is recorded even if escalation target is 911. (eval Ha-11/17)
- **Input:** `{ "phone": string, "conversation_id": uuid, "severity": "emergency|urgent", "target": "on_call_tech|owner", "guidance_sent": string }`
- **Op:** insert `escalations` (`type='emergency'`, supplied `severity`, and `target` — set `target='owner'` for life-safety/911 cases where no tech is dispatched, else `target='on_call_tech'`); set `conversations.status='escalated'`; insert `notifications` (`kind='escalation'`, `channel='on_call_tech'`).
- **Returns:** `{ "escalation_id": uuid }`
- **Guardrail:** `target` is required (NOT NULL in schema) — the agent/tool must always supply it; default to `'on_call_tech'` if unspecified.

### `honor_optout`
- **Purpose:** STOP / do-not-contact. (eval Ha-15)
- **Input:** `{ "phone": string }`
- **Op:** set `end_customers.opted_out=true` for `(org_id, phone)`.
- **Returns:** `{ "opted_out": true }`

### `advise_safety`
- **Purpose:** compose safety guidance from the matched emergency rule (no DB write; pure helper so the agent cites the rule). (eval Ha-01/02/17)
- **Input:** `{ "rule_guidance": string }` → **Returns:** `{ "guidance": string }`

---

## Tool → agent access matrix

| Tool | Booking | Resched/Cancel | Emergency | Pricing | Out-of-Area | FAQ |
|---|---|---|---|---|---|---|
| check_service_offered | ✅ | | | ✅ | | |
| validate_service_area | ✅ | | | | ✅ | |
| check_availability | ✅ | ✅ | | | | |
| lookup_technician | ✅ | | | | | |
| lookup_appointment | | ✅ | | | | ✅ (read) |
| get_service_pricing | ✅ | | | ✅ | | ✅ |
| get_business_facts | | | | | | ✅ |
| match_emergency_rule | | | ✅ | | | |
| advise_safety | | | ✅ | | | |
| create_appointment | ✅ | | | | | |
| update_appointment | | ✅ | | | | |
| cancel_appointment | | ✅ | | | | |
| mark_confirmed | | | | | | ✅ |
| add_waitlist | ✅ | | | | | |
| capture_notes | ✅ | | | | | ✅ |
| schedule_callback | | | | | | ✅ |
| capture_lead | ✅ | | | ✅ | ✅ | ✅ |
| escalate_to_human | | | ✅ | | | ✅ |
| log_emergency | | | ✅ | | | |
| honor_optout | | | | | | ✅ |

## Implementation note (FSM adapter seam — ED §6.6)
`check_availability`, `create_appointment`, `update_appointment`, `cancel_appointment`, `lookup_appointment` are written against a thin interface. The Supabase implementation here can be swapped for a real Jobber/Housecall Pro/ServiceTitan adapter later without changing agent prompts.
