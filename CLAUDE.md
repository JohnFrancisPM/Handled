# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`Handled` is a **monorepo** that houses an **AI-assisted build workflow** (`dev-os/`) and the **apps it produces**. It is the capstone project for building Handled — "the AI office manager for home & local service businesses" — as **three separate web apps** (see `notepad.md` and `docs/PRD.md` for the product brief):

| App | Location | Status | What it is |
|---|---|---|---|
| **Marketing website** | `apps/website` | ✅ **Built & live** (Stages 1–7 done, deployed to Netlify) | Static-first public site. No AI; marketing + one lead-capture endpoint. |
| **Customer experience** | `apps/customer-app` + `n8n/` | ✅ **Built, deployed & hardened, Stages 1–7** (dashboard + Supabase schema/seed + n8n agentic backend + tests; live on its own Netlify site `handled-customer-app.netlify.app`; scoped Stage-7 review done — security headers, RLS re-assertion, logout). | Owner-facing Next.js dashboard + a one-webhook multi-agent n8n backend over Supabase. |
| **Test harness** | `apps/test-harness` | ✅ **Built & hardened, Stages 1–5 + 7** (local-only; Stage 6 deploy intentionally skipped — it's a builder tool). Standalone SMS-style tester over the n8n webhook; 57 Vitest + 9 Playwright tests incl. axe AA. | Standalone app to impersonate customers over SMS-style chat and watch the AI respond. |

Each app is built independently through the stage-gated workflow below, gets its own `apps/<app>/` folder and its own `docs/<App>/` spec tree, and must not assume the others exist. **All three apps exist today** — the sections below are per-app. (The planned **Evaluations** work is summarized under "Planned/other work.")

## Layout

```
apps/
  website/             The marketing site (Next.js 14 App Router). ALL its commands run from here.
  customer-app/        Handled customer experience dashboard (Next.js 14). ALL its commands run from here.
  test-harness/        SMS-style tester (Next.js 14). Decoupled: no DB, proxies to the n8n webhook. ALL its commands run from here.
n8n/                   Customer-app agentic SMS backend: handled-agentic.json (importable workflow) + prompts/ (10 verbatim prompts) + README (deploy guide). See "n8n backend" below.
scripts/               Builder-side utilities (OUTSIDE the apps): export-evals.ts/.sql + eval-jsonl.ts (pure, unit-testable row builder) — Azure AI Foundry eval export (direct DB pull, service-role); build-cloud-workflow.js — n8n Cloud (Starter) inliner; build-harness-fixture.ts — test-harness fixture builder (parses supabase/seed SQL → apps/test-harness/fixtures/customers.json; exports a pure buildCustomers() for tests).
supabase/
  migrations/0001_init.sql   Customer-app schema: 17 tables, RLS, triggers, realtime. Run first.
  seed/                      Acme Plumbing demo data, numbered 01–06 — run IN ORDER after the migration (see seed/README.md).
  rls-policies.sql           Website Stage 7 RLS (run manually in Supabase SQL Editor — not auto-applied).
  customer-app-rls.sql       Customer-app Stage 7 RLS re-assertion (FORCE RLS + anon revoke + org policies; run manually, after the migration + seed).
docs/
  PRD.md               Product requirements (all apps)   ·   design.md  Brand design system (tokens)
  Competitive Research.md · evals.xlsx   Supporting research / eval insights
  website/             Website specs: engineering/ (HLD), implementation/ (per-concern + supabase-schema.sql + .env.example), deployment/ (netlify-deploy.md)
  customer-app/        Customer-app specs: engineering/engineering-doc.md + implementation/*.md (incl. n8n-*.md, supabase-schema.sql, .env.example, eval-pipeline.md, seed-data.md) + security/security-plan.md (Stage 7 review)
  test-harness/        Test-harness specs: engineering/engineering-doc.md + implementation/*.md (fixture-extraction, webhook-proxy, scenario-set, chat-ui, graceful-degradation, env-and-config, testing, deployment, .env.example) + security/security-plan.md (scoped Stage 7 review)
  security/            security-plan.md (website Stage 7 review)
dev-os/                The stage-gated build workflow "operating system" (see dev-os/README.md)
.claude/skills/        Slash-command skills (engineering-planner, implementation-specs, frontend-setup, design-system, security-foundation)
.claude/agents/        Planner/reviewer subagents  ·  .claude/agent-memory/  their persisted notes
netlify.toml           REPO-ROOT deploy config targets apps/website (base = apps/website, Next runtime). apps/customer-app and apps/test-harness each have their OWN netlify.toml for SEPARATE sites (the test-harness one is config-only — it's run locally, not deployed).
```

> **Monorepo gotcha:** `supabase/` holds files for the **customer-app** — the `migrations/` + `seed/` trees are its schema/data; `rls-policies.sql` is the **website** Stage-7 review while `customer-app-rls.sql` is the **customer-app's**. The **test-harness** has NO Supabase files; it only reads `supabase/seed/01,04,05,06` **at build time** (via `scripts/build-harness-fixture.ts`) to generate its committed fixture. Likewise the repo-root `netlify.toml` is the website's; the customer-app's is `apps/customer-app/netlify.toml`. Don't cross them.

---

## Website app (`apps/website`)

A static-first **Next.js 14 (App Router), TypeScript strict** marketing site. Stages 1–7 complete; **live on Netlify** (`handled-website-ajik.netlify.app`).

### Commands (run from `apps/website/`)

```bash
npm run dev          # local dev server
npm run build        # production build — static pages + /api/leads function
npm run typecheck    # tsc --noEmit (strict); run before build when changing types
npm run lint         # next lint
npm run test         # Vitest unit + integration (jsdom), tests/**/*.test.{ts,tsx}
npm run test:watch   # Vitest watch mode
npm run test:e2e     # Playwright E2E incl. axe-core a11y (first: npx playwright install chromium)
```

Run a single test: `npm run test -- tests/path/to/file.test.ts` · a single E2E spec: `npm run test:e2e -- tests/e2e/foo.spec.ts`.

Node **20 LTS** (pinned for Netlify in `netlify.toml`). The `@/` import alias maps to the `apps/website` root (configured in `tsconfig.json`, `vitest.config.ts`, and `playwright.config.ts` — keep all three in sync).

### Architecture

**Content-driven pages.** Page files in `app/*/page.tsx` contain almost no literal copy. They import typed data from `content/*.ts` (e.g. `pricing.ts`, `faqs.ts`, `comparison.ts`, `nav.ts`, `site.ts`) and pass it into presentational components in `components/marketing/`. To change site copy, edit the `content/` module — not the page or the component. `content/site.ts` is the single source for brand name, URLs, CTAs, and the trades list. It also holds `loginCta` — the site's **one cross-app link**, a hardcoded URL to the customer-app dashboard login (`handled-customer-app.netlify.app/login`), rendered as a "Log in" button in `Nav.tsx` + `MobileNav.tsx`. If the dashboard's domain changes, update it here.

**Design tokens are the only styling source.** Raw token values live as CSS variables in `app/globals.css`, are exposed to Tailwind in `tailwind.config.ts` (e.g. `bg-brand`, `text-grey-900`, spacing scale, radii), and are enforced by the **design-system skill**. Never introduce arbitrary hex colors, spacing, or font sizes — only use tokens / the Tailwind classes wired to them. Apply `/design-system` whenever writing UI.

**Lead capture is the only dynamic surface.** Everything else is statically generated. `POST /api/leads` (`app/api/leads/route.ts`, `runtime = "nodejs"`, `force-dynamic`) is the one Route Handler. Its pipeline:
- Shared Zod schema in `lib/validation/lead.ts` validates both client and server (keep them using the same schema).
- Anti-spam: `company` honeypot + `MIN_FILL_MS` min-fill-time + in-memory IP rate limit (`lib/rate-limit.ts`, 5 / 10 min) + a 16 KB request body cap.
- `lib/supabase/server.ts` `getSupabaseAdmin()` returns `null` when env is absent. The handler then **gracefully no-ops** — returns `200 {ok:true, stored:false}` so a demo never fails. Preserve this graceful-degradation behavior; it is intentional, not a bug.

**Supabase is server-only.** The service-role key is used solely inside the leads route. There are deliberately **no `NEXT_PUBLIC_*` variables** — the browser never talks to Supabase. Never add a `NEXT_PUBLIC_` prefix to the Supabase vars; that would leak the key to the client.

**Security headers** live in `next.config.mjs` (`async headers()`): CSP (all `'self'`, `'unsafe-inline'` required for scripts/styles because static pages are CDN-cached and can't use nonces), `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS. See `docs/security/security-plan.md` for the rationale and the accepted deferral (the in-memory rate limiter is per-instance on Netlify Functions).

**SEO.** `lib/seo.ts` centralizes metadata (`baseMetadata` / `pageMetadata`); `app/sitemap.ts` and `app/robots.ts` generate `sitemap.xml` / `robots.txt`. All derive their origin from `site.url` in `content/site.ts` — after deploying to a non-final domain, update `site.url` there (no env override by design) and redeploy, or canonical/OG/sitemap URLs point at `handled.ai`.

### Deploying the website

There is **no Git↔Netlify connection**, so pushing to `main` does not auto-deploy. The repo root is linked to the `handled-website-ajik` Netlify site; the repo-root `netlify.toml` sets `base = apps/website`, `publish = ".next"`, `npm run build`, and Node 20.

**Deploy with the local Netlify CLI — run it from `apps/website`, NOT the repo root:**

```bash
cd apps/website
npx netlify-cli deploy --build --prod
```

Run from the repo root the CLI resolves `publish = ".next"` relative to the repo root (`/Handled/.next`) instead of under `base`, and the `@netlify/plugin-nextjs` step fails with *"publish directory was not found"*. Run from `apps/website`, `publish` resolves to `apps/website/.next` and it works. (`publish = ".next"` must stay in the toml — a stale UI publish value otherwise equals the base dir and breaks the plugin; it resolves correctly for Netlify's own cloud build.)

The **Netlify MCP connector** (`deploy-site`) is an alternative — a full-repo upload + cloud build, which resolves `base`/`publish` correctly for the website (unlike the customer-app) — but its upload does not fully respect `.gitignore`, so remove `node_modules`/`.next` first or it 413s. Full handoff (incl. the Git-CD alternative): `docs/website/deployment/netlify-deploy.md`. Optional server-only env vars `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` enable real lead storage; without them the form no-ops.

---

## Customer-app (`apps/customer-app` + `n8n/`)

The Handled customer experience: an owner-facing **Next.js 14 (App Router), TypeScript strict** dashboard (`apps/customer-app`) over a **Supabase** database, plus a **multi-agent n8n workflow** (`n8n/`) that is the single AI entry point for inbound end-customer texts. Built through Stage 7: features + tests, **deployed** to its own Netlify site (`handled-customer-app.netlify.app`, separate from the website), and **security-hardened** (scoped Stage-7 review — see `docs/customer-app/security/security-plan.md` + `supabase/customer-app-rls.sql`). Specs: `docs/customer-app/engineering/engineering-doc.md` + `docs/customer-app/implementation/*.md` (test plan: `testing.md`).

### Commands (run from `apps/customer-app/`)

```bash
npm run dev          # local dev server
npm run build        # production build (App Router pages + Route Handlers → Netlify Functions)
npm run typecheck    # tsc --noEmit (strict)
npm run lint         # next lint
npm run test         # Vitest (jsdom) — tests/unit + tests/integration
npm run test:watch   # Vitest watch
npm run test:e2e     # Playwright E2E (first: npx playwright install chromium)
```

Same single-test invocation as the website (`npm run test -- <file>`). Node **20 LTS**. The `@/` alias maps to the `apps/customer-app` root. The dashboard libs are React Query + Zustand + React Hook Form + Zod + Recharts (charts) + lucide-react.

### Architecture

**Demo mode is the backbone — and it differs from the website.** Unlike the website (no `NEXT_PUBLIC_*`), the dashboard's browser **does** talk to Supabase, so it uses `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (RLS-enforced, browser-safe). When that auth env is **absent**, the app runs **read-only demo mode**: `middleware.ts` passes through without redirecting, and handlers serve seeded Acme data for `NEXT_PUBLIC_DEMO_ORG_SLUG`. This exists so the recorded demo cannot hard-fail — preserve it. All env access goes through `lib/env.ts` (`isDemoMode()`, `hasServiceRole()`); Stage-4 code must **not** read `process.env` directly.

**Two Supabase clients, strict server/browser split** (`lib/supabase/server.ts`): `getSupabaseServer()` = SSR anon+cookie client for session/org resolution (`getSessionOrg()` joins `dashboard_users` on `auth.uid()`); `getSupabaseAdmin()` = service-role client, **server-only, bypasses RLS**, so every caller MUST re-check `org_id` from the session. `SUPABASE_SERVICE_ROLE_KEY` is server-only — never prefix it `NEXT_PUBLIC_`.

**Route Handlers return a typed envelope.** Every handler under `app/api/**` is `runtime = "nodejs"`, `force-dynamic`, and returns `{ok:true,data} | {ok:false,error}` via `ok()` / `fail(code)` in `lib/api/envelope.ts` (codes → statuses: unauthorized 401, not_found 404, validation 422, server 500). Pattern: resolve `getContext()` → `fail("unauthorized")` if null → call a `lib/data/*` function → `ok(data)`. Errors never leak internal detail or the service-role key. Data access lives in `lib/data/` (`context.ts`, `dashboard.ts`, `mutations.ts`) — keep DB queries there, not inline in routes.

**Design tokens only** — same rule and `/design-system` skill as the website (tokens in `app/globals.css` + `tailwind.config.ts`; chart colors in `lib/charts/palette.ts`). No arbitrary hex/spacing/type.

**Supabase schema.** `supabase/migrations/0001_init.sql` creates 17 tables with RLS, triggers, and realtime. Seed with `supabase/seed/01…06_*.sql` **in numeric order, after** the migration (`seed/README.md`). The seed deliberately does **not** insert the owner `dashboard_users` row (it FKs `auth.users`) — dashboard login is set up manually. Schema is mirrored in `docs/customer-app/implementation/supabase-schema.sql`.

### Deploying the customer-app

Live at `handled-customer-app.netlify.app` on its **own Netlify site** (`handled-customer-app`), separate from the website's site. There's no Git↔Netlify auto-deploy.

**Deploy with the local Netlify CLI, from `apps/customer-app`:**

```bash
cd apps/customer-app
npx netlify-cli deploy --build --prod   # local build (incl. @netlify/plugin-nextjs) + prod upload
```

This builds locally and uploads the prebuilt output. It works because the CLI runs against the **real git root**, so `apps/customer-app/netlify.toml`'s `base = "apps/customer-app"` resolves correctly. The config (`base`, `@netlify/plugin-nextjs`, Node 20) is `apps/customer-app/netlify.toml` — **not** the repo-root `netlify.toml`, which is the website's. The `.netlify/` link state (`state.json` → the site id) and the generated build output are gitignored.

**Do NOT use the Netlify MCP connector (`deploy-site`) for this app.** It uploads only the `apps/customer-app` subdir as the build root, so `base = "apps/customer-app"` then points at a nonexistent nested dir and the build fails at config parsing (`Base directory does not exist`). A full-repo upload would instead read the root `netlify.toml` and build the *website*. The local CLI is the only path that resolves the monorepo correctly here.

Netlify serves its own `Strict-Transport-Security` (1-year), which supersedes the 2-year value in `next.config.mjs`; the other security headers (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, nosniff) come from `next.config.mjs`. Setting the dashboard's Supabase auth env (`NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY`, service role) switches it out of read-only demo mode.

### n8n backend (`n8n/`)

One importable workflow, `n8n/handled-agentic.json` (52 nodes), is the **single agentic webhook**: `POST /webhook/handled/message` runs **Validate/Auth → Context Loader → spam/injection Guard (Haiku) → intent Router (Haiku) → one of 6 specialist agents (shared Sonnet node) → 20 org-scoped Supabase REST tools → Persist+Eval**, and always returns a fixed JSON envelope (even failures return `200` with an `intent:"fallback"` reply — never a 500). The request/response contract is fixed in `docs/customer-app/implementation/n8n-webhook-contract.md`; tools and the tool→agent matrix in `n8n-tools.md`; prompts in `n8n-agent-prompts.md`.

- **Deploy:** import the JSON (Workflows → Import from File), pick an **Anthropic** credential on the `Claude Sonnet (Specialist)` node, set env, Save, toggle **Active**. Full guide: [`n8n/README.md`](n8n/README.md).
- **Secrets are referenced by name — nothing hardcoded.** Required n8n env: `N8N_WEBHOOK_SECRET` (must equal inbound `X-Handled-Secret`), `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, and `ANTHROPIC_MODEL_GUARD` / `_ROUTER` (Haiku-class) / `_SPECIALIST` (**dated** Sonnet id, e.g. `claude-sonnet-4-5-20250929` — the LangChain model node rejects the undated alias). Claude auth is a **credential, not an env var**: all three model nodes (Specialist + the Guard/Router HTTP nodes, via `predefinedCredentialType`/`anthropicApi`) use one n8n Anthropic credential you pick on import — there is no `ANTHROPIC_API_KEY`. The schema must be migrated + seeded first.
- **n8n Cloud (Starter) has no `$env`.** Custom `$env` is blocked and Variables (`$vars`) are Pro+. Inline the values before import with `scripts/build-cloud-workflow.js` (reads the 3 required vars + optional model ids from your shell; keeps secrets out of chat/git), then pick the Anthropic credential on the three model nodes.
- **`prompts/` ↔ node sync:** the 10 prompt files are the editable copies of text **also embedded in the workflow nodes**. Edit a prompt file → re-embed it into the node, or they drift (the import runs whatever is in the JSON, not the `.md`).
- **Prompt structure:** every prompt is an XML-tag template in the fixed order `<Role>` · `<Instruction>` · `<Context>` · `<Examples>` · `<Task>` · `<OutputFormat>` · `<Guardrails>` (omit an empty tag). `shared-preamble.md` is the **single source of truth** for the four blocks embedded *identically* into all 6 specialists — base `<Role>`, `<Context>`, `<OutputFormat>`, and the 8-rule `<Guardrails>`; each specialist adds only its own role line, `<Instruction>`, `<Task>` (numbered, with inline `(eval …)` IDs), and `Tools for this agent:`. `guard.md`/`router.md` are classifier-only and don't use the shared blocks. So edit a shared block in `shared-preamble.md` first, then re-sync all 6 specialist files **and** the JSON.
- Env for the dashboard side (and the whole system) is documented once in `apps/customer-app/.env.example`, annotated per consumer (dashboard / n8n / eval).

### Evals — two separate halves

1. **Builder-side export** (`scripts/`): `export-evals.ts` pulls scored assistant turns and writes an Azure AI Foundry JSONL (`{question,response,citation,reasoning}` per row) + an `eval_exports` audit row. It delegates the pure DB-rows→JSONL transform to `eval-jsonl.ts` (unit-tested without a DB). Runs **outside** the app (service-role, direct DB pull) — there is deliberately no dashboard Evals page or `/api/evals/export` route. See `scripts/README.md` and `docs/customer-app/implementation/eval-pipeline.md`.
2. **Graded launch-gate loop** (`apps/customer-app/tests/eval/`): the 50 `evals.xlsx` cases (committed as `eval-cases.json`) run through the live agent via `run-eval.ts` (a standalone `tsx` script — **not** a `*.test.ts`, so `npm run test` skips it), scored by the pure `score.ts` (which *is* unit-tested in `tests/unit/eval-scoring.test.ts`). It enforces the gates **any Critical failure blocks launch; emergency recall must = 100%**. It has **not** been run here (no reachable n8n/Anthropic) — run it against the deployed n8n webhook once that backend is live (the dashboard is deployed; importing/activating the n8n workflow is a separate step). See `tests/eval/README.md`.

---

## Test harness app (`apps/test-harness`)

A standalone **Next.js 14 (App Router), TypeScript strict** SMS-style tester. Stages 1–5 + 7 complete; **runs locally only** — Stage 6 deploy was intentionally skipped (it's a builder/demo tool, not a public surface). Specs: `docs/test-harness/engineering/engineering-doc.md` + `docs/test-harness/implementation/*.md`.

### Commands (run from `apps/test-harness/`)

```bash
npm run dev            # local dev server
npm run build          # production build (App Router page + 3 Route Handlers → Functions)
npm run typecheck      # tsc --noEmit (strict)
npm run lint           # next lint
npm run test           # Vitest (jsdom) — tests/unit + tests/integration (57 tests)
npm run test:e2e       # Playwright + axe a11y (first: npx playwright install chromium) (9 tests)
npm run build:fixture  # regenerate fixtures/customers.json from supabase/seed (builder-side)
```

Single test: `npm run test -- tests/unit/<file>.test.ts`. Node **20 LTS**; the `@/` alias maps to the `apps/test-harness` root (tsconfig/vitest/playwright kept in sync). Libs: React Query + Zustand + React Hook Form + Zod + lucide-react (no Recharts, **no `@supabase/*`**).

### Architecture — deliberately decoupled

**No database, ever.** Unlike the customer-app, the harness has NO Supabase client and stores nothing. It reads its ~30 customers + backfilled history from a **committed JSON fixture** (`fixtures/customers.json`), built ONCE by `scripts/build-harness-fixture.ts` (parses `supabase/seed/01,04,05,06` with `pgsql-ast-parser`; normalizes `now()±interval` → relative `t+Ns` labels, maps `tool_calls`→`actions` with `tool`→`type`, handles escaped quotes / null-name / spam threads). Regenerate with `npm run build:fixture` and commit when the seed changes (output is deterministic/git-clean). The batch set (`fixtures/scenarios.json`, 50 eval cases + 5 extras) is hand-maintained.

**Server webhook proxy — the secret stays server-side.** The browser calls only the app's own `/api/*`; it never talks to n8n directly and never sees the secret (there are deliberately NO `NEXT_PUBLIC_*` vars). Three Route Handlers (`runtime="nodejs"`, `force-dynamic`, typed `{ok,data}|{ok,error}` envelope via `lib/api/envelope.ts`): `/api/send` (one turn, 16 KB body cap), `/api/batch` (fan-out), `/api/health` (config booleans only). `lib/webhook/callWebhook.ts` is the single outbound choke point; the outbound URL is always env (`getWebhookUrl()`), never user input.

**Classify on `body.ok`, NEVER HTTP status.** The live n8n webhook ALWAYS returns HTTP 200 — even auth/validation failures come back as `{"ok":false,"error":...}`. The proxy branches on the body into three distinct client states: (a) success incl. a **degraded-but-200** reply (e.g. "Agent stopped due to max iterations") shown verbatim — do NOT hide it; (b) webhook `ok:false` → a config error (not a chat reply); (c) unreachable/timeout → offline-mock (if `OFFLINE_MOCK=true`) else a soft error. **Observed webhook latency is 19–49 s**, so `WEBHOOK_TIMEOUT_MS` defaults to **60000** — do not lower below ~50000.

**Batch is hard-capped at 5.** `getBatchConcurrency()` clamps `BATCH_CONCURRENCY` to ≤ 5 concurrent phone-groups; scenarios sharing a `from_phone` run **serially** so n8n per-`(org,phone)` context never interleaves. The harness drives traffic and shows a *lenient* intent-match chip — it does **not** grade (the authoritative scorer is the customer-app's `tests/eval/`). A full live batch fires ~55 webhook calls (Anthropic spend) and can take minutes — fine locally; production streaming is a deferred Phase-2 item.

**Design tokens only** — same `/design-system` rule and shared `styles/tokens.css` (copied from the other apps) as the website/customer-app.

### Config & running it

All env is **server-only**. Copy `.env.example` → `.env.local`: `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET` (sent as the `X-Handled-Secret` header), `ACME_BUSINESS_ID` (default `acme-plumbing`), plus optional `OFFLINE_MOCK` / `WEBHOOK_TIMEOUT_MS` / `BATCH_CONCURRENCY`. With **no env set** the app still runs in offline/mock mode (demo-safe). Real replies need the n8n webhook live (verified — the secret is enforced in the response body). CSP is stricter than the dashboard's (`connect-src 'self'`; `'unsafe-eval'` is **dev-only** for Fast Refresh, never in production). Scoped Stage-7 review (no auth/DB/uploads; what IS covered: server-only secret, body cap, typed-error non-leakage, strict CSP): `docs/test-harness/security/security-plan.md`.

---

## Planned / other work

**Evaluations** — text inputs only (not phone). Conversation history saved in Supabase is uploaded to **Azure AI Foundry** and scored with Azure's evaluator schema (record shape `question`/`response`/`citation`/`reasoning`). Both halves are already built (the Azure export **and** the offline graded launch-gate loop) — see "Evals — two separate halves" under Customer-app.

---

## The stage-gated build workflow

Each app is built through this approval-gated pipeline (defined in `dev-os/README.md`, driven by `.claude/skills/`). Core rules that override default behavior:

- **Never skip a stage, and never move to the next stage without explicit user approval.** After finishing a stage, stop, show what was produced, and wait for a clear yes.
- **Never write code before its spec exists.** Implementation only follows approved specs in the app's `docs/<App>/implementation/`.
- **Never assume a missing architectural decision** — use `AskUserQuestion` to resolve it.

| Stage | Driver | Output (per app) |
|---|---|---|
| 1 Engineering plan | `/engineering-planner` | `docs/<App>/engineering/engineering-doc.md` |
| 2 Implementation specs | `/implementation-specs` | `docs/<App>/implementation/*.md` + `supabase-schema.sql` + `.env.example` |
| 3 Frontend setup | `/frontend-setup` | scaffolded Next.js app in `apps/<app>/` |
| 4 Feature implementation | manual, one feature at a time (always apply `/design-system`) | feature code |
| 5 Testing | manual | Vitest + Playwright suites |
| 6 Deploy | Netlify (see website deploy notes) | live app |
| 7 Security hardening | `/security-foundation` | security plan + RLS policies, **scoped to the app's real surfaces** |

> Notes: (1) The `security-foundation` skill is templated for a full SaaS app (auth/chat/LLM/uploads); scope it to each app's actual surfaces rather than generating dead code — see how the website's `docs/security/security-plan.md` did this. (2) Some skill/agent descriptions and `dev-os/README.md` use generic placeholder paths (`docs/engineering/`, `docs/specs/`, `src/lib/security/`); the real paths are the per-app `docs/<App>/...` and `apps/<app>/...` paths above — prefer them.
