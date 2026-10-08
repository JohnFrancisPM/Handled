# n8n Webhook Contract (shared with the Test Harness + future SMS gateway)

**Sub-system:** n8n agentic backend
**Source:** engineering-doc §9.1
**This is the single agentic entry point.** The Test Harness (separate app) and a future real SMS gateway both POST to this exact endpoint. This file FIXES the contract so the Test Harness run can build against it without ambiguity.

---

## Endpoint

```
POST {N8N_WEBHOOK_URL}         # e.g. https://<n8n-host>/webhook/handled/message
```

- **Auth:** header `X-Handled-Secret: <N8N_WEBHOOK_SECRET>` (server-to-server shared secret).
- **Content-Type:** `application/json`

---

## Request body

```jsonc
{
  "business_id": "acme-plumbing",        // REQUIRED. org slug OR org uuid. Must resolve to an organization.
  "from_phone": "+15551230001",          // REQUIRED. E.164-ish. This is the end-customer ID.
  "text": "My kitchen sink is clogged, can someone come out?", // REQUIRED. 1–2000 chars.
  "channel": "sms",                      // OPTIONAL. default "sms".
  "customer_name": "Jane Doe",           // OPTIONAL. If the sender knows it.
  "media_url": "https://.../photo.jpg",  // OPTIONAL. Attached photo (MMS). Attached to a lead; image understanding is out of scope.
  "message_id": "th-0001"                // OPTIONAL. Idempotency key; dedupes retries.
}
```

### Validation rules
| Field | Rule | On failure |
|---|---|---|
| `business_id` | present, resolves to an org | `404 unknown_business` |
| `from_phone` | present, matches `^\+?[0-9]{7,15}$` | `400 validation` |
| `text` | present, 1–2000 chars | `400 validation` |
| `X-Handled-Secret` | present, equals `N8N_WEBHOOK_SECRET` | `401 unauthorized` |
| opted-out sender | if `end_customers.opted_out=true` | `200` with a compliant message, no further processing |

---

## Response body (200)

```jsonc
{
  "ok": true,
  "reply": "I can help with that. You're in Forest Hills — I have Wed 9am or Thu 1pm. Which works?",
  "intent": "book",                      // book|reschedule|cancel|emergency|pricing|out_of_area|faq|spam|injection|fallback
  "agent": "new_booking",                // which node handled it (or "guard")
  "actions": [                           // tools run this turn + key results
    { "type": "check_availability", "slots": 2 },
    { "type": "create_appointment", "appointment_id": "uuid", "price": 180 }
  ],
  "conversation_id": "uuid",
  "message_id": "uuid",                  // the persisted assistant message id
  "billed": true,                        // false for spam
  "eval": {
    "question": "My kitchen sink is clogged, can someone come out?",
    "response": "...reply...",
    "citation": "service_pricing#drain_clearing, check_availability",
    "reasoning": "Service offered (drain), address in Queens (served), offered real slots, awaited confirm."
  }
}
```

### Response variants
| Case | Shape |
|---|---|
| Normal | as above, `ok:true`, `reply` text, `billed:true` |
| Spam (eval Ha-06) | `200 { "ok": true, "intent": "spam", "reply": null, "billed": false }` — no owner notify |
| Injection (eval Ha-12) | `200 { "ok": true, "intent": "injection", "reply": "<safe in-role refusal>", "billed": true }` |
| Emergency (eval Ha-01…) | `intent:"emergency"`, `actions` include `escalate_to_human`/`log_emergency`, `reply` = safety guidance |
| Opt-out (eval Ha-15) | `200 { "ok": true, "intent": "faq", "reply": "You're unsubscribed. Text START to opt back in." }` |
| Internal error (eval Ha-09) | `200 { "ok": true, "intent": "fallback", "reply": "<safe fallback>", "billed": false }` — never a hard failure to the sender |

### Error responses
| Status | Body |
|---|---|
| `400` | `{ "ok": false, "error": "validation", "detail": "..." }` |
| `401` | `{ "ok": false, "error": "unauthorized" }` |
| `404` | `{ "ok": false, "error": "unknown_business" }` |

> Design rule: the ONLY hard error statuses are 400/401/404 (sender-fixable). Any downstream LLM/tool/DB failure returns `200` with a safe fallback `reply` so the sender never sees a 500 (reliability; eval Ha-09).

---

## Idempotency
If `message_id` is provided and a message with that external id was already processed for this `(org, phone)`, return the stored prior response instead of re-running the flow. Store the external `message_id` in `messages.tool_calls->>'external_message_id'` (or a dedicated column if added later).

---

## Latency target
Webhook round-trip **< ~3s** typical for text (ED §8.6). The cheap Haiku guard short-circuits spam/injection before any Sonnet call. This satisfies the PRD's <30s "text-back" SLA with wide margin (eval H-07 — the synchronous reply IS the instant text-back).

---

## Test-Harness usage (informative)
The Test Harness POSTs with the 30 seeded `from_phone` values and renders `reply` as an SMS bubble. It needs only: the endpoint URL, the `X-Handled-Secret`, and this schema. No other coupling. The harness's own UI is designed in its separate run.
