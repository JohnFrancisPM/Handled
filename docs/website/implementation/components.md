# Spec: Component Library

**App:** `apps/website`
**Implements:** R3, R4, R5, R29, R30 and provides the building blocks for all page specs
**Depends on:** `design-system-setup.md` (tokens + `ui/` primitives), `content-modules.md` (data shapes)

Component contracts for `components/layout/`, `components/marketing/`, and `components/form/`. `ui/` primitives (Button, Badge, Card, Container, Section) are defined in `design-system-setup.md` §4 — reuse them; do not reimplement.

**Rendering rule (ED §5):** every component is a **Server Component** except the three interactive leaves — `DemoForm`, `MobileNav`, `FaqAccordion` — which carry `"use client"`. Lead-capture components (`DemoForm`, `Field`, `Select`, `FormSuccess`) are specified in `lead-capture.md`; this file covers layout + marketing.

**Global rules for every component:**
- Tokens only (no raw hex). Spacing on the 4px grid.
- Responsive, mobile-first; no horizontal scroll at any width ≥320px; 16px min side gutter.
- Semantic HTML; images have `alt`; interactive elements keyboard-operable with visible focus.

---

## Layout components

### `Nav` (`components/layout/Nav.tsx`) — Server Component
- Sticky top bar: `sticky top-0 z-50 bg-white border-b border-grey-100`.
- Left: Handled wordmark/logo (links to `/`). Right (≥768px): `primaryNav` links from `content/nav.ts` rendered as text links (grey-900, hover brand), plus a primary `Button href="/contact"` ("Book a demo") always visible (R4).
- `<768px`: links collapse; render `<MobileNav />` (the hamburger trigger + sheet).
- Uses `Container` for horizontal alignment. Height 64px.
- Active link gets `aria-current="page"` and brand-colored text (compare `usePathname` is client-only — to keep Nav a Server Component, pass the current path via the layout or style active state in `MobileNav`/a small client sub-link; acceptable: render active styling in the client `MobileNav` only, desktop links need not show active state, or extract a tiny `NavLink` client component). Implementation choice: a minimal `NavLinks` client component may be used for active styling; keep the shell server-rendered.

### `MobileNav` (`components/layout/MobileNav.tsx`) — Client Component (`"use client"`)
- Hamburger button (lucide `Menu`), `aria-label="Open menu"`, `aria-expanded`, `aria-controls`.
- Opens a full-width sheet/drawer below the nav: slides/fades in (`duration-[var(--motion-panel)] ease-ds-out`), respects reduced motion.
- Sheet lists `primaryNav` links (stacked, `type-body-lg`, `py-3`) + a full-width primary "Book a demo" button.
- Close on: link click, Escape key, backdrop click, close button (lucide `X`).
- Focus trap within the sheet while open; return focus to the trigger on close. Body scroll locked while open.
- `aria-current="page"` on the active link (via `usePathname`).

### `Footer` (`components/layout/Footer.tsx`) — Server Component
- `bg-grey-25 border-t border-grey-100`, `py-16`.
- Top row: logo + one-line positioning (from `site.ts`), then the `footerNav` columns (Product / Company / Legal) from `content/nav.ts`.
- Bottom row: `© {year} Handled` + small print. Legal links (Privacy, Terms) must be present (R5).
- No analytics/tracking scripts (R39).
- Responsive: columns stack to a single column `<768px`.

### `Section` — defined in `design-system-setup.md` §4.6 (layout wrapper).
### `Container` — defined in `design-system-setup.md` §4.5.

---

## Marketing components

### `Hero` (`components/marketing/Hero.tsx`) — Server Component
Props:
```ts
type HeroProps = {
  eyebrow?: string;
  heading: string;              // rendered as the page <h1> when used at top of a page
  subheading: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  as?: "h1" | "h2";            // default "h1"
};
```
- Centered or left-aligned block within `Section` + `Container`.
- Heading uses `type-h1` (responsive 32/40 → 48/56). Subheading `type-body-lg` in `text-secondary`, max-width ~60ch.
- CTAs: primary `Button variant="primary" size="lg"`, secondary `Button variant="secondary" size="lg"`.
- Exactly one `h1` per page — Hero at page top uses `as="h1"`; elsewhere `as="h2"`.

### `StatBand` (`components/marketing/StatBand.tsx`) — Server Component
Props: `{ stats: Stat[]; heading?: string }`.
- Renders the 5 `missedCallStats` as a responsive grid (`grid-cols-2 md:grid-cols-5`, `gap-6`).
- Each stat: large value (`type-h2` or `type-h3`, brand or grey-900) + label (`type-body-sm`, text-secondary) + source note (tiny, text-secondary).
- Surface background (`bg-grey-25`) to separate it visually.

### `FeatureCard` (`components/marketing/FeatureCard.tsx`) — Server Component
Props: `{ feature: Feature }`.
- `Card` with: icon (resolved from lucide via a name→component map), title (`type-h5`), blurb (`type-body-lg`, text-secondary).
- If `feature.status === "roadmap"`, render a `Badge tone="grey"` reading "Roadmap" (R12).
- Icon color brand; icon size 24px.
- **Icon map:** a module `components/marketing/iconMap.ts` exports `Record<string, LucideIcon>` covering every icon name used in `content/*.ts` (PhoneCall, CalendarCheck, MapPin, MessageSquare, MessageCircleReply, Siren, ShieldX, FileText, Send, Languages, Briefcase, ShieldCheck). Unknown names fall back to a default icon.

