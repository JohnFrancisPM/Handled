# Spec: Design System Setup

**App:** `apps/website`
**Implements:** R2, R3, R30 (partial)
**Depends on:** `project-setup.md`
**Source:** `docs/design.md` (allNeurons Design System) — the single authority for every color, spacing, type, radius, motion, and state value.

Goal: all `design.md` tokens are available as CSS custom properties and Tailwind theme keys. **Zero hardcoded hex in any component.** Components reference semantic tokens only.

---

## 1. `app/globals.css`

Declare the full primitive palette + semantic tokens + spacing + radius as CSS custom properties in `:root`, mirroring `design.md`'s Implementation Guidance block exactly.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* ---- Grey ---- */
  --color-grey-900: #070A0E; --color-grey-800: #151719; --color-grey-700: #25272B;
  --color-grey-600: #2C2F32; --color-grey-500: #4A4C4F; --color-grey-400: #5E6062;
  --color-grey-300: #8F9193; --color-grey-200: #C1C2C3; --color-grey-100: #DADADB;
  --color-grey-50: #F0F0F1;  --color-grey-25: #FAFAFA;

  /* ---- Blue (brand) ---- */
  --color-blue-900: #082A5E; --color-blue-800: #0A367B; --color-blue-700: #0D469E;
  --color-blue-600: #0044AE; --color-blue-500: #115ACB; --color-blue-400: #89B7FF;
  --color-blue-300: #6196EA; --color-blue-200: #92B7F0; --color-blue-100: #B6CFF5;
  --color-blue-50: #E7EFFC;

  /* ---- Green ---- */
  --color-green-900: #084406; --color-green-800: #0A5908; --color-green-700: #0D720A;
  --color-green-600: #11930D; --color-green-500: #13A10E; --color-green-400: #42B43E;
  --color-green-300: #61C05E; --color-green-200: #92D490; --color-green-100: #B6E2B4;
  --color-green-50: #E7F6E7;

  /* ---- Red ---- */
  --color-red-900: #581618; --color-red-800: #731D1F; --color-red-700: #942528;
  --color-red-600: #BE2F33; --color-red-500: #D13438; --color-red-400: #DA5D60;
  --color-red-300: #E0777A; --color-red-200: #EAA2A3; --color-red-100: #F1C0C1;
  --color-red-50: #FAEBEB;

  /* ---- Yellow ---- */
  --color-yellow-900: #854D00; --color-yellow-800: #B36800; --color-yellow-700: #DB8000;
  --color-yellow-600: #FA9200; --color-yellow-500: #FFAA33; --color-yellow-400: #FFC16B;
  --color-yellow-300: #FFD294; --color-yellow-200: #FFE3BD; --color-yellow-100: #FFF2E0;
  --color-yellow-50: #FFF9F0;

  /* ---- Violet ---- */
  --color-violet-900: #380070; --color-violet-800: #5700AD; --color-violet-700: #6600CC;
  --color-violet-600: #7000E0; --color-violet-500: #7F00FF; --color-violet-400: #B870FF;
  --color-violet-300: #D1A3FF; --color-violet-200: #E3C7FF; --color-violet-100: #F2E5FF;
  --color-violet-50: #F7F0FF;

  /* ---- Orange ---- */
  --color-orange-900: #802400; --color-orange-800: #B33300; --color-orange-700: #D63D00;
  --color-orange-600: #E63900; --color-orange-500: #FF4405; --color-orange-400: #FF956B;
  --color-orange-300: #FFBA9E; --color-orange-200: #FFD3C2; --color-orange-100: #FFE9E0;
  --color-orange-50: #FFF4F0;

  /* ---- Semantic tokens ---- */
  --text-primary: var(--color-grey-900);
  --text-secondary: var(--color-grey-500);
  --bg-primary: #FFFFFF;
  --bg-surface: var(--color-grey-25);
  --bg-subtle: var(--color-grey-50);
  --brand: var(--color-blue-500);
  --border-default: var(--color-grey-100);
  --border-hover: var(--color-grey-200);
  --focus-ring: var(--color-blue-500);

  /* ---- Spacing (4px base) ---- */
  --space-0: 0px; --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-10: 40px; --space-12: 48px; --space-16: 64px;
  --space-24: 96px; --space-28: 112px;

  /* ---- Radius ---- */
  --radius-sm: 4px; --radius-md: 6px; --radius-lg: 8px; --radius-xl: 12px;

  /* ---- Motion ---- */
  --motion-fast: 100ms; --motion-base: 150ms; --motion-panel: 200ms; --motion-page: 250ms;
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

html { -webkit-text-size-adjust: 100%; }

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-inter), system-ui, sans-serif;
  letter-spacing: 0;
  -webkit-font-smoothing: antialiased;
}

