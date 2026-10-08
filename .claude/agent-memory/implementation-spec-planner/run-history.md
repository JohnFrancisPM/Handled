---
name: run-history
description: Run log for the implementation-spec-planner agent (app, cycles, reviewer verdicts)
metadata:
  type: project
---

Run history. Newest first.

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
