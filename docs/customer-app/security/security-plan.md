# Handled Customer-app — Security Plan (Stage 7)

**App:** `apps/customer-app` (+ `n8n/` backend) · **Live:** https://handled-customer-app.netlify.app
**Date:** 2026-10-08
**Reviewer:** Stage 7 Security Foundation (scoped to the actual app)

---

## 1. Scope & threat model

The customer-app is an owner-facing **multi-tenant dashboard** over Supabase, plus
a **single public n8n webhook** that is the only AI entry point. Unlike the
marketing website, the dashboard's **browser talks to Supabase directly** (anon
key, RLS-enforced). The real attack surface:

| Surface | Present? | Notes |
|---|---|---|
| Authentication / user sessions | ✅ Yes | Supabase Auth (email+password); `middleware.ts` protects `(dashboard)` + `/api` |
| **Multi-tenant org isolation** | ✅ **Yes — primary surface** | Every row is org-scoped; two enforcement layers (RLS + in-code `org_id` re-check) |
| Client → database access | ✅ Yes | Browser uses the **anon** key under RLS (`NEXT_PUBLIC_SUPABASE_*`); never the service role |
| Service-role writes (Route Handlers) | ✅ Yes | `getSupabaseAdmin()` bypasses RLS → callers re-check `org_id` from session |
| API input validation | ✅ Yes | Shared Zod schemas, server-side, `422` on failure |
| Public LLM webhook (`n8n/`) | ✅ Yes | Shared-secret auth + Haiku spam/injection guard; returns a fixed envelope, never 500 |
| Secrets in client bundle | ✅ Checked | Service role + webhook secret are server-only; no `NEXT_PUBLIC_` prefix |
| File uploads / storage buckets | ❌ No | No document handling; no upload route |
| LLM / prompt surface **in the Next app** | ❌ No | All model calls live in n8n; the dashboard only **reads** stored messages |
| `OPENAI_API_KEY` | ❌ No | Claude is an **n8n credential**, not an app env var |
| Contracts / chat-session ownership | ❌ No | No such feature; no per-contract ACL to enforce |

Because there are **no uploads, no in-app LLM calls, and no OpenAI**, the generic
SaaS template (`promptInjectionGuard.ts`, `tokenLimiter.ts`, `chatSecurity.ts`,
file-upload validators, a user-keyed `rate_limit_events` table, server auth
routes) **does not apply** and was deliberately **not** generated — it would be
dead, misleading code. This plan covers the controls that are real for this app.

