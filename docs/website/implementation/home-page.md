# Spec: Home Page (`app/page.tsx`)

**App:** `apps/website`
**Implements:** R6, R7, R8, R17, R35, R36
**Depends on:** `components.md`, `content-modules.md`, `design-system-setup.md`, `seo.md`
**Route:** `/` — Server Component, statically generated.

The Home page is the top of the funnel: make the missed-call pain visceral in seconds, then show Handled books real jobs into the FSM and does the office-manager's job. IA mirrors proven competitor marketing structure (R36): hero → stat band → problem/solution → features → how-it-works teaser → integrations strip → pricing teaser → testimonial → final CTA.

---

## Section order (top → bottom)

### 1. Hero (R6)
- `Hero as="h1"` with:
  - `eyebrow`: "The AI office manager for home & local service businesses"
  - `heading`: **"Stop losing jobs to the competitor who picked up first."**
  - `subheading`: `site.positioning` (from `content/site.ts`).
  - `primaryCta`: `{ label: "Book a demo", href: "/contact" }`
  - `secondaryCta`: `{ label: "See how it works", href: "/how-it-works" }`
- The positioning line is the PRD/ED one-liner (R35 — leads on booking + follow-up, not voice quality).

### 2. StatBand (R7)
- `StatBand stats={missedCallStats}` with heading: **"The leak is invisible — until you add it up."**
- Renders all 5 stats verbatim (27% / 52% / 62% / 85% / ~$1,200).

### 3. Problem → Solution (R8)
- Two-part block inside a `Section`:
  - Problem: short paragraph — "You're on a roof or under a sink. The phone rings. Voicemail doesn't save the job — most callers just dial the next company." (sourced from PRD §1).
  - Solution: "Handled answers every call, qualifies the job, checks real availability, and books it into your field-service system — then texts the caller and follows up. The work that used to fall through the cracks gets *handled*."
- Optional supporting 3-up mini-points (Answer → Book → Follow up) using lucide icons.

### 4. Feature grid (R8)
- Heading: **"Everything an office manager does — without the $62K salary."**
- `FeatureGrid features={features.filter(f => f.status === "live")} columns={3}` to foreground shipping capabilities; optionally include roadmap items with their "Roadmap" badge below a divider, or link "See all features →" to `/features`.
- Must include a clear link to `/features`.

### 5. How-it-works teaser (R8, R36)
- Compact `StepList steps={onboardingSteps}` (the 3 steps) or a 3-up summary, with "See how it works →" linking to `/how-it-works`.

### 6. Integrations strip (R8)
- `LogoCloud items={integrations} heading="Books real jobs into your field-service system"`.
- Sub-line: "Jobber, Housecall Pro, and ServiceTitan — not a generic calendar event." Links to `/integrations`.

### 7. Pricing teaser (R8, R17)
- Heading: **"One captured job pays for months."** (ROI framing — R17.)
- Short paragraph referencing flat, transparent pricing, then a `Button href="/pricing"` ("See pricing"). Optionally render the three tier names/prices as compact cards; full table lives on `/pricing`.

### 8. Testimonial (R8)
- `Testimonial testimonial={testimonials[0]}` (illustrative; carries placeholder note from content module).

### 9. Final CTA band (R8)
- `CtaBand heading="See Handled answer and book a real job." subheading="Book a 15-minute demo — we'll show it live." ` → `/contact`.

---

## Metadata (see `seo.md`)
```ts
export const metadata = pageMetadata({
  title: "Handled — The AI office manager for home & service businesses",
  description: "Handled answers every call, books the job into Jobber, Housecall Pro, or ServiceTitan, and follows up — so you stop losing revenue to the competitor who picked up first.",
  path: "/"
});
```

---

## Acceptance criteria
- Exactly one `<h1>` (Hero heading).
- All 5 stats render with values and sources verbatim from `content/stats.ts`.
- Primary "Book a demo" CTA appears in the hero and the final CTA band (plus the persistent nav CTA).
- Links out to `/features`, `/how-it-works`, `/integrations`, `/pricing`, `/contact` all present.
- ROI line "One captured job pays for months" present (R17).
- No voice-quality superiority claim anywhere (R35).
- Lighthouse Performance ≥90 and Accessibility ≥90 (R31 / `testing.md`).
- Fully responsive; no horizontal scroll; nav collapses to sheet `<768px`.
