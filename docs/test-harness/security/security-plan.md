# Handled Test Harness — Security Plan (Stage 7)

**App:** `apps/test-harness` · **Reviewed:** 2026-10-08 · **Reviewer:** security-foundation (scoped)

This plan is **scoped to the harness's real attack surface**. The `security-foundation`
skill is templated for a full SaaS app (Supabase Auth, RLS, LLM calls, file uploads,
per-user chat ownership, rate-limit tables). The test harness has **none of those**, so most
of the template is **Not Applicable** and is documented as such in §4 rather than generating
dead code — the same approach taken for the marketing website (`docs/security/security-plan.md`).

---

## 1. Scope & threat model

**What this app is:** a standalone, internal **testing tool**. It renders ~30 fictional
seeded customers from a committed JSON fixture and lets an operator send SMS-style messages
that are proxied to the Handled n8n webhook; it displays whatever the webhook returns.

**What it is NOT:** it has **no user accounts, no auth, no database at runtime, no file
uploads, no direct LLM calls, and stores no data**. It is intended to run **locally** by the
builder (the owner's decision — not deployed publicly).

**Assets worth protecting:**
- `N8N_WEBHOOK_SECRET` — the shared secret for the webhook. Highest-value asset.
- `N8N_WEBHOOK_URL` — the backend endpoint.

**Surfaces:**
| Surface | Exposure | Primary risk |
|---|---|---|
| `POST /api/send` | server Route Handler | input abuse, secret leakage, error leakage |
| `POST /api/batch` | server Route Handler | resource exhaustion against the backend |
| `GET /api/health` | server Route Handler | config/secret disclosure |
| Outbound call to n8n | server → n8n (env URL) | SSRF (if URL were user-controlled), secret handling |
| Committed fixture | static JSON in the bundle | PII (none — fictional demo data) |
| Browser bundle / CSP | static assets | XSS, data exfiltration |

**Out of the trust boundary:** the n8n backend owns intent/injection/spam handling and its own
auth; this harness is a *client* of it. Grading/evals live in the customer-app, not here.

---

## 2. Controls already in place (verified in Stages 4–5)

| Control | Where | Verified by |
|---|---|---|
| **Secret is server-only** — `N8N_WEBHOOK_SECRET` read only inside `lib/webhook/callWebhook.ts`; never `NEXT_PUBLIC_`, never logged, never returned to the browser | `lib/env.ts`, `lib/webhook/callWebhook.ts` | `call-webhook.test.ts` ("never leaks the secret"), `api-health.test.ts` |
| **No secret in client** — the browser calls only `/api/*`; it never talks to n8n directly and never receives the URL or secret | `app/api/*`, `lib/hooks/*` | architecture; `api-health` returns booleans only |
| **Typed error envelope** — responses carry only `{code, message}` from a fixed map; raw fetch errors, stack traces, URL and secret are never serialized | `lib/api/envelope.ts`, `callWebhook` try/catch | `api-send.test.ts` |
| **Input validation (Zod)** — every route validates before logic; `text` capped 1–2000, `from_phone` regex on the built contract body | `lib/validation/contract.ts`, `app/api/send` | `contract-schema.test.ts`, `api-send.test.ts` (422 on empty) |
| **No SSRF from user input** — the outbound URL is always `getWebhookUrl()` (env), never anything a caller supplies | `callWebhook` | code review |
| **Request timeout** — outbound calls use `AbortSignal.timeout` (60 s) so a hung backend can't pin a connection open indefinitely | `callWebhook` | code review |
| **Security headers + strict CSP** — `default-src 'self'`, `connect-src 'self'` (browser reaches only our own origin), `object-src 'none'`, `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS | `next.config.mjs` | build; see §3 CSP note |
| **No secrets committed** — `.env*` is gitignored (only `.env.example` with placeholders); the fixture contains no secrets | `.gitignore`, `fixtures/customers.json` | repo check |
| **Graceful degradation** — unreachable/misconfigured backend never crashes the app; env-absent runs in offline/mock mode | `graceful-degradation`, `lib/webhook/mock.ts` | `offline.spec.ts`, `api-send` mock tests |
| **Accessibility (AA)** — zero axe WCAG 2.1 AA violations (not security per se, but part of the hardening gate) | UI components | `a11y.spec.ts` |

---

## 3. Controls added in this stage

### Request body size cap
`POST /api/send` now reads the body through `readJsonCapped()` (`lib/api/body.ts`), which
**rejects any body > 16 KB with `422 validation` before Zod runs**. Previously the raw body was
buffered and `JSON.parse`d before the `text ≤ 2000` rule applied, so a large payload could be
read in full first. 16 KB is far above the harness's real bodies (`{ customerId, text }`).
`/api/batch` takes no request body (it fans out the committed set), so it needs no cap.
Covered by a new test in `api-send.test.ts` ("oversized body → validation").

### CSP note (accepted trade-off)
`'unsafe-inline'` remains on `script-src`/`style-src` (Next App Router inline hydration /
next-font) — the same accepted trade-off as the website and customer-app. `'unsafe-eval'` is
added **in development only** (`NODE_ENV !== 'production'`) because Next's Fast Refresh
evaluates strings at dev time; the **production** CSP stays `script-src 'self' 'unsafe-inline'`
with **no** `'unsafe-eval'`. `connect-src 'self'` is stricter than the dashboard's (no Supabase/
wss) because the harness's browser only ever calls its own `/api/*`.

### Batch resource control
The one-button batch is **hard-capped at 5 concurrent requests** (`getBatchConcurrency()` clamps
`BATCH_CONCURRENCY` to ≤ 5), and same-phone scenarios are serialized — bounding load on the n8n
backend from a single run. Verified in `env.test.ts` and `batch-grouping` / `api-batch` tests.

---

## 4. Template controls that are Not Applicable (with rationale)

| Template requirement | Status | Rationale |
|---|---|---|
| **Supabase Auth + protected routes + login/logout routes** | **N/A** | No accounts and no sensitive data store. The app is a local builder tool; there is nothing to authenticate to. No `middleware.ts` auth, no `/api/auth/*`. |
| **RLS policies / `supabase/rls-policies.sql`** | **N/A** | The harness has **no database at runtime** (decoupled by design; data is a committed fixture built from the seed SQL). There are no tables to protect, so no RLS file is generated. |
| **`rate_limit_events` table + per-user rate limiting** | **N/A** | No auth, no users, no DB; a per-user table is meaningless. The relevant resource control (not hammering n8n) is the batch concurrency cap (§3). If the app were ever exposed publicly, add edge/proxy rate limiting (§5). |
| **In-app prompt-injection guard (`sanitizeForLLM`, block/400)** | **N/A — and would be wrong here** | The harness's **purpose** is to send arbitrary and adversarial inputs (including injection scenarios Ha-12/Ha-13) to the agent and observe how it responds. Sanitizing or blocking at the harness would defeat the test. Injection defense correctly lives in the **n8n Guard** agent, inside the trust boundary. |
| **Token/usage limiter (file size, page count, `MAX_CHAT_HISTORY`)** | **N/A** | No file processing and no in-app LLM. `text` is bounded (≤ 2000) and the body is capped (§3). No model context is assembled here. |
| **File upload validation (extensions/MIME/size, private buckets, signed URLs)** | **N/A** | The harness accepts **no uploads**. `media_url` from the contract is deliberately never sent (out of scope). No storage buckets. |
| **Chat/contract ownership checks (`verify*Ownership`)** | **N/A** | No ownership model — no accounts, no per-user rows. Every operator impersonates the fictional seeded customers intentionally. |
| **`OPENAI_API_KEY` / `SUPABASE_SERVICE_ROLE_KEY` handling** | **N/A** | The harness uses neither. Its only secret is `N8N_WEBHOOK_SECRET`, handled server-only (§2). |

No `lib/security/` service files are generated: every helper the template prescribes
(`authGuard`, `rateLimiter`, `promptInjectionGuard`, `tokenLimiter`, `chatSecurity`,
`inputValidator`) maps to an N/A surface above. Generating them would be dead code.

---

## 5. Known deferrals & recommendations

- **No access control on the app itself.** Accepted because it runs locally per the owner's
  decision. **If it is ever deployed publicly**, put it behind access control (Netlify
  password / an auth proxy / IP allowlist) and add edge rate limiting — the webhook secret is
  server-side, but a public harness would let anyone drive traffic (and spend) against the
  live agent. Documented, not a blocker for local use.
- **In-memory / no persistence.** Intentional (no data at rest to protect). Live turns vanish
  on refresh; conversation memory persists only on the backend (Supabase via n8n), which is
  outside this app's boundary.

---

## 6. Files created / modified in this stage

| File | Change |
|---|---|
| `apps/test-harness/lib/api/body.ts` | **new** — `readJsonCapped()` + `BodyError` (16 KB body cap) |
| `apps/test-harness/app/api/send/route.ts` | use `readJsonCapped()` instead of `req.json()` |
| `apps/test-harness/tests/integration/api-send.test.ts` | **new test** — oversized body → 422 |
| `apps/test-harness/next.config.mjs` | (Stage 4) dev-only `'unsafe-eval'`; prod CSP unchanged |
| `docs/test-harness/security/security-plan.md` | **new** — this plan |

**No SQL to run** (no database). **No new environment variables.** Env remains as documented
in `apps/test-harness/.env.example` (all server-only; `N8N_WEBHOOK_SECRET` is the sole secret).

---

## 7. Verification

- `npm run typecheck`, `npm run lint`, `npm run build` — clean.
- `npm run test` — Vitest unit + integration, incl. secret-never-leaked, envelope error
  safety, body cap, config/secret non-disclosure via `/api/health`.
- `npm run test:e2e` — Playwright, incl. **axe WCAG 2.1 AA (zero violations)** and the
  offline/no-crash path.
