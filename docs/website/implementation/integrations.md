# Spec: Integrations Page (`app/integrations/page.tsx`)

**App:** `apps/website`
**Implements:** R18, R36
**Depends on:** `components.md`, `content-modules.md`, `seo.md`
**Route:** `/integrations` — Server Component, statically generated.

Shows the FSM integrations (Jobber, Housecall Pro, ServiceTitan) and explains how dispatch-grade booking works. Reinforces the core moat (PRD §1 MOAT #1; notepad).

---

## Section order

### 1. Hero
- `Hero as="h1"`:
  - `eyebrow`: "Integrations"
  - `heading`: **"Books real jobs into the system you already use."**
  - `subheading`: "Handled connects to your field-service software and creates the actual job — respecting tech skills, availability, and service area. Not a generic calendar event."
  - `primaryCta`: `{ label: "Book a demo", href: "/contact" }`

### 2. FSM vendor cards (R18)
- Heading: **"Your field-service system, connected"**
- Render `integrations` (Jobber, Housecall Pro, ServiceTitan) as cards: each shows logo (via `LogoCloud`/`Card` + logo-or-chip fallback) and blurb from `content/integrations.ts`.
- `grid-cols-1 md:grid-cols-3 gap-6`.

### 3. "How booking works" explainer (R18)
- Heading: **"How Handled books a job"**
- `StepList steps={bookingSteps}` — the 3 steps from `content/integrations.ts`:
  1. Check real availability
  2. Confirm verbatim
  3. Create the job
- This mirrors PRD Flow A (availability check → verbatim confirm → create job).

### 4. Differentiator callout (R36)
- Short band: "Most AI receptionists drop an event on a Google Calendar. Handled books the real job." Link to `/why-handled`.

### 5. CTA band
- `CtaBand heading="Connect your FSM and go live in minutes." ` → `/contact`.

---

## Metadata
```ts
export const metadata = pageMetadata({
  title: "Integrations — Jobber, Housecall Pro & ServiceTitan | Handled",
  description: "Handled books real jobs into Jobber, Housecall Pro, and ServiceTitan — checking live availability, tech skills, and service area, then confirming verbatim before writing.",
  path: "/integrations"
});
```

---

## Acceptance criteria
- One `<h1>`.
- All three FSM vendors render with name + blurb; missing logo assets fall back to styled text chips (never block the build).
- The 3-step "how booking works" explainer renders in order (R18).
- Links to `/why-handled` and `/contact` present.
- Responsive; cards stack on mobile.
