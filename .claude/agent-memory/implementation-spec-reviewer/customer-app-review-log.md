---
name: customer-app-review-log
description: Per-round verdicts and gaps for the customer-app (Handled customer experience) Stage-2 implementation specs
metadata:
  type: project
---

# customer-app implementation-spec review log

App: `customer-app` (dashboard + Supabase + n8n agentic workflow). Specs at `docs/customer-app/implementation/`. Audited against `docs/PRD.md` + `docs/customer-app/engineering/engineering-doc.md` + notepad + `docs/design.md` + `docs/evals.xlsx` (50 cases). Text-only channel; Netlify deploy.

## Round 1 — 2026-10-07 — ❌ NEEDS REVISION (direct user audit)
Overall: specs are unusually thorough and correct. Schema is paste-and-run clean (17 tables, RLS on every table, indexes, triggers, realtime pub). All 50 eval cases mapped with correct Critical set (Ho-02, Ho-03, Ha-01/02/03/09/11/12/13/14/17/18) and emergency-recall-100% gate. 8 ready-to-paste agent prompts present. .env.example complete with server-only secrets marked. Seed covers Acme + 30 customers across eval types with researched pricing.

Blocking gaps (both: tool-insert specs omit NOT NULL columns defined in supabase-schema.sql → INSERT would fail on paste-and-run):
1. **notifications.channel** (NOT NULL, check owner|on_call_tech) is never set by any notification insert in `n8n-tools.md` (create_appointment, capture_lead, schedule_callback, escalate_to_human). Breaks create_appointment's new_booking notify (core booking flow) + H-02 after-hours summary. Fix: specify channel per insert or add a column default.
2. **escalations.target** (NOT NULL, check on_call_tech|owner) is not set by `log_emergency` in `n8n-tools.md`. Breaks emergency-recall path (Ha-11/17 etc.). Fix: log_emergency must set target.

Both are one-line mechanical fixes. Nothing else blocking found.

## Round 2 — 2026-10-07 — 👍 😊 APPROVED (direct user audit)
Both Round 1 defects verified fixed in `n8n-tools.md`:
1. **notifications.channel** — new "Notification channel convention" note (line 69) + every notification insert now sets `channel` explicitly (create/update/cancel_appointment + after_hours_summary → owner; schedule_callback/capture_lead → owner; escalate_to_human → on_call_tech for emergency, owner for human_transfer; log_emergency → on_call_tech). RESOLVED.
2. **escalations.target** — log_emergency now takes a `target` input and its Op sets target (owner for life-safety/911, else on_call_tech) with a "target required" guardrail; escalate_to_human already set target from input. RESOLVED.
No new inconsistency introduced. Full re-audit across dashboard + Supabase + n8n + eval pipeline: all 50 eval cases mapped, every write-tool insert now satisfies schema NOT NULL/CHECK columns, .env complete, RLS consistent, seed covers eval types.
Minor NON-BLOCKING notes (did not block approval; valid values exist, requirement met):
- Fallback path (n8n-workflow §10, n8n-agent-prompts §9) says "create an owner notifications/escalations row" on internal error, but no `kind`/`type` enum value cleanly fits a system incident; implementer should use kind='escalation'/channel='owner' (and skip the escalations row, or type='emergency' only if emergency-flagged).
- escalate_to_human/log_emergency/schedule_callback insert into tables with NOT NULL end_customer_id but only name phone as input; end_customer_id resolution from (org_id, phone) is implied by the universal Context Loader resolve/create — explicit would be cleaner.
- cancel_appointment uses notifications kind='new_booking' for a cancellation (constraint-valid but semantically odd).
