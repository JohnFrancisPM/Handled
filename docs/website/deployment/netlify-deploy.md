# Handled Marketing Website — Netlify Deployment Handoff

**Audience:** whoever (or whatever MCP agent) deploys this site to Netlify from another machine.
**App:** `apps/website` (inside the `Handled` monorepo)
**Repo:** `https://github.com/JohnFrancisPM/Handled.git` — branch **`main`**
**Status at handoff:** Stages 1–5 complete (engineering plan → specs → scaffold → features → tests). Build + full test suite green. Not yet deployed.

This file is self-contained: everything needed to deploy is here. Paths referenced (e.g. the SQL schema) are also present in the repo once it's cloned on the target machine.

---

## 0. TL;DR

1. On the deploy machine, get the repo: `git clone https://github.com/JohnFrancisPM/Handled.git` (or `git pull`), branch `main`.
2. Create a Netlify site **connected to that repo**. The root `netlify.toml` already sets base = `apps/website`, build = `npm run build`, Node 20, and the Next.js runtime — so **no manual build settings are required**.
3. (Optional but recommended for real lead capture) Create a Supabase project, run the schema SQL, and set two env vars on Netlify. Without them the site still works — the demo form succeeds and simply stores nothing (graceful no-op).
4. Deploy. Then **update `content/site.ts` `site.url`** to the real domain and redeploy (fixes canonical/OG/sitemap/robots URLs).
5. Smoke-test using the checklist in §7.

---

## 1. What was built

A static-first **public marketing website** (Next.js 14 App Router, TypeScript strict, Tailwind wired to the `docs/design.md` design tokens). No AI/voice features — this is the marketing site only.

- **9 pages:** Home, Why Handled, Features, Pricing, Integrations, How it works, Contact (Book a demo), Privacy, Terms.
- **One dynamic endpoint:** `POST /api/leads` (Node runtime) — the demo-request lead capture. Everything else is statically generated.
- **Lead capture:** shared Zod validation, honeypot + min-fill-time + IP rate limit, server-only Supabase insert, and a **graceful no-op** when Supabase env is absent (returns `200 {ok:true,stored:false}` so a demo never fails).
- **SEO:** per-page metadata, `sitemap.xml`, `robots.txt` (disallows `/api/`).
- **Tests:** Vitest 35/35 (unit + integration) and Playwright 37 passed / 1 skipped (incl. axe-core a11y) — all green at handoff.

Full detail: `docs/website/engineering/engineering-doc.md` and `docs/website/implementation/`.

---

## 2. Framework / runtime facts the deployer needs

| Thing | Value | Notes |
|---|---|---|
| Framework | Next.js `14.2.15` (App Router) | Needs the Netlify Next Runtime (`@netlify/plugin-nextjs`), declared in `netlify.toml`. |
| Node | **20.x LTS** | Pinned via `NODE_VERSION=20` in `netlify.toml`. (Repo was developed on Node 26 but the spec targets 20; pin to avoid surprises.) |
| Package manager | npm (lockfile committed: `apps/website/package-lock.json`) | Netlify runs `npm ci` / `npm install` automatically. |
| Monorepo base dir | `apps/website` | Set in `netlify.toml` `[build] base`. |
| Build command | `npm run build` | In `netlify.toml`. |
| Publish dir | managed by the Next Runtime | Do **not** set `publish` manually. |
| Dynamic function | `/api/leads` | `export const runtime = "nodejs"` + `dynamic = "force-dynamic"` → becomes a Netlify Function automatically. |

The committed root `netlify.toml` encodes all of this, so a repo-connected Netlify site needs no manual build configuration.

---

## 3. Environment variables (Netlify → Site settings → Environment variables)

**All are OPTIONAL.** If absent, lead capture succeeds in the UI and stores nothing (graceful no-op, by design). Set them to actually persist leads.

| Variable | Scope | Where to get it | Purpose |
|---|---|---|---|
| `SUPABASE_URL` | Server only | Supabase dashboard → Settings → API → Project URL | Target project for lead inserts |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only — SECRET** | Supabase dashboard → Settings → API → `service_role` key | Server-side insert into `leads`. **Never expose to the browser.** |

**Critical:** there are **no** `NEXT_PUBLIC_*` variables. The browser never talks to Supabase; the service-role key is used only inside `app/api/leads/route.ts` (server). Do not rename these with a `NEXT_PUBLIC_` prefix — that would leak the key to the client.

Reference copy of these lives in `apps/website/.env.example`.

> Site base URL is **not** an env var in this MVP. It is the hardcoded `site.url` in `content/site.ts` (see §6).

---

## 4. Supabase setup (only needed to actually store leads)

1. Create a Supabase project (or reuse one).
2. Open **SQL Editor** and run the schema file: **`docs/website/implementation/supabase-schema.sql`**. It creates the `leads` table, constraints, an index, and **RLS** (enabled; service-role only — anon/authenticated have no policies). Paste-and-run; it is idempotent-friendly for a fresh project.
3. Copy the Project URL and `service_role` key into the two Netlify env vars in §3.
4. Redeploy (or trigger a deploy) so the function picks up the env.

