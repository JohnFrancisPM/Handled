# Implementation Specs — Handled Marketing Website

**App:** `website` (`apps/website`)
**Stage:** 2 of 7 (Implementation Specs)
**Source of truth:** `docs/website/engineering/engineering-doc.md` (approved Stage 1 HLD), `docs/PRD.md`, `notepad.md` ("Handled company website"), `docs/design.md`, `docs/Competitive Research.md`
**Status:** Ready for Stage 3 (Frontend Setup) once approved

> These specs are granular and runnable. A developer can build each page, the lead-capture API route, shared validation, and the design system from these files alone without re-deriving decisions. All copy, pricing, stats, and comparison data are given verbatim so nothing is invented at build time.

---

## How to read these specs

1. Start with **`project-setup.md`** — scaffolding, config, dependencies, folder structure.
2. Then **`design-system-setup.md`** — tokens, Tailwind theme, UI primitives. Everything else depends on this.
3. Then **`content-modules.md`** — the typed `content/*.ts` modules that hold every piece of marketing copy/data. Pages render from these.
4. Then **`components.md`** — shared layout / marketing / form component contracts.
5. Then the page specs (`layout-and-nav.md`, `home-page.md`, `why-handled.md`, `features.md`, `pricing.md`, `integrations.md`, `how-it-works.md`, `legal.md`).
6. Then **`lead-capture.md`** — the one dynamic feature (form → API route → Supabase, with graceful no-op).
7. Then **`seo.md`**, **`testing.md`**.
8. Run **`supabase-schema.sql`** in the Supabase SQL Editor; copy **`.env.example`** to `.env.local`.

---

## Spec file index

