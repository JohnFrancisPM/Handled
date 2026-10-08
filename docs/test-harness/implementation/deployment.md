# Deployment — own Netlify site, headers, env

**Source:** engineering-doc §15 · consistency: the customer-app's own-site pattern. The
test-harness is a **separate Netlify site** from the website (`handled-website-ajik`) and the
customer-app (`handled-customer-app`). Do **not** cross their configs.

---

## 1. `apps/test-harness/netlify.toml`

```toml
# Netlify config for the Handled test-harness. Its own Netlify site, separate from
# the website (repo-root netlify.toml) and the customer-app (apps/customer-app/netlify.toml).
# Monorepo: the CLI runs against the real git root, so base resolves correctly.

[build]
  base = "apps/test-harness"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "20"            # Node 20 LTS (TH-13)

# Next.js on Netlify — the Next Runtime renders App Router pages and turns the
# Route Handlers (runtime = "nodejs") into Netlify Functions. Do NOT set `publish`.
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

Build the fixture **before** deploying if the seed changed (`npm run build:fixture`), then
commit `fixtures/*.json`. The app build itself does not run the extractor (the fixture is a
committed artifact).

---

## 2. Deploy method — local Netlify CLI from `apps/test-harness`

```bash
cd apps/test-harness
npx netlify-cli deploy --build --prod
```

- Run from `apps/test-harness` (like the customer-app). The CLI runs against the real git
  root so `base = "apps/test-harness"` resolves correctly; it builds locally (incl.
  `@netlify/plugin-nextjs`) and uploads the prebuilt output.
- **Do NOT use the Netlify MCP `deploy-site` connector** for this app — same failure mode as
  the customer-app: it uploads only the subdir, so `base` points at a nonexistent nested dir
  and the build fails at config parsing (a full-repo upload would instead build the website
  from the repo-root toml).
- No Git↔Netlify auto-deploy — deploys are explicit CLI runs.
- `.netlify/` link state and build output are gitignored.

---

## 3. Env configuration (Netlify site → Environment)

Set **server-side** (none `NEXT_PUBLIC_`): `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET`,
`ACME_BUSINESS_ID`, and optionally `OFFLINE_MOCK`, `WEBHOOK_TIMEOUT_MS` (keep ≥ ~50000),
`BATCH_CONCURRENCY`. See `env-and-config.md` §1. With no webhook env set, the deployed app
still runs (offline banner + mock/error) — safe for a first deploy before wiring n8n.

---

## 4. Security headers — `apps/test-harness/next.config.mjs`

Mirror the customer-app's headers, **scoped to this app's surfaces**: the browser calls only
our own `/api/*` (never n8n directly), and the app renders **no remote images** and talks to
**no third-party origin from the browser**. So the CSP is stricter than the dashboard's —
`connect-src 'self'` only (no supabase/wss).

```js
/** @type {import('next').NextConfig} */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "img-src 'self' data:",                 // avatars are CSS initials; no remote images
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",     // Next App Router inline hydration/next-font
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'",                   // browser → our /api/* only; secret stays server-side
  "form-action 'self'",
  "manifest-src 'self'",
  "upgrade-insecure-requests"
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() { return [{ source: "/:path*", headers: securityHeaders }]; }
};
export default nextConfig;
```

Netlify may serve its own 1-year HSTS which supersedes the value here (same as the other two
apps). Full rationale is captured later in the Stage-7 `/security-foundation` review, scoped to
the harness's real surfaces (webhook proxy + no auth + no DB), not the generic SaaS template.

---

## 5. Stage-6 live-testing prerequisite (status: webhook LIVE)

The n8n agentic webhook is **confirmed live and reachable** (verified 2026-10-08):
`X-Handled-Secret` enforced, full contract envelope returned, latency ~19–49 s. To live-test
the deployed harness end-to-end:
1. Point `N8N_WEBHOOK_URL` + `N8N_WEBHOOK_SECRET` at the live webhook in the Netlify site env.
2. Set `ACME_BUSINESS_ID=acme-plumbing` (the seeded org slug).
3. (Optional) leave `OFFLINE_MOCK` unset/false for real replies; set `true` for a guaranteed-
   green recorded demo if the backend is ever unavailable.

If a fresh n8n instance is used instead, its prerequisites remain: Supabase migration + seed
applied, workflow imported with an Anthropic credential + env, and toggled Active
(`n8n/README.md`).

---

## Requirement coverage
- **TH-11** (own folder/netlify.toml/site) — §1, §2.
- **TH-13** (Node 20) — §1.
- **TH-12** (server-side env; no NEXT_PUBLIC_ secret) — §3, §4 (connect-src 'self').
- **TH-15** (Stage-6 n8n prerequisite; now LIVE) — §5.