If you skip this entirely, the site deploys and runs fine; the form just reports success without storing (`stored:false`).

---

## 5. Deploy steps

### Option A — Netlify MCP connector (the intended path)

Using your Netlify MCP connector on the other machine, have it:

1. **Create / connect a site** to the Git repo `JohnFrancisPM/Handled`, production branch **`main`**.
   - Because the root `netlify.toml` sets `base = "apps/website"`, you do **not** need to set a base directory or build command in the UI. If the connector asks anyway, use: base = `apps/website`, build command = `npm run build`, and leave publish to the Next Runtime.
2. **Set environment variables** (§3) — only if you're wiring Supabase now. Mark `SUPABASE_SERVICE_ROLE_KEY` as a secret.
3. **Trigger a production deploy** from `main`.
4. Read back the deploy logs; confirm the build succeeded and the Next Runtime registered the `/api/leads` function.
5. Capture the assigned site URL (e.g. `https://<name>.netlify.app`).

### Option B — Netlify CLI (fallback)

```bash
# from the repo root on the deploy machine
npm i -g netlify-cli
netlify login
netlify init          # connect to JohnFrancisPM/Handled, branch main
# set env (optional):
netlify env:set SUPABASE_URL "https://xxxx.supabase.co"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "eyJ...服务role..."   # mark secret in UI
netlify deploy --build --prod
```

### Option C — Dashboard (fallback)

New site → Import from Git → pick `JohnFrancisPM/Handled` → branch `main` → accept the detected `netlify.toml` settings → add env vars → Deploy.

---

## 6. Post-deploy: set the real site URL (important for SEO)

`content/site.ts` has `url: "https://handled.ai"` hardcoded. This value drives **canonical tags, Open Graph URLs, `sitemap.xml`, and `robots.txt`**. Until it matches the live domain, those will point at `handled.ai`.

- If deploying to the final custom domain `handled.ai`: no change needed.
- If deploying to a `*.netlify.app` URL or a different domain first: edit `apps/website/content/site.ts` → `site.url` to the live origin (no trailing slash), commit, and redeploy.

There is no env override for this by design (MVP decision in the specs); change it in code.

---

## 7. Post-deploy smoke test

- [ ] All 9 routes load (200): `/`, `/why-handled`, `/features`, `/pricing`, `/integrations`, `/how-it-works`, `/contact`, `/privacy`, `/terms`.
- [ ] `/sitemap.xml` and `/robots.txt` resolve; URLs inside them use the correct domain (see §6).
- [ ] Nav "Book a demo" CTA is present on every page; mobile hamburger opens/closes.
- [ ] On `/pricing`, the Pro tier CTA lands on `/contact?plan=pro` with the plan-interest select pre-set to Pro.
- [ ] Submit the demo form with valid data → success panel appears.
  - With Supabase env set: confirm a new row in the `leads` table.
  - Without env: success panel still appears (stored:false) — expected.
- [ ] Submitting the form too fast or with the hidden `company` field filled is rejected (bot protection) — optional manual check.
- [ ] No secrets in the browser: view-source / network shows no `service_role` key and no `SUPABASE_*` values.

---

## 8. Known deferrals (not blockers, but worth doing before public launch)

- **OG image + favicon are on-brand placeholders.** `apps/website/public/` now ships `og-default.png` (1200×630), `favicon.ico` (multi-size), and `icon.png` (180×180 Apple touch icon), all referenced by `lib/seo.ts`. Swap them for final brand artwork before public launch if desired.
- **Lighthouse CI not wired.** axe-core a11y runs in the E2E suite (zero serious/critical on key pages), but the Perf ≥90 / A11y ≥90 budget (spec §R31) is not gated. Consider a Lighthouse CI step.
- **Legal copy is launch-ready boilerplate** tailored to what the site does; have a lawyer review `app/privacy/page.tsx` and `app/terms/page.tsx` before public launch.
- **Testimonials are illustrative placeholders** — replace with real, attributed quotes before launch.
- **Test coverage reporter not installed** (`@vitest/coverage-v8`) — add it if you want a hard ≥80% gate.

---

## 9. Verify locally before/after deploy (optional)

```bash
cd apps/website
npm ci
npm run typecheck     # strict TS — passes
npm run build         # 9 static pages + /api/leads function — succeeds
npm run test          # Vitest 35/35
npm run test:e2e      # Playwright (needs: npx playwright install chromium)
```

---

## 10. Quick reference

- Repo: `https://github.com/JohnFrancisPM/Handled.git` · branch `main` · app at `apps/website`
- Build config: root `netlify.toml` (base `apps/website`, `npm run build`, Node 20, Next Runtime)
- Env (optional, server-only): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- DB schema to run: `docs/website/implementation/supabase-schema.sql`
- Site URL to update post-deploy: `content/site.ts` → `site.url`
- Engineering/spec source of truth: `docs/website/engineering/` and `docs/website/implementation/`
