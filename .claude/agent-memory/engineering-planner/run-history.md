---
name: run-history
description: Log of engineering-planner runs — app, self-review cycles, reviewer round-trips, verdict
metadata:
  type: project
---

Run history (newest first):

- **2026-10-07 — app: `customer-app`.** Planned the full Handled customer experience in one doc: Next.js dashboard (`apps/customer-app`), Supabase data model (`supabase/`), and n8n multi-agent backend (`n8n/`). Text/SMS-only build per notepad Evaluations (voice = future seam). Key work: multi-agent topology (Haiku spam/injection guard + intent router → 6 Sonnet specialist agents → org-scoped tool layer → persistence/eval-extraction), single reused webhook contract, phone-keyed end-customer model, conversation memory with eval fields (question/response/citation/reasoning), Azure Foundry export, Acme + 30-customer seed spanning eval types. 1 self-review cycle (added human-transfer/discriminatory/recording-consent coverage before handoff). Reviewer round-trips: **3**. R1 ❌ (5 gaps: missing escalations/notifications tables, missing leads table+surface, H-06 multi-intent mislabeled Ha-07, H-18 photo/MMS unscoped, several eval cases unmapped). R2 ❌ (1 gap: H-05 human-transfer mismapped as missed-call text-back). R3 **👍 😊 APPROVED (zero gaps, all 50 eval cases mapped).** Applied the non-blocking ER-diagram polish after approval. Doc ready for Stage 2.
  - Lessons: (a) when asserting "handles every eval category," include an explicit case-by-case mapping table — reviewer checks each of the 50 IDs against evals.xlsx and catches mislabels (Ha-07 vs H-06, H-05 vs H-07). (b) Every tool that writes (`capture_lead`, `escalate_to_human`, `log_emergency`) needs a concrete backing table in the schema, or it reads as a hole. See [[decisions-customer-app]].

- **2026-10-07 — app: `website`.** An engineering doc already existed from a prior run (comprehensive, 14 sections). Self-review found 2 minor gaps vs notepad "Handled company website": (W1) IA "based on competitor websites" not explicit, and (D1) competitive-research sourcing of messaging not explicit. Closed both with targeted edits to Sections 1 & 2. Self-review then clean (15/15 checklist items). Handed to engineering-reviewer. **Verdict: 👍 😊 APPROVED (round 1, zero gaps, 14/14 requirements pass).** 1 self-review cycle, 1 reviewer round-trip. Doc ready for Stage 2.