| File | Specifies |
|---|---|
| `project-setup.md` | Next.js 14 App Router scaffold: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.js`, folder structure, scripts |
| `design-system-setup.md` | `globals.css` token `:root`, Tailwind theme mapping, typography classes, `ui/` primitives (Button, Badge, Card, Container, Section) |
| `content-modules.md` | Every typed `content/*.ts` module with full verbatim copy/data (stats, features, pricing, comparison, differentiators, faqs, integrations, testimonials, nav) |
| `components.md` | Layout, marketing, and form component contracts (props, states, a11y, responsive behavior) |
| `layout-and-nav.md` | `app/layout.tsx`, Nav + MobileNav + Footer, base metadata, fonts |
| `home-page.md` | `app/page.tsx` section-by-section |
| `why-handled.md` | `app/why-handled/page.tsx` — four moats + "vs an AI receptionist" table |
| `features.md` | `app/features/page.tsx` — capability sections |
| `pricing.md` | `app/pricing/page.tsx` — 3 tiers + competitor comparison + pricing FAQ |
| `integrations.md` | `app/integrations/page.tsx` — Jobber / Housecall Pro / ServiceTitan + "how booking works" |
| `how-it-works.md` | `app/how-it-works/page.tsx` — 3-step onboarding narrative |
| `legal.md` | `app/privacy/page.tsx`, `app/terms/page.tsx` |
| `lead-capture.md` | `DemoForm`, `app/api/leads/route.ts`, `lib/validation/lead.ts`, `lib/supabase/server.ts`, `lib/rate-limit.ts` |
| `seo.md` | `app/sitemap.ts`, `app/robots.ts`, `lib/seo.ts`, per-page metadata |
| `testing.md` | Unit / integration / E2E / a11y test plan and the fixtures each test needs |
| `supabase-schema.sql` | Paste-and-run `leads` table + indexes + RLS (service-role only) |
| `.env.example` | Every env var the website needs (optional Supabase; graceful no-op without it) |

---

## Requirements traceability matrix

Every requirement from both source documents maps to a spec. `ED` = engineering doc section, `NP` = notepad, `PRD` = PRD.

| ID | Requirement | Source | Covered by |
|---|---|---|---|
| R1 | Next.js 14 App Router, TS strict, Tailwind, SSG content pages | ED §5 | `project-setup.md` |
| R2 | Design tokens from `design.md` → CSS vars → Tailwind; zero hardcoded hex | ED §10 F1, design.md | `design-system-setup.md` |
| R3 | `ui/` primitives (Button, Badge, Card, Container, Section) use only tokens | ED §5, §11 | `design-system-setup.md`, `components.md` |
| R4 | Global sticky nav + mobile sheet <768px + persistent "Book a demo" CTA | ED §10 F2 | `layout-and-nav.md`, `components.md` |
| R5 | Footer with nav links + legal | ED §10 F2 | `layout-and-nav.md` |
| R6 | Home: hero + positioning line + primary CTA | ED §10 F3 | `home-page.md`, `content-modules.md` |
| R7 | StatBand: 27% missed, 52% answered, 62% call competitor, 85% never call back, ~$1,200/call | ED §10 F3, PRD §1 | `content-modules.md`, `home-page.md` |
| R8 | Home: problem→solution, feature grid, how-it-works teaser, integrations strip, pricing teaser, testimonial, final CTA | ED §10 F3 | `home-page.md` |
| R9 | Why Handled: workflow-depth narrative (office manager vs receptionist) | ED §1, §10 F4, NP, PRD | `why-handled.md`, `content-modules.md` |
| R10 | Four differentiator blocks: FSM depth, office-manager scope, emergency triage, transparent pricing | ED §10 F4, NP, PRD §1 MOAT | `content-modules.md`, `why-handled.md` |
| R11 | "Handled vs an AI receptionist" comparison table | ED §10 F4 | `content-modules.md`, `why-handled.md` |
| R12 | Features page: all capability sections incl. roadmap-labeled items | ED §10 F5 | `features.md`, `content-modules.md` |
| R13 | Pricing: 3 tiers Starter $149 / Pro $299 (premium/most-popular) / Scale $599 | ED App.A.1, PRD §9 | `content-modules.md`, `pricing.md` |
| R14 | Premium tier anchored to competitor pricing (reception.ai $199, Smith.ai $300) | NP, ED App.A.1 | `content-modules.md`, `pricing.md` |
| R15 | Transparent-pricing promise (flat, hard cap, no charge for spam/hangups) | ED §10 F6, PRD §9 | `pricing.md`, `content-modules.md` |
| R16 | Pricing FAQ | ED §10 F6 | `content-modules.md`, `pricing.md` |
| R17 | ROI framing ("one captured $1,200 job pays for months") | ED App.A.1, PRD §9 | `pricing.md`, `home-page.md` |
| R18 | Integrations page: Jobber / Housecall Pro / ServiceTitan + "how booking works" | ED §10 F7, NP, PRD MOAT | `integrations.md`, `content-modules.md` |
| R19 | How it works: 3-step onboarding (Connect → Configure → Go live in minutes) | ED §10 F8, PRD setup story | `how-it-works.md`, `content-modules.md` |
| R20 | Contact / Book a demo: validated form → POST /api/leads → success | ED §10 F9, §4 Flow 2 | `lead-capture.md`, `components.md` |
| R21 | Form reads `?plan=` prefill | ED §4 Flow 3, §10 F9 | `lead-capture.md` |
| R22 | Graceful no-op when Supabase env absent (demo stability) | ED §6, §9, App.A.2 | `lead-capture.md`, `.env.example` |
| R23 | Shared Zod schema client+server (one source of truth) | ED §6, §9 | `lead-capture.md` |
| R24 | Honeypot + min-fill-time + IP rate limit | ED §6, §9 | `lead-capture.md` |
| R25 | `leads` table schema + indexes + RLS (service-role only) | ED §7 | `supabase-schema.sql` |
| R26 | Consent line + privacy link on form | ED §7, §10 F9 | `lead-capture.md`, `legal.md` |
| R27 | Privacy & Terms pages (PII, consent, retention, cookie posture) | ED §7, §10 F10 | `legal.md` |
| R28 | SEO: per-page metadata, OG/Twitter, sitemap.ts, robots.ts, canonical | ED §2, §10 F11 | `seo.md` |
| R29 | Responsive: mobile-first, nav sheet, tables reflow to cards <768px, no horizontal scroll | ED §5 | `components.md`, each page spec |
| R30 | Accessibility: landmarks, one h1, labeled fields, focus rings, reduced-motion, keyboard | ED §5 | `components.md`, `design-system-setup.md`, `testing.md` |
| R31 | Lighthouse Perf ≥90 & A11y ≥90 on Home/Pricing/Why Handled | ED §2, §13 | `testing.md` |
| R32 | API POST /api/leads: 200/400/429/500 contract, typed envelope, no stack leak | ED §9 | `lead-capture.md` |
| R33 | Testing: unit/integration/E2E/a11y incl. graceful-degradation guard test | ED §13 | `testing.md` |
| R34 | Env vars documented (optional Supabase, server-only service role) | ED §6, §11 | `.env.example` |
| R35 | Messaging avoids competing on voice quality; leads on workflow depth + trust/billing | ED §1, Competitive Research §8 | `content-modules.md`, `why-handled.md`, `pricing.md` |
| R36 | IA modeled on competitor marketing sites (hero, stat band, product, integrations, how-it-works, pricing+comparison, why-us, demo CTA) | ED §2, NP | all page specs |
| R37 | 9-page set exactly | ED App.A.3 | all page specs |
| R38 | English-only MVP; architecture leaves room for next-intl (no i18n build) | ED App.A.4 | `project-setup.md` |
| R39 | No analytics / no third-party pixels in MVP | ED App.A.5, §7 | `layout-and-nav.md`, `legal.md` |
| R40 | Trade list for form dropdown (plumbing, HVAC, electrical, roofing, landscaping, cleaning, pest control, garage doors, other) | ED §7 | `content-modules.md`, `lead-capture.md` |

Coverage: all 40 requirement IDs map to at least one spec. No PRD/eng-doc website requirement is left unspecified.

---

## Build order (recommended)

1. `project-setup.md`
2. `design-system-setup.md`
3. `content-modules.md`
4. `components.md` (ui → layout → marketing → form)
5. `layout-and-nav.md`
6. Page specs (home, why-handled, features, pricing, integrations, how-it-works, legal)
7. `lead-capture.md` + run `supabase-schema.sql` + copy `.env.example`
8. `seo.md`
9. `testing.md`
