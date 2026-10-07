# Engineering Document — Handled Marketing Website

**App:** `website` (`apps/website`)
**Stage:** 1 of 7 (Engineering Plan / High-Level Design)
**Author:** Engineering Planner
**Date:** 2026-10-07
**Source inputs:** `docs/PRD.md`, `notepad.md` ("Handled company website"), `docs/Competitive Research.md`, `docs/design.md`
**Status:** Draft — awaiting approval (authoritative version; supersedes the prior hand-written draft)

> This is the authoritative High-Level Design for the **public marketing website only**. It is the reference for Stage 2 (Implementation Specs). No implementation begins until it is approved.

---

## 1. Executive Summary

**Project:** The public-facing marketing website for **Handled** — the AI office manager for home & local service businesses (plumbing, HVAC, electrical, roofing, landscaping, cleaning, pest control, garage doors).

**Business goal:** Convert owner-operators and office admins of home-service businesses into **booked demos / trial requests**. The site is the top of the funnel for a self-serve SMB sale (buyer = user = owner).

**Problem statement (framed for the site visitor):** Home-service owners miss ~27% of inbound calls; a person answers only ~52%; 62% of callers who don't get through call a competitor and 85% never call back; each missed call is worth ~$1,200. The leak is invisible because a missed call leaves no trace. The site must make that pain visceral in seconds, then show that Handled **books real jobs into the owner's field-service-management (FSM) system** and does the office manager's job — not just "takes a message" like an AI receptionist.

**Positioning (one line, from PRD):** *"Handled is an AI office manager that answers every call, books the job into your field-service schedule, and follows up, so owner-operators stop losing revenue to the competitor who picked up first."*

