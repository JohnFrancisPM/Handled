# Spec: Features Page (`app/features/page.tsx`)

**App:** `apps/website`
**Implements:** R12, R36
**Depends on:** `components.md`, `content-modules.md`, `seo.md`
**Route:** `/features` — Server Component, statically generated.

Full product-capability surface. Maps to PRD §2 functional requirements. Roadmap items are clearly labeled (ED §10 F5).

---

## Section order

### 1. Hero
- `Hero as="h1"`:
  - `eyebrow`: "Features"
  - `heading`: **"Everything an office manager does — answered, booked, followed up."**
  - `subheading`: "Handled handles the whole call, not just the hello. Here's what it does for your shop."
  - `primaryCta`: `{ label: "Book a demo", href: "/contact" }`

### 2. Feature grid (live) (R12)
- Heading: **"What Handled does today"**
- `FeatureGrid features={features.filter(f => f.status === "live")} columns={3}`.
- Live capabilities (all from `content/features.ts`): 24/7 natural-language answering; books real jobs into your FSM; address/service-area check; SMS confirmations; missed-call text-back; trade-aware emergency triage; spam & robocall filtering; transcripts, summaries & owner notify.

### 3. Roadmap grid (R12)
- Heading: **"On the roadmap"**
- `FeatureGrid features={features.filter(f => f.status === "roadmap")} columns={2}`.
- Each card shows the `Badge tone="grey"` "Roadmap" (rendered by `FeatureCard`).
- Roadmap items: outbound follow-up (quotes/reminders/reviews); Spanish support.

### 4. Reinforcement block (optional, R36)
- A short "How it comes together" strip linking to `/how-it-works` and `/integrations` so the page sits in the funnel.

### 5. CTA band
- `CtaBand heading="See every feature in action." ` → `/contact`.

---

## Metadata
```ts
export const metadata = pageMetadata({
  title: "Features — Handled AI office manager",
  description: "24/7 answering, dispatch-grade booking into your FSM, address checks, SMS confirmations, missed-call text-back, emergency triage, spam filtering, and transcripts.",
  path: "/features"
});
```

---

## Acceptance criteria
- One `<h1>`.
- Every live feature from `content/features.ts` renders; every roadmap feature renders with a visible "Roadmap" badge (R12).
- No roadmap item is implied to be shipping today.
- CTA to `/contact` present; responsive grid (1/2/3 columns by breakpoint).
