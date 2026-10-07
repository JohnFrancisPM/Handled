# Spec: How It Works Page (`app/how-it-works/page.tsx`)

**App:** `apps/website`
**Implements:** R19, R36
**Depends on:** `components.md`, `content-modules.md`, `seo.md`
**Route:** `/how-it-works` — Server Component, statically generated.

The 3-step onboarding narrative. Reinforces the self-serve "live in minutes" claim (PRD §2 setup user story: "go live in minutes by pasting my website and connecting my FSM, not by filling out a 40-field form").

---

## Section order

### 1. Hero
- `Hero as="h1"`:
  - `eyebrow`: "How it works"
  - `heading`: **"Live in minutes — not a 40-field form."**
  - `subheading`: "Connect your number and FSM, paste your website, set your rules. Handled starts answering and booking right away."
  - `primaryCta`: `{ label: "Book a demo", href: "/contact" }`

### 2. Steps (R19)
- `StepList steps={onboardingSteps}` from `content/steps.ts`:
  1. Connect your number & FSM
  2. Paste your website & set your rules
  3. Go live in minutes
- Desktop: 3-across with connectors; mobile: vertical. Numbered circles (brand).

### 3. What happens on a call (optional, R36)
- A compact narrative of PRD Flow A (answer → understand intent → check availability → confirm → book → SMS → notify owner) rendered as a short ordered list or mini-flow. Keeps the page educational and links to `/features` and `/integrations`.

### 4. Oversight reassurance
- Short line reflecting PRD transparency: "You see every transcript and summary and can correct anything — Handled keeps you in control."

### 5. CTA band
- `CtaBand heading="See your shop go live." ` → `/contact`.

---

## Metadata
```ts
export const metadata = pageMetadata({
  title: "How it works — Handled AI office manager",
  description: "Connect your number and FSM, paste your website, set your rules, and go live in minutes. See exactly how Handled answers, books, and follows up.",
  path: "/how-it-works"
});
```

---

## Acceptance criteria
- One `<h1>`.
- The 3 onboarding steps render in order from `content/steps.ts` (R19).
- "Live in minutes" self-serve claim present.
- Oversight/transparency line present (PRD alignment).
- CTA to `/contact` present; responsive.