**Primary differentiation to communicate — framed around *workflow depth* (Handled does the office manager's job, not just a receptionist's):**
1. **Workflow depth (umbrella theme):** a receptionist answers and takes a message; Handled answers, qualifies, checks real availability, books, triages, texts back, and follows up — the depth of workflow is the moat, not voice quality (which the $11B incumbent already owns).
2. **Dispatch-grade FSM integration** (Jobber, Housecall Pro, ServiceTitan) — books real jobs respecting tech skills, availability, and service area (most AI receptionists only drop a Google Calendar event).
3. **Office-manager scope** — missed-call text-back, quote follow-up, reminders, review requests, all tied to the job record.
4. **Trade-aware emergency triage** — recognizes burst pipe / gas smell / no-heat and escalates to the on-call tech.
5. **Trust & transparent pricing** — flat pricing, hard spend caps, no charge for spam/hangups (directly answers the category's #1 complaint: surprise billing).

**Target visitors:** Owner-operator ("Mike the plumber" / "Acme Plumbing") and the office admin at 1–20-person shops. Non-technical, mobile-heavy, skeptical of AI and of surprise billing.

**Messaging sourced from competitive research (`docs/Competitive Research.md`):** the site deliberately avoids competing on voice quality (a closed wedge owned by ElevenLabs/reception.ai) and instead leads on the two open lanes the research identifies — (1) **workflow depth** (dispatch-grade FSM integration + office-manager scope, which no competitor combines) and (2) **trust & billing transparency** (the #1 cross-competitor complaint: surprise overage, spam-call charges, cancellation abuse). Every differentiator block and the pricing comparison table trace back to a specific finding in that research.

**Success criteria:**
- Primary CTA (**Book a demo**) reachable in one click from every page and every major section.
- A dedicated **Why Handled** page that lands all four moats.
- A **Pricing** page that anchors Handled's premium tier against confirmed competitor pricing (reception.ai Premium $199/mo; Smith.ai Starter $300/mo) and makes the "one captured $1,200 job pays for months" ROI obvious.
- Fully responsive, on-brand per `docs/design.md`, Lighthouse Performance ≥ 90 and Accessibility ≥ 90 on Home / Pricing / Why Handled.
- **Demo-stable:** the recorded 3-minute demo must never fail — the one dynamic feature (demo form) degrades gracefully to a success state when no backend env is configured.

---

## 2. Product Scope

### In scope (MVP — this build)
- Statically-rendered / server-rendered marketing site on **Next.js 14 (App Router)**.
- **Information architecture modeled on leading competitor marketing sites** (per notepad "Build the Handled company website based on competitor websites"). The page set and section patterns mirror the proven structure used across reception.ai (ElevenLabs), Smith.ai, Goodcall, and My AI Front Desk — a value-prop hero, a stat/social-proof band, a product/features surface, an integrations surface, a how-it-works/onboarding narrative, a pricing page with tiers + comparison, a differentiator ("why us") page, and a demo/contact CTA — then differentiated on Handled's workflow-depth wedge drawn from `docs/Competitive Research.md`.
- **Pages (9):** Home, Why Handled (differentiator), Features, Pricing, Integrations, How it works, Contact / Book a demo, Privacy, Terms.
- Reusable marketing component library (nav, footer, hero, stat band, feature cards, step list, pricing table, competitor comparison table, FAQ accordion, CTA band, testimonial, logo cloud, differentiator block).
- **One interactive feature:** a "Book a demo" lead-capture form that POSTs to a Next.js Route Handler and (optionally) stores a row in a Supabase `leads` table. **Degrades gracefully** to a success state if Supabase env is absent.
- SEO basics: per-page metadata, OpenGraph/Twitter cards, `sitemap.ts`, `robots.ts`.
- Design system fully wired from `docs/design.md` (tokens, typography, spacing, radius, motion, state colors).

### Out of scope (lives in other apps / stages)
- Authentication, user accounts, customer login (that is `apps/customer-app`).
- Product dashboard, AI chat, conversation memory, n8n agentic workflow, Azure eval export (other apps).
- Any LLM / voice / telephony feature. **The website has no AI functionality.**
- Payment processing / self-serve checkout (CTAs route to the demo form, not Stripe).
- Blog/CMS, A/B testing, third-party analytics vendor, live-chat widget.

### Future enhancements (explicitly deferred)
- ROI / missed-revenue calculator widget.
- Customer case studies and a resources/blog surface (MDX).
- English/Spanish localization (PRD targets bilingual at launch; deferred for the website MVP — architecture leaves room for `next-intl`).
- Privacy-friendly analytics (Plausible/GA4), programmatic per-trade landing pages, hosted ROI tools.

---

## 3. User Personas

This app has **no authenticated roles**. All visitors are anonymous/public.

| Persona | Goal on the site | Permissions | Primary workflow |
|---|---|---|---|
| **Owner-operator ("Mike", "Acme Plumbing")** | Decide if Handled stops his revenue leak; judge trust/pricing | Public (no login) | Land → feel the pain → read **Why Handled** → check **Pricing** → **Book a demo** |
| **Office admin** (5–20-person shop) | Decide if it reduces their phone/dispatch load | Public | Land → **Features** → **How it works** → **Book a demo** |
| **Handled GTM team** (indirect, out-of-band) | Receive captured leads | Not a site user; reads Supabase `leads` directly | A submitted demo request appears as a `leads` row |

---

## 4. User Flows

**Format:** User Action → Frontend Behavior → Backend Processing → Database Interaction → System Response

**Flow 1 — Visit any marketing page (the common case)**
```
Visitor opens a marketing page (/, /why-handled, /pricing, …)
  → Next.js serves a statically-rendered React Server Component page with a sticky nav + persistent "Book a demo" CTA
  → No backend call
  → No DB interaction
  → Page paints fast (static HTML/RSC); CTA always visible; mobile nav available
```

**Flow 2 — Book a demo (the only dynamic flow / lead capture)**
```
Visitor fills the demo form (name, business name, email, phone?, trade?, weekly call volume?, plan interest?, message?)
  → Client-side Zod validation; inline field errors; submit button disabled + spinner while pending; honeypot + min-fill-time anti-spam
  → POST /api/leads (Route Handler, Node runtime): re-validate with the SAME Zod schema server-side; IP rate-limit; reject honeypot
  → If Supabase env present: INSERT one row into `leads` (service-role client, server-only).
    If env ABSENT or insert fails: log server-side, skip/No-op, still return success
  → 200 → success screen ("Thanks — we'll reach out within 1 business day"); 400 → inline errors; 429 → "please wait"; 500 → retry-able message
```

**Flow 3 — Compare pricing & convert**
```
Visitor opens /pricing
  → RSC renders 3 Handled tiers (static data from content/pricing.ts) + a competitor comparison table anchoring the premium tier + pricing FAQ
  → No backend / no DB
  → Visitor clicks a tier CTA → routes to /contact?plan=pro (query param prefills plan interest in the form)
```

**Flow 4 — Understand the moat**
```
Visitor opens /why-handled
  → RSC renders four differentiator blocks (FSM depth, office-manager scope, emergency triage, transparent pricing) + a "Handled vs. an AI receptionist" table
  → No backend / no DB
  → CTA band → /contact
```

**Flow 5 — Explore product / integrations / how-it-works**
```
Visitor opens /features | /integrations | /how-it-works
  → RSC renders content-driven sections (feature grid, FSM vendor cards, 3-step onboarding narrative)
  → No backend / no DB
  → Each page ends in a CTA band → /contact
```

---

## 5. Frontend Architecture

### Stack
- **Framework:** Next.js 14 (App Router), React 18, TypeScript (strict).
- **Styling:** Tailwind CSS. The Tailwind theme is generated **directly from `docs/design.md` tokens**: brand blue `#115ACB`, full grey scale (900→25), semantic green/red/yellow/violet/orange, 4px-base spacing scale (`--space-1…--space-28`), radius scale (sm 4 / md 6 / lg 8 / xl 12), and the state-color map (default/hover/focus/active/disabled/error/success/warning). CSS custom properties are declared once in `globals.css` mirroring the `:root` block in `design.md`; Tailwind maps to those variables so components never hardcode hex.
- **Typography:** `Inter` via `next/font` (the design system's "Inter Display"). Type roles fixed per `design.md` (H5 24/32/500, body-lg 16/24/500, body-sm 12/18/400; larger H1–H4 follow the documented scale). `letter-spacing: 0` throughout. Optional `JetBrains Mono` only for incidental code/numeric accents.
- **Icons:** `lucide-react` only (no other icon set).
- **State management:** **None global** — the site is stateless marketing content. Local `useState` only for (a) the demo form and (b) the mobile nav toggle and FAQ accordion. No Redux/Zustand/Context store.
- **Routing:** App Router file-based routing. Every page is a **Server Component** except the three interactive leaf components (`DemoForm`, `MobileNav`, `FaqAccordion`), which are Client Components (`"use client"`).
- **Rendering:** Static generation (SSG) for all content pages; the `/api/leads` Route Handler is the only dynamic server code. No per-request data fetching on content pages.

### UX states (per `design.md`)
- **Loading:** Content pages are static → near-instant. The demo form submit shows a disabled button + spinner (≤150ms transitions, ease-out).
- **Empty:** N/A for static content; the form's pre-submit state is the default state.
- **Error:** Form shows inline Zod field errors (Red 500 border, Red 700 text, Red 50 tint) and a top-level retry banner on 5xx.
- **Success:** Form swaps to a success panel (Green 500/Green 50) confirming follow-up.
- **Responsive:** Mobile-first. Nav collapses to a sheet < 768px; the pricing table and comparison table reflow to stacked cards < 768px; 16px minimum side gutter; no horizontal scroll at any width. Desktop uses the design system's generous section rhythm (40px section gaps, larger page padding scaled responsively from the 112/96 desktop values).
- **Accessibility:** Semantic landmarks (`header/nav/main/footer`), one `h1` per page, labeled form fields with `aria-describedby` errors, visible 2px brand-blue focus rings, contrast per `design.md` (near-black `#070A0E` on white), `prefers-reduced-motion` respected, keyboard-operable nav and accordion.

### Page & component hierarchy
```
app/
  layout.tsx              # fonts, <Nav/>, <Footer/>, base metadata, globals.css
  page.tsx                # Home
  why-handled/page.tsx    # Differentiator (the four moats)
  features/page.tsx       # Product capabilities
  pricing/page.tsx        # Tiers + competitor comparison + FAQ
  integrations/page.tsx   # Jobber / Housecall Pro / ServiceTitan
  how-it-works/page.tsx   # Connect → Configure → Go live
  contact/page.tsx        # Book a demo (hosts DemoForm)
  privacy/page.tsx
  terms/page.tsx
  sitemap.ts  robots.ts
  api/leads/route.ts      # POST lead capture (only server endpoint)

components/
  layout/     Nav (+ MobileNav client), Footer, Container, Section
  marketing/  Hero, StatBand, FeatureCard, FeatureGrid, StepList,
              PricingTable, ComparisonTable, FaqAccordion (client),
              Testimonial, LogoCloud, DifferentiatorBlock, CtaBand
  form/       DemoForm (client), Field, Select, FormSuccess
  ui/         Button, Badge, Card, Container  # design-system primitives

content/      pricing.ts, features.ts, faqs.ts, stats.ts, integrations.ts,
              differentiators.ts, comparison.ts, testimonials.ts
lib/          validation/lead.ts, supabase/server.ts, rate-limit.ts, utils/cn.ts, seo.ts
```

All copy, stats, pricing, FAQ, and comparison data live in **typed `content/*.ts` modules** so pages stay declarative and content is reviewable/testable in one place.

---

## 6. Backend Architecture

The site is static except for **one** endpoint. There is no app server, no session layer, no ORM.

**Stack:** Next.js Route Handlers (Node runtime) deployed on **Vercel**. The Supabase JS client (service-role key) is used **server-side only** inside `/api/leads` — the service-role key is never exposed to the browser.

**Core systems**
- **Validation:** A single Zod schema in `lib/validation/lead.ts`, imported by both the client form and the server handler (one source of truth).
- **Rate limiting:** `lib/rate-limit.ts` — a lightweight per-instance in-memory IP token bucket (e.g., 5 submissions / 10 min / IP) to blunt form spam. (Pluggable for Upstash Redis later; in-memory is sufficient and demo-safe for MVP.)
- **Spam protection:** Hidden honeypot field (`company`, must be empty) + minimum-fill-time check; both rejected server-side as validation failures without storing.
- **Error handling:** The handler returns a typed JSON envelope `{ ok: true, stored: boolean } | { ok: false, error, fields? }`. It never leaks stack traces; failures are logged server-side only.
- **Graceful-degradation config guard:** If `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are unset (or the insert throws), the handler logs and returns `{ ok: true, stored: false }` so the front-end success path still works during the recorded demo. This is the key demo-stability mechanism.
- **Secrets:** All secrets are server-only env vars on Vercel. Only `NEXT_PUBLIC_*` values (none required for MVP) could ever reach the client.

**Service interaction diagram**
```
Browser (DemoForm, client)
      │  POST /api/leads  {validated JSON}
      ▼
Next.js Route Handler  (Node runtime, Vercel)
      │  1. Zod re-validate   2. rate-limit (IP)   3. honeypot check
      ▼
  env present? ──no──► log + return { ok:true, stored:false }   (demo-safe no-op)
      │ yes
      ▼
Supabase JS (service role, server-only) ──INSERT──► Supabase `leads` table
      │
      ▼
return { ok:true, stored:true }  ──►  success screen
```

---

## 7. Database Design & Schema

Exactly **one** table. It lives in the shared Supabase project; the table name is specific (`leads`) and does not collide with the customer-app schema. The paste-and-run `supabase-schema.sql` is produced in Stage 2 — this section defines the authoritative design.

### `leads`
**Purpose:** Capture demo / trial requests submitted from the marketing site.

| Column | Type | Constraints / Notes |
|---|---|---|
| `id` | `uuid` | PK, `default gen_random_uuid()` |
| `created_at` | `timestamptz` | `not null default now()` |
| `name` | `text` | `not null`, `check (char_length(name) between 1 and 200)` |
| `business_name` | `text` | `not null`, `check (char_length(business_name) between 1 and 200)` |
| `email` | `text` | `not null` (format validated app-side via Zod) |
| `phone` | `text` | nullable |
| `trade` | `text` | nullable (plumbing / HVAC / electrical / roofing / landscaping / cleaning / pest control / garage doors / other) |
| `weekly_calls` | `integer` | nullable, `check (weekly_calls is null or weekly_calls between 0 and 100000)` |
| `plan_interest` | `text` | nullable, `check (plan_interest is null or plan_interest in ('starter','pro','scale'))` |
| `message` | `text` | nullable, `check (message is null or char_length(message) <= 2000)` |
| `source_path` | `text` | nullable (page the form was submitted from) |
| `user_agent` | `text` | nullable (coarse attribution) |

**Relationships:** None — standalone table (the marketing site holds no other entities).
**Indexes:** `idx_leads_created_at` on `(created_at desc)` for GTM review ordering.
**RLS:** **Enabled, with no anon/public policies.** Only the server's service-role client may `insert`/`select`. The browser never touches Supabase directly. (Exact policy SQL is produced in Stage 2 / hardened in Stage 7 Security Foundation.)

**Privacy / data-lifecycle (this is PII: name, email, phone):**
- Encrypted in transit (HTTPS) and at rest (Supabase/Postgres default).
- Collected only with the visitor's active submission; the Contact page links to `/privacy`, and the form includes a short consent line ("By submitting you agree to be contacted about Handled").
- No cross-customer sharing; no third-party ad/analytics pixels on form pages in MVP.
- Retention: GTM reviews and exports leads out-of-band; recommend a retention window (e.g., purge non-converted leads after 24 months) to be enforced operationally / via a scheduled job — documented here, implemented later (not in the website build).

---

## 8. AI Architecture

**Not applicable.** The marketing website contains **no LLM, voice, telephony, or agentic features**. All AI functionality (voice agent, intent routing, FSM tool calls, conversation memory, evals) lives in `apps/customer-app`, the n8n backend, and the test harness — separate apps. This section is intentionally empty for the website per the skill's "only if AI features exist" rule.

---

## 9. API Specification

The site exposes exactly one endpoint.

### `POST /api/leads`
- **Purpose:** Store (or no-op) a demo/trial request from the marketing site.
- **Auth required:** None (public). Protected by IP rate-limit + honeypot + min-fill-time.
- **Runtime:** Node (so the service-role Supabase client can run server-side).
- **Request body (JSON):**
  ```ts
  {
    name: string;              // 1–200
    businessName: string;      // 1–200
    email: string;             // valid email
    phone?: string;            // optional, <= 40
    trade?: string;            // optional enum-ish
    weeklyCalls?: number;      // optional 0–100000
    planInterest?: 'starter' | 'pro' | 'scale';
    message?: string;          // optional <= 2000
    sourcePath?: string;       // optional
    company?: string;          // HONEYPOT — must be empty
  }
  ```
- **Validation rules (Zod, shared client+server):** required `name`, `businessName`, `email` (valid format); `company` honeypot must be empty; `weeklyCalls` within range; `planInterest` within enum; string length caps as above.
- **Responses:**
  | Status | Body | When |
  |---|---|---|
  | `200` | `{ ok: true, stored: boolean }` | Accepted; `stored` reflects whether Supabase env was present and insert succeeded |
  | `400` | `{ ok: false, error: 'validation', fields: Record<string,string> }` | Zod failure or honeypot tripped |
  | `429` | `{ ok: false, error: 'rate_limited' }` | IP exceeded the token bucket |
  | `500` | `{ ok: false, error: 'server' }` | Unexpected server error (stack never leaked) |

No other endpoints exist in this app.

---

## 10. Feature Breakdown

### Phase 1 (MVP — this build)

| # | Feature | Acceptance criteria | Dependencies |
|---|---|---|---|
| 1 | **Design system wiring** | All tokens from `design.md` available as CSS vars + Tailwind theme; `ui/` primitives (Button, Badge, Card) use only semantic tokens; zero hardcoded hex in components | `design.md` |
| 2 | **Global nav + footer** | Sticky nav; mobile sheet < 768px; "Book a demo" CTA always visible; footer with nav links + legal (Privacy/Terms) | design system |
| 3 | **Home page** | Hero with positioning line + primary CTA; StatBand (27% missed, 52% answered, 62% call competitor, 85% never call back, ~$1,200/call); problem→solution; feature grid; how-it-works teaser; integrations strip; pricing teaser; testimonial; final CTA band | marketing components, `content/*` |
| 4 | **Why Handled (differentiator) page** | Leads with the **workflow-depth** narrative (office manager vs. receptionist), then differentiator blocks — (a) deep FSM integration (Jobber/Housecall Pro/ServiceTitan, books real jobs), (b) office-manager scope (missed-call text-back, quote follow-up, reminders, reviews), (c) trade-aware emergency triage, (d) trust & transparent pricing; plus a "Handled vs. an AI receptionist" comparison table; CTA | `DifferentiatorBlock`, `ComparisonTable`, `content/differentiators.ts`, `content/comparison.ts` |
| 5 | **Features page** | Sections for: 24/7 natural-language answering, book into FSM, address/service-area check, SMS confirmations, missed-call text-back, emergency triage + warm transfer, spam/robocall filtering, transcripts + summaries + owner notify, outbound follow-up (labeled roadmap), Spanish (labeled roadmap) | `FeatureGrid`, `content/features.ts` |
| 6 | **Pricing page** | 3 Handled tiers (Starter / Pro / Scale) with the **premium tier anchored to competitor pricing**; competitor comparison table (reception.ai $199, Smith.ai $300) showing Handled does more (books into dispatch); transparent-pricing promise (flat price, hard spend cap, no charge for spam/hangups); pricing FAQ | `PricingTable`, `ComparisonTable`, `content/pricing.ts`, `content/faqs.ts` |
| 7 | **Integrations page** | Cards for Jobber, Housecall Pro, ServiceTitan + a "how booking works" explainer (availability check → verbatim confirm → create job) | `LogoCloud`, `content/integrations.ts` |
| 8 | **How it works page** | 3-step onboarding narrative (1 Connect your number + FSM, 2 Paste your website / configure services + rules, 3 Go live in minutes); reinforces self-serve "live in minutes" claim | `StepList` |
| 9 | **Contact / Book a demo** | Validated form → `POST /api/leads` → success state; reads `?plan=` prefill; graceful no-op without Supabase; consent line + privacy link | `DemoForm`, Zod, `lib/supabase`, `lib/rate-limit` |
| 10 | **Privacy & Terms pages** | Static legal content covering lead-data handling (PII, consent, contact purpose, retention), cookie posture (no non-essential cookies in MVP) | content |
| 11 | **SEO/meta** | Per-page `metadata` (title/description/OG/Twitter), `sitemap.ts`, `robots.ts`, canonical URLs | `lib/seo.ts` |

### Phase 2 (deferred)
- ROI / missed-revenue calculator; customer case studies; resources/blog (MDX); English/Spanish localization (`next-intl`).

### Phase 3 (deferred)
- Privacy-friendly analytics; A/B hero variants; live-chat widget; programmatic per-trade landing pages.

---

## 11. Folder Structure

```
apps/website/
├── app/
│   ├── layout.tsx                 # fonts, Nav, Footer, base metadata
│   ├── globals.css                # design-system tokens (:root) + base styles
│   ├── page.tsx                   # Home
│   ├── why-handled/page.tsx
│   ├── features/page.tsx
│   ├── pricing/page.tsx
│   ├── integrations/page.tsx
│   ├── how-it-works/page.tsx
│   ├── contact/page.tsx
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   └── api/
│       └── leads/route.ts         # POST lead capture (only endpoint)
├── components/
│   ├── layout/                    # Nav, MobileNav, Footer, Container, Section
│   ├── marketing/                 # Hero, StatBand, FeatureCard, FeatureGrid, StepList,
│   │                              #   PricingTable, ComparisonTable, FaqAccordion,
│   │                              #   CtaBand, Testimonial, LogoCloud, DifferentiatorBlock
│   ├── form/                      # DemoForm, Field, Select, FormSuccess
│   └── ui/                        # Button, Badge, Card (design-system primitives)
├── content/                       # typed content modules (single source of marketing copy/data)
│   ├── pricing.ts  features.ts  faqs.ts  stats.ts
│   ├── integrations.ts  differentiators.ts  comparison.ts  testimonials.ts
├── lib/
│   ├── supabase/server.ts         # service-role client (server-only)
│   ├── validation/lead.ts         # shared Zod schema (client + server)
│   ├── rate-limit.ts              # in-memory IP token bucket
│   ├── seo.ts                     # metadata helpers
│   └── utils/cn.ts                # className merge
├── public/                        # logos, OG images, favicons
├── tailwind.config.ts
├── postcss.config.js
├── next.config.mjs
├── tsconfig.json
├── package.json
└── .env.example                   # SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (optional)
```

---

## 12. Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Component files | PascalCase `.tsx` | `PricingTable.tsx` |
| Client components | PascalCase, `"use client"` at top | `DemoForm.tsx` |
| Route folders (URLs) | kebab-case | `why-handled/`, `how-it-works/` |
| Route Handler files | `route.ts` under `api/<name>/` | `api/leads/route.ts` |
| Hooks | `useX` camelCase | `useMediaQuery.ts` |
| Content modules | lowercase `.ts` | `content/pricing.ts` |
| Lib / util files | kebab-case `.ts` | `lib/validation/lead.ts`, `lib/rate-limit.ts` |
| Types / interfaces | PascalCase | `Lead`, `PricingTier` |
| DB tables | snake_case plural | `leads` |
| DB columns | snake_case | `business_name`, `weekly_calls` |
| Env vars | SCREAMING_SNAKE_CASE | `SUPABASE_SERVICE_ROLE_KEY` |
| Public env vars | `NEXT_PUBLIC_` prefix | (none required in MVP) |
| CSS tokens | `--kebab-case` | `--brand`, `--space-4`, `--text-primary` |
| Tailwind theme keys | map to tokens | `colors.brand`, `spacing.4`, `borderRadius.md` |

---

## 13. Testing Strategy

| Layer | Framework | Scope & coverage target |
|---|---|---|
| **Unit** | Vitest + React Testing Library | Zod lead schema (valid/invalid/honeypot/bounds); content modules shape; `ui/` primitives (Button, Badge, Card) and `PricingTable`/`ComparisonTable` render from content. Target ≥ 80% on `lib/` and `content/`. |
| **Integration** | Vitest (Route Handler) | `POST /api/leads`: happy path (200 stored:true with env), **env-missing no-op (200 stored:false)**, validation failure (400), honeypot reject (400), rate-limit (429), server error (500) without stack leak. |
| **E2E** | Playwright | Navigate all 9 pages; mobile nav sheet open/close; pricing tier CTA → `/contact?plan=` prefill; submit demo form → success screen; axe-core a11y smoke per page. |
| **Perf / a11y** | Lighthouse CI (optional in CI) | Performance ≥ 90 and Accessibility ≥ 90 on Home, Pricing, Why Handled. |

Key guardrail test: the **graceful-degradation** path (no Supabase env → form still returns success) is covered by an integration test so the recorded demo can never regress.

---

## 14. Specs → Implementation Mapping

| Spec (Stage 2 output) | Implementation files | Flow (spec → code) |
|---|---|---|
| `design-system-setup.md` | `app/globals.css`, `tailwind.config.ts`, `components/ui/*` | `design.md` tokens → CSS `:root` vars → Tailwind theme → UI primitives |
| `layout-and-nav.md` | `app/layout.tsx`, `components/layout/*` | base metadata + Nav/MobileNav/Footer shell |
| `home-page.md` | `app/page.tsx`, `components/marketing/*`, `content/stats.ts`, `content/features.ts`, `content/testimonials.ts` | content modules → Hero/StatBand/FeatureGrid/CtaBand sections |
| `why-handled.md` | `app/why-handled/page.tsx`, `DifferentiatorBlock`, `ComparisonTable`, `content/differentiators.ts`, `content/comparison.ts` | four moats + "vs AI receptionist" table |
| `features.md` | `app/features/page.tsx`, `FeatureGrid`, `content/features.ts` | capability data → feature sections |
| `pricing.md` | `app/pricing/page.tsx`, `PricingTable`, `ComparisonTable`, `FaqAccordion`, `content/pricing.ts`, `content/faqs.ts` | tier data (premium anchored to competitor price) → table + comparison + FAQ |
| `integrations.md` | `app/integrations/page.tsx`, `LogoCloud`, `content/integrations.ts` | FSM vendor data → cards + "how booking works" |
| `how-it-works.md` | `app/how-it-works/page.tsx`, `StepList` | 3-step onboarding narrative |
| `lead-capture.md` | `app/contact/page.tsx`, `components/form/DemoForm`, `app/api/leads/route.ts`, `lib/validation/lead.ts`, `lib/supabase/server.ts`, `lib/rate-limit.ts` | form → shared Zod → Route Handler → (optional) Supabase, with no-op fallback |
| `supabase-schema.sql` | Supabase SQL editor | `leads` table + indexes + RLS (enabled, service-role only) |
| `seo.md` | `app/sitemap.ts`, `app/robots.ts`, `lib/seo.ts`, per-page `metadata` | SEO surface |
| `legal.md` | `app/privacy/page.tsx`, `app/terms/page.tsx` | PII/consent/retention + terms copy |

---

## Appendix A — Resolved Decisions & Assumptions

These resolve the prior draft's open questions so the doc is gap-free. Flag any you want changed before Stage 2.

1. **Pricing anchoring (per notepad + caller guidance "use competitor pricing anchored in the premium tier").** Handled shows **three tiers — Starter $149 / Pro $299 (most popular, premium) / Scale $599** (PRD directional pricing). The **premium/most-popular Pro tier ($299) is deliberately anchored to the premium competitor price band** (reception.ai Premium $199, Smith.ai Starter $300): the Pricing page places a competitor comparison table beside the tiers so a visitor sees Handled priced at the same level as a premium AI receptionist while doing strictly more (books into dispatch, office-manager scope, triage). ROI framing: "one captured ~$1,200 job pays for months." Exact numbers are editable in `content/pricing.ts`.
2. **Lead-form backend.** Keep the Supabase `leads` table with **graceful no-op** when env is absent (default). This gives a real, reviewable lead store while guaranteeing the recorded demo cannot fail.
3. **Page set.** Confirmed the **9-page set** (Home, Why Handled, Features, Pricing, Integrations, How it works, Contact, Privacy, Terms).
4. **Localization.** English-only for the website MVP; Spanish deferred to Phase 2 (architecture leaves room for `next-intl`), even though the product itself targets bilingual at launch.
5. **Analytics.** None in MVP (no third-party pixels on form pages, privacy-preserving by default). Deferred to Phase 3.