**Primary threats considered:** cross-tenant data access (one org reading/writing
another's rows), service-role misuse bypassing RLS, session/auth gaps, injection
into the dashboard API, prompt injection / spam into the public webhook, secret
leakage to the browser, clickjacking / content injection, and transport downgrade.

---

## 2. Controls already in place (verified)

| Control | Where | Status |
|---|---|---|
| RLS enabled on all 17 tables + org-scoped policies | `supabase/migrations/0001_init.sql` §21 | ✅ `authenticated` sees only `current_org_id()` rows |
| `current_org_id()` is `security definer` + `set search_path = public` + `stable` | `supabase/migrations/0001_init.sql` (`current_org_id()`) | ✅ No RLS recursion, no search-path hijack |
| Config tables = full CRUD org-scoped; operational tables = SELECT-only | migration §21 | ✅ n8n-written tables have no `authenticated` write policy |
| Service-role client re-checks `org_id` on **every write** | `lib/data/mutations.ts` (`.eq("org_id", ctx.orgId)`) | ✅ Never trusts a client-supplied `org_id` |
| Live reads are org-scoped **and** RLS-enforced (anon client) | `lib/data/dashboard.ts` | ✅ Belt-and-suspenders: `.eq("org_id", …)` over the RLS anon client |
| Session → org resolution via `auth.uid()` join | `lib/supabase/server.ts` (`getSessionOrg()`) | ✅ Returns `null` → handlers `fail("unauthorized")` (401) |
| Route protection + session refresh | `middleware.ts` | ✅ Unauthed page → `/login`; unauthed `/api/*` → 401 from handler |
| Shared Zod validation, server-side, before any DB call | `lib/schemas/index.ts` + every `app/api/**` route | ✅ Invalid → `422`; bad JSON → `422`; unknown panel → `404` |
| Typed error envelope — no internal detail / key leakage | `lib/api/envelope.ts` | ✅ Only `{code, safe message}`; `catch → 500` generic |
| Service-role & webhook secret are server-only | `lib/env.ts` (`serverEnv`), `server-only` import guard | ✅ Not exposed to client; only `getSupabaseAdmin()` uses the key |
| Demo mode fails safe (read-only, no auth, no writes) | `lib/data/context.ts`, `mutations.ts` | ✅ Writes are graceful no-ops; nothing leaks without env |
| Public webhook: shared-secret auth + spam/injection guard | `n8n/handled-agentic.json` (Validate/Auth → Haiku Guard) | ✅ `X-Handled-Secret` required; guard screens prompt injection; always returns `200` envelope |
| Supabase Auth handles login brute-force / lockout | Supabase platform | ✅ Platform-level auth rate limiting (no app-level login limiter needed) |

---

## 3. Controls added in this stage

| # | Issue found | Fix | File |
|---|---|---|---|
| 1 | **No security headers at all** — the dashboard shipped with no CSP, framing, HSTS, or Referrer/Permissions policy (the website had them; the dashboard did not) | Added the full header set, **scoped to the dashboard's real connections** | `apps/customer-app/next.config.mjs` |
| 2 | **No Content-Security-Policy** | CSP locked to `'self'` except the two origins the browser genuinely needs: `connect-src … https://*.supabase.co wss://*.supabase.co` (REST/Auth + Realtime websocket) and `img-src … https://*.supabase.co https://images.unsplash.com` | `apps/customer-app/next.config.mjs` |
| 3 | **No clickjacking protection** | `frame-ancestors 'none'` + `X-Frame-Options: DENY` | `apps/customer-app/next.config.mjs` |
| 4 | **No Referrer-Policy / Permissions-Policy** | `strict-origin-when-cross-origin`; deny `camera/microphone/geolocation/payment/usb/interest-cohort` | `apps/customer-app/next.config.mjs` |
| 5 | **No HSTS in source** | 2-year `includeSubDomains; preload` | `apps/customer-app/next.config.mjs` |
| 6 | **RLS posture lived only in the schema file** — not independently auditable, and the base migration did not `FORCE` RLS or revoke `anon` grants | Added an idempotent re-assertion: `enable` + **`force`** RLS on all 17 tables, **`revoke all … from anon`**, re-created the exact policy set, plus verification queries | `supabase/customer-app-rls.sql` |
| 7 | **No logout / session-termination control** — a live user could not end their session from the UI (matters on shared devices) | Added a server-side logout route (`supabase.auth.signOut()`, clears auth cookies; graceful no-op in demo mode) + a client "Sign out" control in the top bar, shown in live mode only | `app/api/auth/logout/route.ts`, `components/layout/SignOutButton.tsx`, `components/layout/TopBar.tsx` |

### CSP note (accepted trade-off)
`script-src`/`style-src` include `'unsafe-inline'`, same as the website: Next.js
App Router injects inline hydration/RSC bootstrap scripts and `next/font` injects
an inline `<style>`. The dashboard is server-rendered (so per-request nonces are
*technically* possible), but adopting them means threading a nonce through the
Next middleware/document for every inline script and is not wired today; the
residual risk is inline execution only — every other directive is `'self'` or the
two required Supabase/Unsplash origins, so there is no third-party exfiltration
path. **Upgrade path:** move to a nonce-based CSP via middleware if a stricter
policy is later required.

### Why `wss:` and the two image hosts are in the CSP
Tightening these away would break the app, not harden it: the inbox uses Supabase
**Realtime** (a websocket to `wss://*.supabase.co`), all data reads/writes go to
`https://*.supabase.co`, and the UI renders Supabase-storage + Unsplash seed
images. The CSP is the **minimum** that keeps those working with nothing else
allowed.

---

## 4. Known deferrals & outstanding items

1. **Live-mode auth env not yet set in production.** Until
   `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (+ service role for
   writes) are set on the Netlify site, the app runs in **read-only demo mode** by
   design. The RLS re-assertion (`customer-app-rls.sql`) should be applied before
   the first real org logs in.
2. **CSP is report-free.** No `report-uri`/`report-to` wired. Optional before real
   traffic.
3. **No app-level rate limiting on the dashboard API.** Accepted: all `/api/**`
   routes are auth-gated (per-org, RLS-backed), and the only public surface is the
   n8n webhook, which is secret-gated and guarded. Login brute-force is handled by
   Supabase Auth's platform limits. Add a limiter only if a route is later exposed
   unauthenticated.

---

## 5. Files created / modified

**Created**
- `docs/customer-app/security/security-plan.md` (this file)
- `supabase/customer-app-rls.sql` — idempotent RLS re-assertion for the customer-app's 17 tables (distinct from the website's `supabase/rls-policies.sql`)
- `apps/customer-app/app/api/auth/logout/route.ts` — server-side session termination
- `apps/customer-app/components/layout/SignOutButton.tsx` — client sign-out control (live mode only)

**Modified**
- `apps/customer-app/next.config.mjs` — security headers (CSP scoped to Supabase/Realtime/Unsplash, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS, nosniff)
- `apps/customer-app/components/layout/TopBar.tsx` — renders `SignOutButton` in live mode

**Deliberately NOT created** (no corresponding surface in this app):
`lib/security/authGuard.ts` (middleware + `getSessionOrg()` already do this),
`rateLimiter.ts` / `rate_limit_events` (no public user-keyed surface),
`promptInjectionGuard.ts` (guarded in n8n, not the Next app),
`tokenLimiter.ts` (no file/LLM handling in-app),
`chatSecurity.ts` (no contract/chat-session ownership model),
`inputValidator.ts` file-upload validators (no uploads),
`app/api/auth/login/route.ts` (login is the Supabase SSR client flow — only logout needs a server route).

---

## 6. Actions required to apply

1. **Supabase:** run `supabase/customer-app-rls.sql` in the SQL Editor (after
   `migrations/0001_init.sql` + seed). Then run the §VERIFICATION queries at the
   bottom of that file and confirm the three expectations.
2. **Deploy:** the header change takes effect on the next Netlify build of
   `handled-customer-app`.
3. **No new environment variables** are introduced by this stage.

---

## 7. Post-deploy verification

- [ ] `curl -sI https://handled-customer-app.netlify.app/` shows `content-security-policy`,
      `x-frame-options: DENY`, `referrer-policy`, `permissions-policy`, and
      `strict-transport-security`.
- [ ] Dashboard still renders; the **inbox Realtime websocket connects** (CSP
      `connect-src wss:` works) and Supabase/Unsplash images load.
- [ ] View-source / network: no `SUPABASE_SERVICE_ROLE_KEY`, `N8N_WEBHOOK_SECRET`,
      or service-role value in the client bundle.
- [ ] (After live env) a user from org A cannot read or mutate org B's rows —
      confirm against `tests/integration/rls.test.ts` + `tool-writes.test.ts`.
- [ ] `PUT /api/profile/[panel]` with a bad body returns `422`; unauthenticated
      `/api/**` returns `401`.