/* Typography roles (design.md §Typography) */
.type-h1 { font-size: 48px; font-weight: 700; line-height: 56px; letter-spacing: 0; }
.type-h2 { font-size: 36px; font-weight: 700; line-height: 44px; letter-spacing: 0; }
.type-h3 { font-size: 30px; font-weight: 600; line-height: 38px; letter-spacing: 0; }
.type-h4 { font-size: 28px; font-weight: 600; line-height: 36px; letter-spacing: 0; }
.type-h5 { font-size: 24px; font-weight: 500; line-height: 32px; letter-spacing: 0; }
.type-body-lg { font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: 0; }
.type-body-sm { font-size: 12px; font-weight: 400; line-height: 18px; letter-spacing: 0; }

/* Visible focus ring (a11y — design.md state table "Focus") */
:where(a, button, input, select, textarea, [tabindex]):focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Responsive type note:** H1/H2 scale down on mobile via Tailwind responsive utilities on the element (e.g. `text-[32px] leading-[40px] md:text-[48px] md:leading-[56px]`), not by editing the base class. H1 mobile = 32/40, H2 mobile = 28/36.

---

## 2. Fonts (`app/layout.tsx`)

Load Inter via `next/font/google` and expose it as `--font-inter`. `design.md` names "Inter Display"; use `Inter` from Google Fonts as its web equivalent (per ED §5).

```ts
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
// apply inter.variable to <html className={inter.variable}>
```

Optional `JetBrains_Mono` (variable `--font-mono`) may be loaded for incidental numeric accents only; not required for MVP pages.

---

## 3. `tailwind.config.ts`

Map Tailwind theme keys to the CSS variables so utilities resolve to tokens. Never add arbitrary hex in `theme`.

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        grey: {
          900: "var(--color-grey-900)", 800: "var(--color-grey-800)", 700: "var(--color-grey-700)",
          600: "var(--color-grey-600)", 500: "var(--color-grey-500)", 400: "var(--color-grey-400)",
          300: "var(--color-grey-300)", 200: "var(--color-grey-200)", 100: "var(--color-grey-100)",
          50: "var(--color-grey-50)", 25: "var(--color-grey-25)"
        },
        brand: {
          DEFAULT: "var(--color-blue-500)",
          900: "var(--color-blue-900)", 800: "var(--color-blue-800)", 700: "var(--color-blue-700)",
          600: "var(--color-blue-600)", 500: "var(--color-blue-500)", 400: "var(--color-blue-400)",
          300: "var(--color-blue-300)", 200: "var(--color-blue-200)", 100: "var(--color-blue-100)",
          50: "var(--color-blue-50)"
        },
        green: { 900:"var(--color-green-900)",800:"var(--color-green-800)",700:"var(--color-green-700)",600:"var(--color-green-600)",500:"var(--color-green-500)",400:"var(--color-green-400)",300:"var(--color-green-300)",200:"var(--color-green-200)",100:"var(--color-green-100)",50:"var(--color-green-50)" },
        red: { 900:"var(--color-red-900)",800:"var(--color-red-800)",700:"var(--color-red-700)",600:"var(--color-red-600)",500:"var(--color-red-500)",400:"var(--color-red-400)",300:"var(--color-red-300)",200:"var(--color-red-200)",100:"var(--color-red-100)",50:"var(--color-red-50)" },
        yellow: { 900:"var(--color-yellow-900)",800:"var(--color-yellow-800)",700:"var(--color-yellow-700)",600:"var(--color-yellow-600)",500:"var(--color-yellow-500)",400:"var(--color-yellow-400)",300:"var(--color-yellow-300)",200:"var(--color-yellow-200)",100:"var(--color-yellow-100)",50:"var(--color-yellow-50)" },
        violet: { 900:"var(--color-violet-900)",800:"var(--color-violet-800)",700:"var(--color-violet-700)",600:"var(--color-violet-600)",500:"var(--color-violet-500)",400:"var(--color-violet-400)",300:"var(--color-violet-300)",200:"var(--color-violet-200)",100:"var(--color-violet-100)",50:"var(--color-violet-50)" },
        orange: { 900:"var(--color-orange-900)",800:"var(--color-orange-800)",700:"var(--color-orange-700)",600:"var(--color-orange-600)",500:"var(--color-orange-500)",400:"var(--color-orange-400)",300:"var(--color-orange-300)",200:"var(--color-orange-200)",100:"var(--color-orange-100)",50:"var(--color-orange-50)" },
        // semantic aliases
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "bg-surface": "var(--bg-surface)",
        "bg-subtle": "var(--bg-subtle)",
        "border-default": "var(--border-default)"
      },
      spacing: {
        "1":"var(--space-1)","2":"var(--space-2)","3":"var(--space-3)","4":"var(--space-4)",
        "6":"var(--space-6)","8":"var(--space-8)","10":"var(--space-10)","12":"var(--space-12)",
        "16":"var(--space-16)","24":"var(--space-24)","28":"var(--space-28)"
      },
      borderRadius: {
        sm: "var(--radius-sm)", md: "var(--radius-md)", lg: "var(--radius-lg)", xl: "var(--radius-xl)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      transitionTimingFunction: {
        "ds-out": "var(--ease-out)", "ds-in": "var(--ease-in)", "ds-in-out": "var(--ease-in-out)"
      }
    }
  },
  plugins: []
};

