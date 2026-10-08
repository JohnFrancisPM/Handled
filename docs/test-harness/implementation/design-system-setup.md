# Design System Setup — tokens, Tailwind, chip maps

**Source:** `docs/design.md` (allNeurons) · engineering-doc §5.1, §2 F8, §12.
**Rule:** tokens only. No arbitrary hex, spacing, font size, or radius. Apply `/design-system`
to every UI change. Identical token wiring to `apps/website` and `apps/customer-app`.

---

## 1. `app/globals.css` — CSS custom properties

Paste the full `:root` block from `docs/design.md` §"CSS Custom Properties Setup" (all
primitive scales grey/blue/green/red/yellow/violet/orange, the semantic tokens, and the
`--space-*` scale) verbatim. Then:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { /* …all primitives + semantic + spacing tokens from design.md… */ }

html, body { background: var(--bg-surface); color: var(--text-primary);
  font-family: "Inter Display", system-ui, sans-serif; }
```

Load **Inter Display** (the sole typeface) via `next/font` in `layout.tsx` (local or Google
mirror), exposed as a CSS variable, matching the other two apps. No other fonts.

---

## 2. `tailwind.config.ts`

Wire the tokens to Tailwind so components use semantic classes (`bg-brand`, `text-grey-900`,
`gap-4`, `rounded-lg`) — never arbitrary values.

```ts
import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "var(--color-blue-500)",
        grey: { 25:"var(--color-grey-25)",50:"var(--color-grey-50)",100:"var(--color-grey-100)",
          200:"var(--color-grey-200)",300:"var(--color-grey-300)",400:"var(--color-grey-400)",
          500:"var(--color-grey-500)",600:"var(--color-grey-600)",700:"var(--color-grey-700)",
          800:"var(--color-grey-800)",900:"var(--color-grey-900)" },
        blue:  mapScale("blue"), green: mapScale("green"), red: mapScale("red"),
        yellow:mapScale("yellow"), violet:mapScale("violet"), orange:mapScale("orange")
      },
      spacing: { 1:"4px",2:"8px",3:"12px",4:"16px",6:"24px",8:"32px",10:"40px",12:"48px",
        16:"64px",24:"96px",28:"112px" },
      borderRadius: { sm:"4px", md:"6px", lg:"8px", xl:"12px" },
      fontFamily: { sans: ["Inter Display","system-ui","sans-serif"] }
    }
  },
  plugins: []
} satisfies Config;
// mapScale(f) => {50..900: `var(--color-${f}-N)`} helper, or inline each like grey above.
```

Type scale: reuse the `.type-h5` / `.type-body-lg` / `.type-body-sm` classes from design.md
(§"Typography Classes") in `globals.css`; use them for headings / body / captions respectively.

---

## 3. Status/intent chip color map (`lib/charts`-free; a small token map)

The harness shows intent/agent chips and pass/fail chips. Map each to design-token color
families (Blue=info/brand, Green=success, Red=error, Yellow=warning, Violet=accent). Chips use
the design.md "Semantic Status Badge" pattern (`[color]-50` bg, `[color]-200` border,
`[color]-700` text, radius 4px, 2px 8px padding) and are **color-independent** (always paired
with the label text + an icon).

| Intent | Color family | Rationale |
|---|---|---|
| `book` | green | positive conversion |
| `reschedule` | blue | neutral/info |
| `cancel` | grey | neutral-negative |
| `pricing` | violet | accent (info ask) |
| `emergency` | red | danger/urgent |
| `out_of_area` | yellow | warning (declined) |
| `faq` | blue | info |
| `spam` | grey | filtered/neutral |
| `injection` | red | security |
| `fallback` | yellow | degraded/warning |
| `mock` (offline) | grey (muted) | clearly simulated |

| Batch match chip | Color |
|---|---|
| pass (intent ∈ acceptable) | green-500 / green-50 |
| any (`acceptable=["*"]`) | grey (neutral, "n/a") |
| fail | red-500 / red-50 |
| errored row | red (with error code text) |

Define this as a typed record in `lib/types.ts` or a small `content/chips.ts`, consumed by
`MetaChip` / `BatchResultRow`. No hardcoded hex — reference the Tailwind token classes.

---

## 4. Rules enforced (by `/design-system` + review)
- Primary text grey-900, secondary grey-500; page bg grey-25; surfaces white; dividers grey-50.
- Focus rings Blue 500 (2px). All spacing multiples of 4px via the `spacing` scale.
- Radius: cards/bubbles `lg` (8px), buttons `md` (6px), chips `sm` (4px).
- No gradients/shadows by default (flat depth via grey steps), per design.md Visual Principles.

---

## Requirement coverage
- **TH-10** (design tokens only; brand tokens from design.md) — §1–§4.
