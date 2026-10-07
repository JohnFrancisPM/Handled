# Handled Marketing Website — Security Plan (Stage 7)

**App:** `apps/website` · **Live:** https://handled-website-ajik.netlify.app
**Date:** 2026-10-07
**Reviewer:** Stage 7 Security Foundation (scoped to the actual app)

---

## 1. Scope & threat model

The Handled website is a **static-first public marketing site**. This is the whole
attack surface — and most of it is intentionally inert:

| Surface | Present? | Notes |
|---|---|---|
| Authentication / user accounts | ❌ No | No login, signup, sessions, or `auth.users` data |
| LLM / chat / AI | ❌ No | No model calls, no `OPENAI_API_KEY`, no prompt surface |
| File uploads | ❌ No | No storage buckets, no document handling |
| Contracts / dashboards / protected routes | ❌ No | No per-user data, no middleware auth |
| Client → database access | ❌ No | Browser never talks to Supabase; no `NEXT_PUBLIC_*` keys |
| **Public lead form → `POST /api/leads`** | ✅ **Yes** | The one dynamic endpoint and the one real surface |
| Static pages (9 routes) + sitemap/robots | ✅ Yes | Prerendered, served from CDN |

Because there are no accounts, no AI, and no uploads, the generic SaaS security
template (auth guards, chat-session ownership, prompt-injection filters, token
limiters, `rate_limit_events` keyed on `auth.users`) **does not apply**. Those
controls were deliberately **not** implemented — they would be dead, misleading
code. This plan covers the controls that are real for this app.

**Primary threats considered:** lead-form spam/abuse, injection into the one
endpoint, service-role key exposure, clickjacking / content injection against
static pages, transport downgrade, and secret leakage in the client bundle.

---

## 2. Controls already in place (verified)

| Control | Where | Status |
|---|---|---|
| Input validation (shared Zod schema) | `lib/validation/lead.ts` | ✅ Client + server validate the same schema; invalid → `400` with field errors |
| Honeypot anti-spam | `app/api/leads/route.ts` (`company` field) | ✅ Any value → reject, not stored |
| Min-fill-time anti-bot | `lib/validation/lead.ts` (`MIN_FILL_MS=2000`) | ✅ Sub-2s submits rejected |
| Per-IP rate limit | `lib/rate-limit.ts` (5 / 10 min) | ✅ Returns `429` + `Retry-After` (see deferral §4) |
| No stack-trace leakage | `app/api/leads/route.ts` catch block | ✅ Generic `500`, details logged server-side only |
| Service-role key is server-only | `lib/supabase/server.ts`, `.env.example` | ✅ No `NEXT_PUBLIC_` prefix; used only in the Route Handler |
| Graceful no-op without Supabase env | `getSupabaseAdmin()` returns `null` | ✅ Form succeeds, stores nothing — no crash, no leak |
| `leads` table RLS | `supabase-schema.sql` | ✅ RLS enabled, zero anon/authenticated policies, grants revoked |
| `/api/` disallowed to crawlers | `app/robots.ts` | ✅ |
| HSTS + `nosniff` on live site | Netlify defaults | ✅ Confirmed via response headers |

---

## 3. Controls added in this stage

