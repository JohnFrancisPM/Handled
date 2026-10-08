---
name: run-history
description: Run log for the implementation-spec-planner agent (app, cycles, reviewer verdicts)
metadata:
  type: project
---

Run history. Newest first.

## 2026-10-08 — app: test-harness
- Invocation: explicit, Stage 2 for test-harness.
- Inputs read in full: ED (`docs/test-harness/engineering/engineering-doc.md`), notepad
  (Test Harness/Evaluations/demo goals), n8n-webhook-contract, n8n-tools, eval-cases.json
  (50 cases), design.md, seed 01/04/05/06 + seed README, customer-app conventions
  (envelope/env/netlify/tsconfig/next.config).
- Produced 11 deliverables under docs/test-harness/implementation/: README, project-setup,
  env-and-config, fixture-extraction (data model, replaces supabase-schema.sql — no DB),
  scenario-set, webhook-proxy, graceful-degradation, chat-ui, design-system-setup, testing,
  deployment + `.env.example`. NO supabase-schema.sql (intentional, no DB — documented).
- Folded coordinator verified-backend facts: webhook always HTTP 200 → classify on body.ok;
  latency 19–49s → 60s timeout; degraded-200 shown faithfully, distinct from unreachable.
- Self-review: traceability vs ED §17 TH-1..TH-20 + 3 locked decisions + 4 verified facts →
  zero gaps before reviewer handoff.
- Reviewer round-trips: 1. Round 1 = 👍 😊 APPROVED, zero blocking gaps. One non-blocking
  Phase-2 watch-item (batch progress is indeterminate in MVP since results return as one
  array; streaming deferred — reviewer confirmed buildable as written).
- Final verdict: 👍 😊 APPROVED (round 1). 11 spec files + .env.example under
  docs/test-harness/implementation/.
- Lesson: when the app has no DB, document the supabase-schema.sql omission in README with
  rationale up front — reviewer accepted it immediately rather than flagging the skill's
  "always include SQL" rule.

## 2026-10-07 — app: customer-app
- Invocation: explicit, "Run implementation-spec-planner for AppName=customer-app".
- Inputs read in full: ED (`docs/customer-app/engineering/engineering-doc.md`, 988 lines), PRD, notepad (CE/EC/EV), design.md, evals.xlsx (all 3 sheets — 50 cases + launch gates extracted programmatically).
- Produced 16 deliverables under `docs/customer-app/implementation/` across 3 sub-systems (dashboard, Supabase, n8n) incl. `supabase-schema.sql`, `.env.example`, seed-data spec, 4 n8n specs (webhook/workflow/tools/prompts), eval-pipeline mapping all 50 cases.
- Self-review: caught + fixed (a) literal duplicate keys in `.env.example`, (b) missing `notifications/[id]` route in folder tree, (c) unacknowledged retention/deletion surface, (d) a real plpgsql bug — `%I_sel` produced invalid policy identifiers; rewrote to `%I` with `t||'_sel'`.
- Reviewer round-trips: 2. Round 1 = NEEDS REVISION, 2 blocking defects: notification inserts omitted NOT NULL `notifications.channel`; `log_emergency` omitted NOT NULL `escalations.target`. Fixed both in `n8n-tools.md` (explicit channel convention + target). Round 2 = 👍 😊 APPROVED (plus 3 non-blocking nits; applied 2 cheap clarity edits — explicit end_customer_id resolution note + defined fallback-notification enum kind='escalation'/channel='owner'; left the cancel→new_booking naming nit to avoid a schema enum change).
- Final verdict: 👍 😊 APPROVED. 16 spec files under docs/customer-app/implementation/.
- Lesson: when a tool spec says "insert row X", cross-check EVERY NOT NULL column without a default in the schema is supplied; reviewer checks tool-insert ↔ schema consistency.

## 2026-10-07 — app: website
- Invocation: explicit, "Run implementation-spec-planner for AppName=website".
- Inputs read in full: ED (`docs/website/engineering/engineering-doc.md`), PRD, notepad "Handled company website", design.md, Competitive Research.
- Produced 18 deliverables under `docs/website/implementation/` (16 `.md` specs + `supabase-schema.sql` + `.env.example`).
- Self-review: 1 pass against a 40-item traceability matrix (R1–R40) → zero gaps.
- Reviewer round-trips: 2. Round 1 = NEEDS REVISION (one low-sev issue: stray `NEXT_PUBLIC_SITE_URL` in `.env.example` wired to nothing, contradicting ED §12). Fixed via removal (kept `site.url` in content/site.ts as single hardcoded base URL). Round 2 = APPROVED.
- Final verdict: 👍 😊 APPROVED.
- Lesson: ED §12 says no NEXT_PUBLIC_* vars for the website MVP; don't introduce public/base-URL env vars unless a spec actually wires them.