export default config;
```

> Because Tailwind spacing now maps to the 4px token scale, `p-4` = 16px, `gap-6` = 24px, `gap-10` = 40px, `py-24` = 96px, `px-28` = 112px — matching `design.md`'s page padding (112 H / 96 V) and section gap (40px).

---

## 4. `ui/` primitives (full component contracts)

All primitives are **Server Components** (no `"use client"`) and use only token-backed Tailwind classes. Build with `cn()` from `lib/utils/cn.ts`.

### 4.1 `lib/utils/cn.ts`
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
```

### 4.2 `Button` (`components/ui/Button.tsx`)
Props:
```ts
type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost";   // default "primary"
  size?: "md" | "lg";                              // default "md"
  href?: string;                                   // renders <a>/<Link> if present, else <button>
  type?: "button" | "submit";                      // for <button>
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
} & React.ComponentProps<"button">;
```
Styles (tokens only):
- **primary:** bg `brand` (blue-500), text white, hover bg `blue-600`, active bg `blue-700`, disabled bg `grey-25`/text `grey-400`. Radius `md` (6px). Height md=40px (`h-10`), lg=48px (`h-12`). Padding `px-6`. Type `type-body-lg`, weight 500.
- **secondary:** bg white, border `grey-100`, text `grey-900`; hover bg `grey-50` border `grey-200`; active bg `grey-100` border `grey-300`.
- **ghost:** transparent, text `brand`, hover text `blue-600`, underline on hover.
- Transition `transition-colors duration-[var(--motion-fast)] ease-ds-out`.
- When `href` present render Next `<Link>`; otherwise `<button>`. Focus ring inherited from globals.

### 4.3 `Badge` (`components/ui/Badge.tsx`)
Per design.md "Semantic Status Badge": `background {color}-50; border 1px {color}-200; text {color}-700; type-body-sm weight 500; radius sm (4px); padding 2px 8px (py-[2px] px-2)`.
```ts
type BadgeProps = { tone?: "brand" | "green" | "red" | "yellow" | "violet" | "grey"; children: React.ReactNode };
```
`grey` tone uses grey-50/grey-200/grey-700. Used for "Most popular", "Roadmap", tier labels.

### 4.4 `Card` (`components/ui/Card.tsx`)
`bg white, border grey-100, radius lg (8px), p-6`. Optional `elevated` prop → `bg-grey-25` hover `border-grey-200` (flat depth via bg step, no shadow — design.md Visual Principle 4). Optional `highlight` prop → `border-brand border-2` (for the "most popular" pricing tier).
```ts
type CardProps = { highlight?: boolean; elevated?: boolean; className?: string; children: React.ReactNode };
```

### 4.5 `Container` (`components/ui/Container.tsx`)
Centers content, max width, responsive gutters.
`mx-auto w-full max-w-[1200px] px-4 md:px-8 lg:px-28`. (16px min gutter on mobile per ED §5; 112px on large screens per design.md.)
```ts
type ContainerProps = { className?: string; children: React.ReactNode };
```

### 4.6 `Section` (`components/layout/Section.tsx`)
Vertical rhythm wrapper. `py-16 md:py-24` (64px mobile → 96px desktop). Optional `surface` prop toggles `bg-grey-25`. Renders a `<section>` and composes `Container` inside. Optional `id` for anchor links.
```ts
type SectionProps = { id?: string; surface?: boolean; className?: string; children: React.ReactNode };
```

---

## 5. State color mapping (reference for form + interactive specs)

From `design.md` state table — use verbatim:

| State | bg | border | text |
|---|---|---|---|
| Default | white / grey-25 | grey-100 | grey-900 |
| Hover | grey-50 | grey-200 | grey-900 |
| Focus | white | blue-500 (2px) | grey-900 |
| Active | grey-100 | grey-300 | grey-900 |
| Disabled | grey-25 | grey-100 | grey-400 |
| Error | red-50 | red-500 | red-700 |
| Success | green-50 | green-500 | green-700 |
| Warning | yellow-50 | yellow-500 | yellow-800 |

---

## 6. Acceptance criteria

- Every color/spacing/radius used in any component resolves to a token from §1 — a grep for raw `#` hex in `components/**` and `app/**` (excluding `globals.css`) returns zero matches.
- `p-4`→16px, `gap-10`→40px, `py-24`→96px, `px-28`→112px verified in rendered output.
- Type roles render at the exact sizes in §1; `letter-spacing` is 0 everywhere.
- Focus-visible shows a 2px brand-blue ring with 2px offset; `prefers-reduced-motion` disables transitions.
- `ui/` primitives render in isolation (unit-tested per `testing.md`).
