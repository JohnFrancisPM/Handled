# Handled

**The AI Office Manager for Home & Local Service Businesses.**

Handled answers inbound customer texts for home-service businesses (plumbers, electricians, HVAC, etc.) — booking jobs, quoting from configured pricing, triaging emergencies, and rescheduling — then shows the owner what happened in a dashboard.

This repository is a **monorepo** that holds both the **AI-assisted build workflow** used to create Handled (`dev-os/`) and the **three web apps** it produced. Each app is built and deployed independently and does not assume the others exist.

---

## The three apps

| App | Path | Status | What it is |
|---|---|---|---|
| **Marketing website** | [`apps/website`](apps/website) | ✅ Live — [handled-website-ajik.netlify.app](https://handled-website-ajik.netlify.app) | Static-first Next.js marketing site with one lead-capture endpoint. No AI. |
| **Customer app** (dashboard) | [`apps/customer-app`](apps/customer-app) + [`n8n/`](n8n) | ✅ Live — [handled-customer-app.netlify.app](https://handled-customer-app.netlify.app) | Owner-facing Next.js dashboard over Supabase, plus a multi-agent n8n workflow that handles inbound texts. |
| **Test harness** | [`apps/test-harness`](apps/test-harness) | ✅ Built (local-only) | SMS-style tester that impersonates customers against the n8n webhook so you can watch the AI respond. |

Each app has its own `apps/<app>/README.md` with full details, and its own spec tree under `docs/<App>/`.

---

## Repository layout

```
apps/
  website/          Marketing site (Next.js 14 App Router). All its commands run from here.
  customer-app/     Owner dashboard (Next.js 14) over Supabase. All its commands run from here.
  test-harness/     SMS-style tester (Next.js 14). No DB; proxies to the n8n webhook.
n8n/                Customer-app agentic SMS backend:
                      handled-agentic.json  — the importable 52-node workflow (single webhook)
                      prompts/              — the 10 editable prompt files embedded in that workflow
                      flow-breakdown.md + diagram-*.html / images/ — how the flow works, illustrated
                      README.md             — deploy guide
supabase/
  migrations/       0001_init.sql — customer-app schema (17 tables, RLS, triggers, realtime). Run first.
  seed/             Acme Plumbing demo data, 01–06, run IN ORDER after the migration.
  *-rls.sql         Stage-7 RLS policies (run manually in the Supabase SQL editor).
scripts/            Builder-side utilities OUTSIDE the apps (eval export, n8n Cloud inliner, fixture builder).
docs/
  PRD.md            Product requirements (all apps)
  design.md         Brand design system (tokens)
  website/ customer-app/ test-harness/   Per-app engineering + implementation + security specs
  Competitive Research.md · evals.xlsx · *.pptx   Supporting research and decks
dev-os/             The stage-gated build workflow "operating system" (see dev-os/README.md)
.claude/            Slash-command skills and planner/reviewer subagents used by the build workflow
CLAUDE.md           Deep guidance for working in this repo (the fullest reference)
netlify.toml        Repo-root deploy config — this one targets apps/website only
```

> **Monorepo gotchas.** `supabase/` and the repo-root `netlify.toml` belong to specific apps, not the repo as a whole: `supabase/` is the **customer-app's** schema/data, and the root `netlify.toml` is the **website's**. The customer-app and test-harness each have their own `netlify.toml`. The test-harness has no Supabase client — it only reads the seed files at build time to generate a committed JSON fixture.

---

## Quick start

Each app is a self-contained Next.js 14 (TypeScript strict, Node 20 LTS) project. Install and run from the app's own folder:

```bash
cd apps/website        # or apps/customer-app, or apps/test-harness
npm install
npm run dev            # local dev server
```

Common scripts in every app: `npm run build`, `npm run typecheck`, `npm run lint`, `npm run test` (Vitest), `npm run test:e2e` (Playwright; first run `npx playwright install chromium`).

- **Website** — runs fully static out of the box. Optional `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` enable real lead storage; without them the form safely no-ops.
- **Customer app** — runs in read-only **demo mode** with no env set (serves seeded Acme data). Set `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (+ service role) to switch to a live Supabase project. See [`apps/customer-app/.env.example`](apps/customer-app/.env.example) — it documents every variable for the dashboard, n8n, and the eval pipeline.
- **Test harness** — runs in offline/mock mode with no env set. Point it at a live backend with `N8N_WEBHOOK_URL` + `N8N_WEBHOOK_SECRET` in `.env.local`.

---

## The AI backend (n8n + Supabase)

The customer app's AI lives in [`n8n/`](n8n), not in the Next.js app. A single importable workflow ([`handled-agentic.json`](n8n/handled-agentic.json)) exposes one webhook that runs: **validate/auth → context load → spam/injection guard → intent router → one of six specialist agents (with 20 org-scoped Supabase tools) → persist + eval**, always returning a fixed JSON envelope.

- **How it works:** [`n8n/flow-breakdown.md`](n8n/flow-breakdown.md) (with diagrams).
- **Deploy it:** [`n8n/README.md`](n8n/README.md). Secrets are referenced by `$env.*` / an n8n credential — nothing is hardcoded in the committed JSON. For n8n Cloud (which has no `$env`), inline values before import with [`scripts/build-cloud-workflow.js`](scripts/build-cloud-workflow.js).
- **Prompts:** the 10 files in [`n8n/prompts/`](n8n/prompts) are the editable copies of the prompt text that is also embedded in the workflow nodes — edit a prompt there and re-sync it into the JSON so the two don't drift.
- **Database:** apply [`supabase/migrations/0001_init.sql`](supabase/migrations), then the seed files in order (see [`supabase/seed/README.md`](supabase/seed/README.md)).

**Evaluations** come in two halves, both under the customer app: a builder-side Azure AI Foundry export ([`scripts/`](scripts)) and a graded launch-gate loop ([`apps/customer-app/tests/eval/`](apps/customer-app/tests/eval)).

---

## Deploying

There is **no Git↔Netlify auto-deploy**; each app is deployed from its own folder with the local Netlify CLI:

```bash
cd apps/website          # or apps/customer-app
npx netlify-cli deploy --build --prod
```

Running from the app folder is required so the monorepo `base`/`publish` paths resolve correctly. Full per-app instructions and caveats are in each app's README and in [`docs/website/deployment/`](docs/website/deployment). The test harness is intentionally **not** deployed — it's a local builder tool.

---

## How this repo was built

Every app was produced through a stage-gated, approval-based pipeline defined in [`dev-os/README.md`](dev-os/README.md) and driven by the skills in [`.claude/skills/`](.claude/skills): **1) engineering plan → 2) implementation specs → 3) frontend setup → 4) feature implementation → 5) testing → 6) deploy → 7) security hardening.** The spec artifacts for each stage live under `docs/<App>/`.

For the fullest working reference — architecture details, conventions, and gotchas for each app — see [`CLAUDE.md`](CLAUDE.md).
