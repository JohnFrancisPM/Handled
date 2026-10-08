---
name: decisions-customer-app
description: Key Stage-2 implementation-spec decisions for the customer-app (dashboard + Supabase + n8n) and rationale
metadata:
  type: project
---

Stage-2 implementation specs for the Handled customer experience live in `docs/customer-app/implementation/` (app-scoped, matching the website precedent — NOT the skill default `docs/specs/`). 15 deliverables covering 3 sub-systems: dashboard (`apps/customer-app`), Supabase data model, n8n agentic workflow.

**Why:** monorepo of 3 apps; specs namespaced per app under `docs/[AppName]/implementation/` to mirror `docs/[AppName]/engineering/`.

**Spec file set:** `README.md` (index + traceability), `supabase-schema.sql`, `database.md`, `seed-data.md`, `n8n-webhook-contract.md`, `n8n-workflow.md`, `n8n-tools.md`, `n8n-agent-prompts.md`, `project-setup.md`, `design-system-setup.md`, `auth-and-middleware.md`, `dashboard-api.md`, `dashboard-pages.md`, `eval-pipeline.md`, `testing.md`, `.env.example`.

**Resolved decisions (keep consistent with ED):**
- Text/SMS channel only; voice is a documented future seam. Phone = end-customer ID.
- Deploy dashboard on **Netlify** (ED §15) — same as website. No Vercel.
- 17 tables incl. dashboard_users; RLS on every table via `public.current_org_id()` SECURITY DEFINER helper.
- RLS split: config tables = authenticated full CRUD (owner self-serve); operational tables (conversations/messages/appointments/end_customers/escalations) = authenticated SELECT only (written by n8n service-role); leads/notifications = SELECT+UPDATE; eval_exports = SELECT+INSERT. Service-role (n8n + Route Handlers) bypasses RLS; org scoping enforced in tool/handler layer.
- n8n topology: Haiku spam/injection guard + Haiku intent router → 6 Sonnet specialists (new-booking, reschedule-cancel, emergency-triage, pricing-quote, out-of-area, general-faq) → shared org-scoped tool layer → persist+eval-extractor → respond; error-trigger fallback (Ha-09, never a 500 to sender).
- Agent prompts are ACTUAL ready-to-paste text in `n8n-agent-prompts.md` (shared guardrail preamble + 8 prompts + fallback template), all emit one strict-JSON output schema incl. eval {question,response,citation,reasoning}.
- All 50 evals.xlsx cases (H-01..18, Ho-01..13, Ha-01..19) mapped case-by-case in `eval-pipeline.md` §3 with pass criteria; launch gates = any Critical fails blocks + emergency recall must=100%.
- Researched Acme pricing ranges seeded in `seed-data.md` §02; "full repipe" deliberately un-priced to exercise Ho-02 (Critical, lead unknown_price).
- Eval export = Azure AI Foundry JSONL {question,response,citation,reasoning,ground_truth?,category}.

**Gotcha fixed in self-review (reuse next time):** in a plpgsql `DO` loop that creates per-table RLS policies, build the policy name as a single identifier passed to one `%I` (e.g. `format('create policy %I on public.%I ...', t||'_sel', t)`). Writing `%I_sel` is WRONG — it quotes only the table (`"business_profiles"_sel`) and is invalid SQL.
