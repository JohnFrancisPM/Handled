---
name: review-customer-app
description: Round-by-round verdicts and issues for the customer-app engineering doc review
metadata:
  type: project
---

# customer-app engineering-doc review log

Doc: `docs/customer-app/engineering/engineering-doc.md`
Sources: `docs/PRD.md`, `notepad.md` (Handled customer experience / Example Customer / Evaluations), `docs/design.md`, `docs/evals.xlsx` (50 cases: H-01..H-18, Ho-01..Ho-13, Ha-01..Ha-19 + E-00 example).

## Round 1 — 2026-10-07 — ❌ NEEDS REVISION
Overall doc is strong: covers notepad CE1-CE10, EC1-EC12, EV1-EV3, PRD functional/model/responsible-AI/guardrails, design tokens. Issues raised:
1. **Schema gap (safety-critical):** `escalate_to_human` / `log_emergency` tools + Flow D say they "write escalation + owner/tech notification" but §7 defines NO escalations/notifications table. Emergency path = launch-gate. UNRESOLVED.
2. **Schema gap (Critical eval Ho-02):** `capture_lead` has no backing leads table / dashboard surface. UNRESOLVED.
3. **Eval ID mislabel:** multi-intent is **H-06**, doc labels it "Ha-07 multi" (Ha-07 = PII+AI disclosure) in §4/§7.16/§8.3. UNRESOLVED.
4. **H-18 MMS/photo intake** not addressed nor scoped out; webhook §9.1 has only `text`. UNRESOLVED.
5. **Under-mapped eval cases** vs. doc's "routes every eval category" claim: H-15 job-status (no lookup_appointment on FAQ agent), H-12 callback, H-14 inbound reminder-confirm, H-17 waitlist, H-09 recurring plan (no recurrence in schema), Ho-12 phone/text diagnosis (High). "faq/other" catch-all too vague. UNRESOLVED.

Note: Ha-16 (two-party recording) correctly scoped out as voice-only. Text-only channel scoping is sound.

## Round 2 — 2026-10-07 — ❌ NEEDS REVISION
Re-extracted all 50 eval cases from evals.xlsx and all PRD/notepad/design requirements. **All 5 Round-1 issues genuinely resolved:** (1) `escalations`+`notifications` tables present (§7.13b/c) with write targets + dashboard surfacing; (2) `leads` table (§7.13a) + Leads page (§5) + `GET/PATCH /api/leads` (§9.2); (3) multi-intent correctly relabeled H-06 everywhere; (4) H-18 photo/MMS via `media_url` (§9.1) + `leads.photo_followup`; (5) §8.7a all-50 coverage table + `lookup_appointment` + `recurrence`/`waitlist`/`confirmed` fields + `schedule_callback`/`mark_confirmed` tools.
New issue found (1):
1. **Eval mislabel (same class as Round-1 #3):** §8.7a line 720 maps "H-05/H-07 (missed-call text-back)" as "n/a — synchronous text channel." But evals.xlsx: **H-05 = "Human requested / warm transfer"** ("Can I just talk to a real person?", High), **H-07 = missed-call text-back**. H-05 is mismapped. The warm-transfer capability exists (§8.3 General-FAQ Agent + `escalate_to_human`, §8.6) but H-05 is not in the General-FAQ eval-ref list (line 662) and is never correctly tied to its ID. Fails Correct/Consistent/Present for the all-50 coverage claim. FIX: give H-05 its own §8.7a row (human-request → General-FAQ → `escalate_to_human`, type='human_transfer'), add H-05 to line-662 eval-ref list, and leave only H-07 in the text-back row. RESOLVED in R3.

## Round 3 — 2026-10-07 — 👍 😊 APPROVED
Re-extracted all 50 eval cases fresh from evals.xlsx (H-01..18, Ho-01..13, Ha-01..19) + all PRD/notepad/design requirements. **R2 issue genuinely resolved:** §8.7a now has a dedicated H-05 row (human-request → General-FAQ → `escalate_to_human` type='human_transfer', warm handoff, no dead-end loop); H-07 is on its own row (synchronous text-back); H-05 added to the General-FAQ eval-ref list in §8.3. All 50 eval cases present with correct IDs and sound agent/tool mappings; all Critical cases (Ho-02/03, Ha-01/02/03/09/11/12/13/14/17/18) covered; Ha-16 correctly scoped out as voice-only. Every PRD functional/model/data/prompt/responsible-AI/guardrail/metric requirement, notepad CE1-10/EC1-12/EV1-3, and design tokens covered. Billing/spend-cap + outbound follow-up correctly scoped to future per PRD "later phase." Zero coverage gaps.
Minor NON-BLOCKING polish note (not a gap): the §7 ER diagram (mermaid) omits the `leads`, `escalations`, `notifications` tables that are fully defined in §7.13a/b/c — authoritative table defs are complete/correct, so no requirement is left uncovered; recommend adding them to the diagram for internal consistency on a future edit.