| # | Issue found | Fix | File |
|---|---|---|---|
| 1 | **No Content-Security-Policy** — static pages had no defense against content/script injection | Added a tight CSP (`default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, no third-party origins) | `apps/website/next.config.mjs` |
| 2 | **No clickjacking protection** — site could be framed | `frame-ancestors 'none'` + `X-Frame-Options: DENY` | `apps/website/next.config.mjs` |
| 3 | **No Referrer-Policy** — full URLs leaked on outbound navigation | `Referrer-Policy: strict-origin-when-cross-origin` | `apps/website/next.config.mjs` |
| 4 | **No Permissions-Policy** — powerful browser features not locked down | Deny `camera`, `microphone`, `geolocation`, `payment`, `usb`, `interest-cohort` | `apps/website/next.config.mjs` |
| 5 | HSTS set by host only (not in source, not portable) | Declared explicitly in app config (2-year, `includeSubDomains`, `preload`) | `apps/website/next.config.mjs` |
| 6 | **No request body-size cap** on `/api/leads` — oversized payloads reached the JSON parser | Reject `Content-Length > 16 KB` with `413` before parsing | `apps/website/app/api/leads/route.ts` |
| 7 | RLS posture lived only in the schema file | Added an idempotent re-assertion (`enable` + `force` RLS, revoke grants, verification queries) | `supabase/rls-policies.sql` |

### CSP note (accepted trade-off)
`script-src` and `style-src` include `'unsafe-inline'`. Next.js App Router injects
inline hydration/RSC bootstrap scripts and `next/font` injects an inline `<style>`.
A nonce-based CSP is **not** usable here because pages are statically generated and
CDN-cached — a per-response nonce cannot be applied to a cached page. This is the
standard, documented posture for static Next on a CDN. Every other directive is
locked to `'self'` with no third-party origins, so the residual risk is limited to
inline execution, not external exfiltration. If a stricter policy is later required,
move to SSR with per-request nonces (removes static caching) or adopt hashed inline
scripts regenerated at build time.

---

## 4. Known deferrals (documented, not blockers)

1. **In-memory rate limiter is per-instance.** `lib/rate-limit.ts` uses a
   process-local `Map`. On Netlify Functions this resets on cold starts and is not
   shared across concurrent instances, so a distributed flood can exceed the
   intended 5/10-min ceiling. Acceptable for an MVP/demo lead form (honeypot +
   min-fill-time + body cap + server-side validation remain effective). **Upgrade
   path:** a persistent IP-keyed store (Netlify's rate-limit primitive, Upstash
   Redis, or a `lead_rate_events(ip, created_at)` Supabase table written via the
   service role). Note this would be **IP-keyed, not user-keyed** — there are no users.
2. **Supabase env not set in production.** Until `SUPABASE_URL` /
   `SUPABASE_SERVICE_ROLE_KEY` are configured on Netlify, leads are validated and
   accepted but not persisted (`stored:false`). By design; set them to capture leads.
3. **CSP is report-free.** No `report-uri`/`report-to` endpoint is wired. Optional:
   add CSP reporting before heavy public traffic.
4. **Favicon/OG are on-brand placeholders** (noted at deploy handoff) — not a
   security item, but swap before public launch.

---

## 5. Files created / modified

**Created**
- `docs/security/security-plan.md` (this file)
- `supabase/rls-policies.sql` — idempotent RLS re-assertion for `public.leads`

**Modified**
- `apps/website/next.config.mjs` — security headers (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS)
- `apps/website/app/api/leads/route.ts` — 16 KB request body-size cap (`413`)

**Deliberately NOT created** (no corresponding surface in this app):
`lib/security/authGuard.ts`, `rateLimiter.ts` (Supabase/user-keyed),
`promptInjectionGuard.ts`, `tokenLimiter.ts`, `chatSecurity.ts`,
`inputValidator.ts` (file-upload), `app/api/auth/login/route.ts`,
`app/api/auth/logout/route.ts`.

---

## 6. Actions required to apply

1. **Supabase (optional, only if storing leads):** run `supabase/rls-policies.sql`
   in the SQL Editor (after `supabase-schema.sql`). Then run the §verification
   queries inside that file.
2. **Deploy:** the header + route changes take effect on the next Netlify build.
3. **No new environment variables** are required by this stage.

---

## 7. Post-deploy verification

- [ ] `curl -sI https://<site>/` shows `content-security-policy`, `x-frame-options: DENY`,
      `referrer-policy`, `permissions-policy`, and `strict-transport-security`.
- [ ] Site still renders correctly (CSP does not break hydration or fonts).
- [ ] `POST /api/leads` with a >16 KB body returns `413`.
- [ ] A valid submission still returns `200 {ok:true,...}`.
- [ ] View-source / network: no `SUPABASE_*` or service-role value in the client bundle.
