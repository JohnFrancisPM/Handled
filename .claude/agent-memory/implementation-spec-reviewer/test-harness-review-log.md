---
name: test-harness-review-log
description: Per-round verdicts and gaps for the test-harness app implementation specs (Stage 2)
metadata:
  type: project
---

# test-harness — implementation-spec review log

App operates completely separately: NO database, NO Supabase, NO supabase-schema.sql
(locked decision — intentional; data model is a committed JSON fixture derived from the
customer-app seed SQL). Only runtime dependency is outbound HTTP to the one n8n webhook.

## Round 1 — 2026-10-08 — ✅ APPROVED

Reviewed 11 spec files + .env.example in docs/test-harness/implementation/ against the
Stage-1 engineering doc (TH-1…TH-20, §17), notepad §Test Harness/§Evaluations/demo goals,
the fixed n8n-webhook-contract.md, and eval-cases.json (50 cases).

Verdict: all 20 TH requirements + 3 locked decisions + verified-backend facts fully,
unambiguously, consistently, and buildably covered. No gaps.

Verified against actual repo sources (not just trusting the specs):
- All 30 customer names/phones in scenario-set.md §2 match seed 04 exactly.
- Conversation last_intent per customer (seed 05) matches the scenario mapping: spam
  #24/#25, Spanish #26/#27, multi #28, injection #29, status #30, emergencies #16-19,
  out_of_area #20/21, not_offered #22/23.
- Org slug in seed 01 = "acme-plumbing" = ACME_BUSINESS_ID default → live calls resolve.
- Tom Becker #6 has exactly 3 appointments (fixture-extraction §1.2 last_job claim).
- All 50 eval case_ids present in scenario-set + 5 extras tagged expected_intent:"*".
- PRD has zero harness-specific requirements (ED correctly treats it as brand context).

Sanctioned deviations from the ED (NOT flagged — caller-confirmed verified-backend facts):
- Webhook ALWAYS returns HTTP 200; proxy classifies on body.ok, never HTTP status.
- Latency 19-49s (not ED's ~3s); WEBHOOK_TIMEOUT_MS default 60000 (not ED's 10000).
- Degraded-but-200 replies displayed faithfully, distinct from unreachable/offline-mock.
All folded in consistently across README, webhook-proxy, env-and-config, graceful-
degradation, deployment, testing, .env.example.

Minor watch-item (NOT a blocking gap — buildable as specified): batch progress UX. In MVP
(non-streaming, webhook-proxy §6.5) the whole results array returns at once after a
multi-minute wait, so chat-ui §5's "progress bar driven by sent/total" is only meaningful
at resolve (streaming is Phase 2). Implementable via an indeterminate loader for MVP;
flagged to the planner as polish, not a correctness gap.
