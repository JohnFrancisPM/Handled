# Spec: Testing

**App:** `apps/website`
**Implements:** R30, R31, R33, and verifies R22/R23/R24/R32
**Depends on:** all other specs
**Frameworks:** Vitest + React Testing Library (unit/integration), Playwright + axe-core (E2E/a11y), Lighthouse (perf/a11y budget). Config in `project-setup.md` §8–9.

Mirrors ED §13. The **graceful-degradation guard** is mandatory so the recorded demo can never regress.

---

## 1. Unit tests (Vitest) — `tests/unit/`

### 1.1 `lead-schema.test.ts` (R23)
- Valid minimal payload (name, businessName, email) → parse succeeds.
- Missing each required field → specific error message.
- Invalid email → error.
- `name`/`businessName` > 200 chars → error; `message` > 2000 → error.
- `weeklyCalls` = -1 and 100001 → error; valid 0 and 50 → pass; string "25" coerces to 25.
- `trade` not in `TRADES` → error; empty string `""` → allowed (no selection).
- `planInterest` not in enum → error; valid "pro" → pass.
- Honeypot `company` with any content → error; empty → pass.

### 1.2 `rate-limit.test.ts` (R24)
- 5 calls for one IP → all `ok:true`; 6th → `ok:false` with `retryAfterSec`.
- Distinct IPs tracked independently.
- After window reset (mock time) → bucket resets.

### 1.3 `content-modules.test.ts`
- `pricingTiers` has exactly 3 entries; prices are "$149"/"$299"/"$599"; exactly one has `mostPopular: true` (Pro); Pro CTA href = `/contact?plan=pro`.
- `missedCallStats` has 5 entries with the exact values 27% / 52% / 62% / 85% / ~$1,200.
- `pricingComparison` includes reception.ai $199 and Smith.ai $300; exactly one row `highlight: true` (Handled).
- `differentiators` has 4 entries, each with non-empty `points`.
- `site.trades` equals the `TRADES` constant in `lib/validation/lead.ts`.
- Every `feature.icon` has a matching entry in the `iconMap`.

### 1.4 `ui-primitives.test.tsx` (R3)
- `Button` renders `<a>` when `href` given, `<button>` otherwise; disabled state applies.
- `Badge` renders the tone's classes; `Card highlight` applies the brand border.
- `PricingTable` renders 3 cards and the "Most popular" badge once.
- `ComparisonTable variant="capability"` renders a row per `capabilityComparison` entry; booleans render check/x icons (assert by `aria-label`/`data-*`).

---

## 2. Integration tests (Vitest) — `tests/integration/leads-route.test.ts` (R22, R24, R32)

Import the `POST` handler and invoke with mock `NextRequest`s. Mock `getSupabaseAdmin` and `rateLimit` per case.

| Case | Setup | Expect |
|---|---|---|
| Happy path, env present | `getSupabaseAdmin` → client whose `.insert` resolves no error | 200 `{ ok:true, stored:true }`; insert called with snake_case mapping |
| **Env-missing no-op (guard)** | `getSupabaseAdmin` → `null` | 200 `{ ok:true, stored:false }`; no insert attempted |
| Insert throws/returns error | insert returns `{ error }` | 200 `{ ok:true, stored:false }`; error logged, not thrown |
| Validation failure | body missing email | 400 `{ ok:false, error:"validation", fields:{ email: ... } }` |
| Honeypot tripped | body with `company:"x"` | 400 `{ ok:false, error:"validation" }`; no insert |
| Min-fill-time | `formLoadedAt = Date.now()` (0ms elapsed) | 400 validation; no insert |
| Rate limited | `rateLimit` → `{ ok:false }` | 429 `{ ok:false, error:"rate_limited" }` with `Retry-After` |
| Server error | force `req.json()` to throw unexpectedly after rate check | 500 `{ ok:false, error:"server" }`; **response body contains no stack trace** |
| Field mapping | valid full payload | insert receives `business_name`, `weekly_calls`, `plan_interest`, `source_path`, `user_agent`; empty strings normalized to `null` |

The **env-missing no-op** row is the required guardrail test (ED §13).

---

## 3. E2E tests (Playwright) — `tests/e2e/`

Run against `npm run build && npm run start` with **no Supabase env** so the form still succeeds (demo config).

### 3.1 `navigation.spec.ts`
- Visit all 9 routes; each returns 200, has exactly one `<h1>`, and shows the persistent "Book a demo" nav CTA.
- Footer shows Privacy + Terms links on every page.

### 3.2 `mobile-nav.spec.ts` (mobile project)
- At mobile viewport, hamburger opens the sheet; links + "Book a demo" visible; Escape and backdrop close it; focus returns to trigger.

### 3.3 `pricing-prefill.spec.ts` (R21)
- On `/pricing`, click the Pro tier CTA → lands on `/contact?plan=pro` → plan-interest select shows "Pro".

### 3.4 `demo-form.spec.ts` (R20, R22)
- Fill name/businessName/email, wait > 2s (min-fill-time), submit → success panel appears with the "within 1 business day" copy (works because env absent → stored:false). 
- Submit empty → inline required errors appear and focus moves to first error.
- Consent line + Privacy link present under submit.

### 3.5 `a11y.spec.ts` (R30) — axe-core
- Run `@axe-core/playwright` on Home, Pricing, Why Handled, Contact, Features → zero serious/critical violations.

---

## 4. Lighthouse budget (R31)
- Run Lighthouse (CI optional) on Home, Pricing, Why Handled.
- Gate: **Performance ≥ 90** and **Accessibility ≥ 90** on each. Document scores; fail CI below threshold if Lighthouse CI is wired.

---

## 5. Commands
```
npm run typecheck      # tsc strict
npm run lint           # next lint
npm run test           # vitest unit + integration
npm run test:e2e       # playwright
```

---

## 6. Acceptance criteria
- All unit + integration tests pass; coverage on `lib/` and `content/` ≥ 80% (ED §13).
- The env-missing no-op integration test passes (R22 guardrail).
- E2E suite passes at desktop + mobile projects; axe-core finds no serious/critical issues (R30).
- Lighthouse Perf ≥90 & A11y ≥90 on the three key pages (R31).
