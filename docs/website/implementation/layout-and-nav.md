# Spec: Root Layout, Nav & Footer

**App:** `apps/website`
**Implements:** R4, R5, R30 (landmarks), R38, R39
**Depends on:** `design-system-setup.md`, `components.md`, `content-modules.md`, `seo.md`

Defines `app/layout.tsx` — the shell wrapping every page with fonts, global nav, footer, base metadata, and the design-system stylesheet.

---

## 1. `app/layout.tsx`

Structure:

```tsx
import "./globals.css";
import { Inter } from "next/font/google";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { baseMetadata } from "@/lib/seo";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = baseMetadata();   // see seo.md §2

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- `lang="en"` (English-only MVP — R38). The `<html>` `lang` makes adding `next-intl` later a localized-root change only.
- `<main id="main">` gives a skip-target and the single `<main>` landmark (R30).
- No analytics/tracking scripts, no third-party pixels (R39).
- `<Nav>` is the `<header>` landmark (Nav renders a `<header><nav>…` internally); `<Footer>` renders the `<footer>` landmark.

### Skip link
Add a visually-hidden-until-focused skip link as the first child of `<body>`:
```tsx
<a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-white focus:p-3">
  Skip to content
</a>
```
Define `.sr-only` / `.focus:not-sr-only` via Tailwind defaults (included).

---

## 2. Nav (R4)
Build per `components.md` → `Nav` + `MobileNav`. Requirements recap:
- Sticky, white, bottom border; 64px tall; `Container` aligned.
- Logo → `/`. Desktop `primaryNav` links + persistent primary "Book a demo" button (always visible, every page).
- `<768px`: `MobileNav` sheet with the same links + full-width "Book a demo" button.

## 3. Footer (R5)
Build per `components.md` → `Footer`:
- Product / Company / Legal columns from `content/nav.ts`.
- Legal column links to `/privacy` and `/terms`.
- `© {currentYear} Handled` + one-line positioning.

---

## 4. Acceptance criteria
- Every page renders inside Nav + main + Footer with exactly one of each landmark.
- "Book a demo" CTA reachable in one click from any page (desktop button + mobile sheet) — R4 / ED success criterion.
- Privacy and Terms reachable from the footer on every page.
- No tracking scripts in the document head/body.
- Skip link works via keyboard (Tab on load → "Skip to content" → focus `#main`).
