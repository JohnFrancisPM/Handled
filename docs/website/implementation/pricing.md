# Spec: Pricing Page (`app/pricing/page.tsx`)

**App:** `apps/website`
**Implements:** R13, R14, R15, R16, R17, R35
**Depends on:** `components.md`, `content-modules.md`, `seo.md`
**Route:** `/pricing` — Server Component, statically generated.

Three Handled tiers with the premium (Pro) tier **anchored to competitor pricing**, a competitor comparison table, the transparent-pricing promise, and a pricing FAQ.

---

## Section order

### 1. Hero
- `Hero as="h1"`:
  - `eyebrow`: "Pricing"
  - `heading`: **"Flat, transparent pricing. One captured job pays for months."** (R17)
  - `subheading`: "No per-minute billing. No surprise overage. No charge for spam. Pick the plan that fits your shop."
  - `primaryCta`: `{ label: "Book a demo", href: "/contact" }`

### 2. Pricing table (R13)
- `PricingTable tiers={pricingTiers}`.
- Starter $149 / **Pro $299 (Most popular badge, highlighted card)** / Scale $599 — exact figures from `content/pricing.ts`.
- Each tier CTA links to `/contact?plan={id}` (R21 prefill).

### 3. Transparent-pricing promise (R15)
- Render `pricingPromise` from `content/pricing.ts`:
  - Heading "Pricing you can actually trust"
  - The four points (flat price, hard spend cap, no charge for spam/hangups, ROI line).
- Styled as a reassurance band (surface bg, Check-bulleted). Directly answers the category's #1 complaint (Competitive Research §6).

### 4. Competitor comparison table (R14, R35)
- Heading: **"Priced like a premium AI receptionist — doing far more."**
- `ComparisonTable variant="pricing" rows={pricingComparison} note={pricingComparisonNote}`.
- Shows Handled Pro $299 beside reception.ai Premium $199 and Smith.ai Starter $300, plus a full-time office manager $42–62K/yr. Columns: Books into FSM / Office-manager scope / Emergency triage / Transparent pricing.
- This visibly anchors the premium tier against confirmed competitor prices (R14) and frames the ROI vs a human office manager (R17). It compares scope, never voice quality (R35).
- Reflows to stacked cards `<768px` (R29).

### 5. Pricing FAQ (R16)
- Heading: **"Pricing questions"**
- `FaqAccordion faqs={pricingFaqs}` (7 Q&As from `content/faqs.ts`).

### 6. CTA band
- `CtaBand heading="Not sure which plan? Let's talk." ` → `/contact`.

---

## Metadata
```ts
export const metadata = pageMetadata({
  title: "Pricing — Handled AI office manager",
  description: "Flat monthly pricing with a hard spend cap and no charge for spam calls. Starter $149, Pro $299, Scale $599. Priced like a premium AI receptionist while booking real jobs.",
  path: "/pricing"
});
```

---

## Acceptance criteria
- One `<h1>`.
- Three tiers render with exact prices ($149 / $299 / $599); Pro shows "Most popular" and highlighted card (R13).
- Each tier CTA carries the correct `?plan=` query param (R21).
- Competitor comparison shows reception.ai $199 and Smith.ai $300 verbatim (R14); Handled row highlighted.
- Transparent-pricing promise (flat / cap / no spam charge / ROI) present (R15, R17).
- Pricing FAQ renders all 7 entries and is keyboard-operable (R16, R30).
- All tables reflow to cards on mobile (R29). No voice-quality claim (R35).
