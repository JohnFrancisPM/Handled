# Design System Setup — dashboard

**Sub-system:** Dashboard
**Source:** `docs/design.md` (allNeurons), engineering-doc §5
**Rule:** Apply the `design-system` skill when implementing any UI. Never hardcode hex/spacing; always reference tokens. Data-dense, information-forward layout.

## `styles/tokens.css`
Define the full `:root` from `docs/design.md` "CSS Custom Properties Setup" (all primitive scales Grey/Blue/Green/Red/Yellow/Violet/Orange 50–900, plus Grey 25; semantic tokens `--text-primary`, `--text-secondary`, `--bg-primary`, `--bg-surface`, `--bg-subtle`, `--brand`; spacing `--space-1…--space-28` on the 4px grid). Copy verbatim from design.md §Implementation Guidance.

## Typography
- Font: **Inter Display** (load via `next/font` or CDN; sole typeface).
- Classes `.type-h5` (24/32/500), `.type-body-lg` (16/24/500), `.type-body-sm` (12/18/400) per design.md. H1–H4 follow the documented scale.
- Primary text Grey 900 `#070A0E`; secondary Grey 500 `#4A4C4F`. 0 letter-spacing.

## tailwind.config.ts
Map tokens into the theme so utilities resolve to CSS vars:
```ts
theme: {
  extend: {
    colors: {
      grey: { 25:'var(--color-grey-25)', 50:'var(--color-grey-50)', /* …900 */ },
      blue: { 500:'var(--color-blue-500)', /* … */ },
      green:{ 500:'var(--color-green-500)', 50:'var(--color-green-50)', 700:'var(--color-green-700)' },
      red:  { 500:'var(--color-red-500)', 50:'var(--color-red-50)', 700:'var(--color-red-700)' },
      yellow:{500:'var(--color-yellow-500)',50:'var(--color-yellow-50)',800:'var(--color-yellow-800)'},
      violet:{500:'var(--color-violet-500)'},
      brand:'var(--brand)',
    },
    spacing: { 1:'4px',2:'8px',3:'12px',4:'16px',6:'24px',8:'32px',10:'40px',12:'48px',16:'64px',24:'96px',28:'112px' },
    borderRadius: { sm:'4px', DEFAULT:'6px', md:'6px', lg:'8px', xl:'12px' },
    fontFamily: { sans:['Inter Display','sans-serif'] },
  }
}
```

## State colors (design.md State table) — used by badges, cards, inputs
| State | bg | border | text |
|---|---|---|---|
| Default | White / Grey 25 | Grey 100 | Grey 900 |
| Hover | Grey 50 | Grey 200 | Grey 900 |
| Focus | White | Blue 500 (2px ring) | Grey 900 |
| Error | Red 50 | Red 500 | Red 700 |
| Success | Green 50 | Green 500 | Green 700 |
| Warning | Yellow 50 | Yellow 500 | Yellow 800 |

## Radii / motion
Cards 8px, buttons/inputs 6px, badges 4px, modals 12px. Motion: hover/focus 100ms ease-out; dropdown 150ms; modal enter 200ms / exit 150ms; skeleton→content 300ms ease-in-out.

## UI primitives (`components/ui/`)
`Button`, `Badge`/`StatusBadge` (semantic status badge pattern: `[Color]50` bg, `[Color]200` border, `[Color]700` text, radius 4px), `Card`, `Input`, `Select`, `Textarea`, `Skeleton`, `Toast`. All consume tokens only.

## Dataviz (ED §5)
Charts (Recharts) map series to the semantic palette (Blue=brand/primary series, Green=won/positive, Red=lost/negative, Yellow=pending/warning), per the dataviz palette rules — never arbitrary colors. Flat depth (no gradients/shadows by default).

## Accessibility (ED §5)
Semantic headings, focus rings Blue 500 2px, keyboard nav of inbox + policy editor, ARIA live regions on realtime updates, contrast per design "accessible by default".
