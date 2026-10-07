# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`Handled` is a **monorepo** that houses an **AI-assisted build workflow** (`dev-os/`) and the **apps it produces**. It is the capstone project for building Handled — "the AI office manager for home & local service businesses" — as **three separate web apps** (see `notepad.md` and `docs/PRD.md` for the product brief):

| App | Location | Status | What it is |
|---|---|---|---|
| **Marketing website** | `apps/website` | ✅ **Built & live** (Stages 1–7 done, deployed to Netlify) | Static-first public site. No AI; marketing + one lead-capture endpoint. |
| **Customer experience** | `apps/<tbd>` (not created yet) | 🔲 Planned | Handled's customer-facing dashboard + an n8n/Supabase agentic backend. |
| **Test harness** | `apps/<tbd>` (not created yet) | 🔲 Planned | Standalone app to impersonate customers over SMS-style chat and watch the AI respond. |

Each app is built independently through the stage-gated workflow below, gets its own `apps/<app>/` folder and its own `docs/<App>/` spec tree, and must not assume the others exist. **Only `apps/website` exists today** — the sections below marked "Website app" are specific to it; the planned apps are summarized under "Planned apps."

## Layout

```
apps/
  website/             The marketing site (Next.js 14 App Router). ALL its commands run from here.
  <customer-app>/      (future) Handled customer experience — not created yet
  <test-harness>/      (future) Test harness — not created yet
docs/
  PRD.md               Product requirements (all apps)   ·   design.md  Brand design system (tokens)
  Competitive Research.md · evals.xlsx   Supporting research / eval insights
  website/             Website specs: engineering/ (HLD), implementation/ (per-concern + supabase-schema.sql + .env.example), deployment/ (netlify-deploy.md)
  security/            security-plan.md (website Stage 7 review)
  <App>/               (future) each new app gets its own engineering/ + implementation/ tree here
dev-os/                The stage-gated build workflow "operating system" (see dev-os/README.md)
.claude/skills/        Slash-command skills (engineering-planner, implementation-specs, frontend-setup, design-system, security-foundation)
.claude/agents/        Planner/reviewer subagents  ·  .claude/agent-memory/  their persisted notes
netlify.toml           Website deploy config (base = apps/website, Next runtime). Repo-root today because the website is the only deployed app; revisit if another app needs Netlify.
supabase/              rls-policies.sql (website Stage 7; run manually in Supabase SQL Editor — not auto-applied)
```

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

**Content-driven pages.** Page files in `app/*/page.tsx` contain almost no literal copy. They import typed data from `content/*.ts` (e.g. `pricing.ts`, `faqs.ts`, `comparison.ts`, `nav.ts`, `site.ts`) and pass it into presentational components in `components/marketing/`. To change site copy, edit the `content/` module — not the page or the component. `content/site.ts` is the single source for brand name, URLs, CTAs, and the trades list.

**Design tokens are the only styling source.** Raw token values live as CSS variables in `app/globals.css`, are exposed to Tailwind in `tailwind.config.ts` (e.g. `bg-brand`, `text-grey-900`, spacing scale, radii), and are enforced by the **design-system skill**. Never introduce arbitrary hex colors, spacing, or font sizes — only use tokens / the Tailwind classes wired to them. Apply `/design-system` whenever writing UI.

**Lead capture is the only dynamic surface.** Everything else is statically generated. `POST /api/leads` (`app/api/leads/route.ts`, `runtime = "nodejs"`, `force-dynamic`) is the one Route Handler. Its pipeline:
- Shared Zod schema in `lib/validation/lead.ts` validates both client and server (keep them using the same schema).
- Anti-spam: `company` honeypot + `MIN_FILL_MS` min-fill-time + in-memory IP rate limit (`lib/rate-limit.ts`, 5 / 10 min) + a 16 KB request body cap.
- `lib/supabase/server.ts` `getSupabaseAdmin()` returns `null` when env is absent. The handler then **gracefully no-ops** — returns `200 {ok:true, stored:false}` so a demo never fails. Preserve this graceful-degradation behavior; it is intentional, not a bug.

**Supabase is server-only.** The service-role key is used solely inside the leads route. There are deliberately **no `NEXT_PUBLIC_*` variables** — the browser never talks to Supabase. Never add a `NEXT_PUBLIC_` prefix to the Supabase vars; that would leak the key to the client.

**Security headers** live in `next.config.mjs` (`async headers()`): CSP (all `'self'`, `'unsafe-inline'` required for scripts/styles because static pages are CDN-cached and can't use nonces), `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS. See `docs/security/security-plan.md` for the rationale and the accepted deferral (the in-memory rate limiter is per-instance on Netlify Functions).

**SEO.** `lib/seo.ts` centralizes metadata (`baseMetadata` / `pageMetadata`); `app/sitemap.ts` and `app/robots.ts` generate `sitemap.xml` / `robots.txt`. All derive their origin from `site.url` in `content/site.ts` — after deploying to a non-final domain, update `site.url` there (no env override by design) and redeploy, or canonical/OG/sitemap URLs point at `handled.ai`.

### Deploying the website

Deploys currently go through the **Netlify MCP connector** as direct zip-upload builds (there is **no Git↔Netlify connection**, so pushing to `main` does not auto-deploy). The connector's upload does not fully respect `.gitignore`, so **remove `node_modules`/`.next` before an upload** or it will 413. The repo-root `netlify.toml` sets `base = apps/website`, `publish = ".next"` (required — a stale UI publish value otherwise equals the base dir and breaks `@netlify/plugin-nextjs`), `npm run build`, and Node 20. Full handoff (incl. the Git-CD alternative): `docs/website/deployment/netlify-deploy.md`. Optional server-only env vars `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` enable real lead storage; without them the form no-ops.

---

## Planned apps (not built yet)

Build these only when asked, each via the full stage-gated workflow, writing specs to `docs/<App>/`. Requirements live in `notepad.md` and `docs/PRD.md` — read them first.

**Customer experience** — Handled's customer-facing product (front end + backend):
- **Supabase** stores customer profiles and the **memory of every AI↔customer conversation** (this memory is the eval corpus).
- **n8n** is the agentic workflow: a webhook entry point receives a message and returns a response. Intended design is **multi-agent** — an intent router in front, then specialized agents per scenario (write the prompt for each agent).
- App features: dashboard; incoming messages + their AI responses; conversion tracking (inbound requests → closed appointments, with price each); self-service of the customer profile and service policies.
- Seed data: the **Acme Plumbing** example customer (in `notepad.md`), backfilled with ~30 customers including message logs, booked appointments, and prices; use `docs/evals.xlsx` for interaction-type insights.

**Test harness** — a completely separate app to exercise the customer experience:
- Impersonate multiple users, view each one's chat history, send messages as them, and see the AI's response.
- Mimics **SMS** (looks like texting Acme Plumbing). Loads the same ~30 backfilled customers.

**Evaluations** — text inputs only (not phone). Conversation history saved in Supabase is uploaded to **Azure AI Foundry** and scored with Azure's evaluator schema. Each conversation record needs: `question`, `response`, `citation`, `reasoning`.

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
