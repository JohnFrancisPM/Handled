# Spec: Why Handled Page (`app/why-handled/page.tsx`)

**App:** `apps/website`
**Implements:** R9, R10, R11, R35
**Depends on:** `components.md`, `content-modules.md`, `seo.md`
**Route:** `/why-handled` — Server Component, statically generated.

The differentiator page. Leads with the **workflow-depth** narrative (office manager vs. receptionist), lands all four moats, and closes with a "Handled vs. an AI receptionist" capability table. This page is explicitly required by the notepad ("Include a differentiator page").

---

## Section order

### 1. Hero / intro (R9)
- `Hero as="h1"` using `workflowDepthIntro` from `content/differentiators.ts`:
  - `eyebrow`: `workflowDepthIntro.eyebrow` ("Why Handled is different")
  - `heading`: `workflowDepthIntro.heading` ("A receptionist takes a message. Handled does the office manager's job.")
  - `subheading`: `workflowDepthIntro.body`
  - `primaryCta`: `{ label: "Book a demo", href: "/contact" }`
- This establishes the umbrella theme: depth of workflow is the moat, not voice quality (R35, ED §1).

### 2. Differentiator blocks (R10)
- Render all four `differentiators` with `DifferentiatorBlock`, alternating layout by index:
  1. Dispatch-grade FSM integration
  2. Office-manager scope
  3. Trade-aware emergency triage
  4. Trust & transparent pricing
- Each shows icon, title, summary, body, and the `points[]` as a Check-bulleted list — all verbatim from the content module.

### 3. "Handled vs. an AI receptionist" table (R11)
- Heading: **"Handled vs. a typical AI receptionist"**
- `ComparisonTable variant="capability" rows={capabilityComparison} colA="Handled" colB="A typical AI receptionist"`.
- Reflows to stacked cards `<768px` (R29).
- A short caption under the table clarifies the framing is about workflow scope, not voice quality (R35): "We don't compete on how the voice sounds — the incumbent owns that. We compete on everything that happens after 'hello.'"

### 4. CTA band
- `CtaBand heading="See the office manager your shop never hired." ` → `/contact`.

---

## Metadata
```ts
export const metadata = pageMetadata({
  title: "Why Handled — the office manager, not just a receptionist",
  description: "A receptionist takes a message. Handled books real jobs into your FSM, handles office-manager work, and triages emergencies. See the four reasons shops choose Handled.",
  path: "/why-handled"
});
```

---

## Acceptance criteria
- One `<h1>` (intro heading).
- All four moats render in order with their points, from `content/differentiators.ts`.
- Capability comparison table present and reflows to cards on mobile.
- Framing is workflow depth + trust; no claim of superior voice quality (R35).
- CTA to `/contact` present.