### `FeatureGrid` (`components/marketing/FeatureGrid.tsx`) — Server Component
Props: `{ features: Feature[]; columns?: 2 | 3 }` (default 3).
- Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-{columns}`, `gap-6`.
- Maps each feature to a `FeatureCard`.

### `StepList` (`components/marketing/StepList.tsx`) — Server Component
Props: `{ steps: Step[] }` (shape from `content/steps.ts`) or `{ steps: {title:string; body:string}[] }` for booking steps.
- Ordered list; each step shows a numbered circle (brand bg, white text, radius full), title (`type-h5`), body (`type-body-lg`, text-secondary).
- Desktop: horizontal 3-across with connectors; mobile: vertical stack. Use semantic `<ol>`.

### `PricingTable` (`components/marketing/PricingTable.tsx`) — Server Component
Props: `{ tiers: PricingTier[] }`.
- Three `Card`s in a `grid-cols-1 md:grid-cols-3 gap-6`.
- The `mostPopular` tier uses `Card highlight` (2px brand border) + a `Badge tone="brand"` reading "Most popular" (R13/R14).
- Each card: name (`type-h5`), tagline (text-secondary), price (`type-h2`) + priceNote, feature list (lucide `Check` bullets, brand), tier `Button` (primary for popular, secondary otherwise) linking to its `cta.href` (carries `?plan=`; R21).
- `<768px`: cards stack vertically (R29). Popular card remains visually emphasized.

### `ComparisonTable` (`components/marketing/ComparisonTable.tsx`) — Server Component
Two modes via a `variant` prop:
```ts
type ComparisonTableProps =
  | { variant: "capability"; rows: ComparisonRow[]; colA: string; colB: string }
  | { variant: "pricing"; rows: PriceCompareRow[]; note?: string };
```
- **capability variant:** 3-column table — Capability | Handled | colB (e.g. "An AI receptionist"). Boolean `true` → green `Check` icon; `false` → grey `X`/`Minus`; string → the string text. Handled column visually emphasized (brand-tinted header).
- **pricing variant:** columns Product | Price | Books into FSM | Office-manager scope | Emergency triage | Transparent pricing. The `highlight` row (Handled) gets a brand-tinted row background. Render `note` below.
- **Responsive (R29):** `<768px` the table reflows to **stacked cards** — one card per row with label:value pairs. Use a real `<table>` on desktop with `scope="col"`/`scope="row"` for a11y; swap to the card layout via CSS (`hidden md:table` + `md:hidden` card list) so screen readers still get a table on desktop.

### `FaqAccordion` (`components/marketing/FaqAccordion.tsx`) — Client Component (`"use client"`)
Props: `{ faqs: Faq[] }`.
- Each item: a `<button>` disclosure (question, `type-body-lg`, chevron icon that rotates) controlling a region (answer, `type-body-lg` text-secondary).
- `aria-expanded`, `aria-controls`, region `role="region"` + `aria-labelledby`. Keyboard: Enter/Space toggles; Tab moves between questions.
- Single-open or multi-open both acceptable; default: multiple can be open. Smooth height transition respecting reduced motion.
- Divider between items (`border-grey-100`).

### `CtaBand` (`components/marketing/CtaBand.tsx`) — Server Component
Props: `{ heading: string; subheading?: string; cta?: {label:string; href:string} }` (defaults to `site.primaryCta`).
- Full-width band, brand background (`bg-brand`) with white text, centered heading (`type-h3`) + subheading + a white/secondary `Button` to `/contact`.
- Appears at the end of every content page (ED §4 Flows 4 & 5; R8).

### `Testimonial` (`components/marketing/Testimonial.tsx`) — Server Component
Props: `{ testimonial: Testimonial }`.
- `Card` with quote (`type-h5`, grey-900), then name + business + trade (`type-body-sm`, text-secondary).
- `<blockquote>` + `<cite>` semantics.

### `LogoCloud` (`components/marketing/LogoCloud.tsx`) — Server Component
Props: `{ items: {name:string; logo?:string}[]; heading?: string }`.
- Row of integration logos (Jobber / Housecall Pro / ServiceTitan) or a feature strip.
- If `logo` present render `<img alt={name}>`; else render a token-styled text chip (grey-50 bg, grey-700 text, radius md) so the build never blocks on missing assets.
- Responsive wrap, `gap-6`.

### `DifferentiatorBlock` (`components/marketing/DifferentiatorBlock.tsx`) — Server Component
Props: `{ item: Differentiator; index: number }`.
- Alternating two-column layout (icon/summary left, body+points right; flips on odd index for rhythm). Stacks on mobile.
- Icon (brand, 32px), title (`type-h3`), summary (`type-body-lg` grey-900), body (`type-body-lg` text-secondary), points as a `Check`-bulleted list (brand icons).

---

## Accessibility acceptance (R30)
- Landmarks present once each: `<header>` (Nav), `<main>` (page), `<footer>` (Footer).
- Exactly one `<h1>` per page (the page Hero).
- All interactive elements reachable by keyboard; visible 2px brand focus ring (from globals).
- `MobileNav` and `FaqAccordion` meet WAI-ARIA disclosure patterns (expanded/controls, Escape, focus management).
- Color is never the only signal (icons/text accompany color in tables and badges).
- `prefers-reduced-motion` honored by all transitions.

## Responsive acceptance (R29)
- Nav collapses to `MobileNav` `<768px`.
- `PricingTable` and both `ComparisonTable` variants reflow to stacked cards `<768px`.
- No horizontal scroll at 320–1920px; min 16px side gutter via `Container`.
