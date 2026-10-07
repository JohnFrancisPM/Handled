# Spec: Project Setup & Configuration

**App:** `apps/website`
**Implements:** R1, R38
**Depends on:** nothing (first spec to build)

Scaffolds the Next.js 14 (App Router) + TypeScript (strict) + Tailwind project. Every other spec assumes this structure exists.

---

## 1. Runtime & tooling versions

| Tool | Version |
|---|---|
| Node | 20.x LTS |
| Next.js | `14.2.x` (App Router) |
| React / React DOM | `18.3.x` |
| TypeScript | `5.4.x` (strict) |
| Tailwind CSS | `3.4.x` |
| Package manager | `npm` (lockfile committed) |

---

## 2. `package.json`

```json
{
  "name": "handled-website",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "14.2.15",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "zod": "3.23.8",
    "lucide-react": "0.441.0",
    "clsx": "2.1.1",
    "tailwind-merge": "2.5.2",
    "@supabase/supabase-js": "2.45.4"
  },
  "devDependencies": {
    "typescript": "5.4.5",
    "@types/node": "20.14.0",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "tailwindcss": "3.4.13",
    "postcss": "8.4.47",
    "autoprefixer": "10.4.20",
    "eslint": "8.57.0",
    "eslint-config-next": "14.2.15",
    "vitest": "2.1.1",
    "@vitejs/plugin-react": "4.3.1",
    "@testing-library/react": "16.0.1",
    "@testing-library/jest-dom": "6.5.0",
    "jsdom": "25.0.1",
    "@playwright/test": "1.47.2",
    "@axe-core/playwright": "4.10.0"
  }
}
```

> Rationale for deps: `zod` (shared validation), `lucide-react` (only icon set per ED §5), `clsx` + `tailwind-merge` (the `cn()` util), `@supabase/supabase-js` (server-only lead insert). No state library, no analytics, no i18n package (English-only MVP — R38; `next-intl` is a deferred Phase-2 add, not installed now).

---

## 3. `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "forceConsistentCasingInFileNames": true,
    "noUncheckedIndexedAccess": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

All imports use the `@/` alias (e.g. `import { Button } from "@/components/ui/Button"`).

---

## 4. `next.config.mjs`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Only local/public images in MVP (logos, OG). No remote patterns needed.
    formats: ["image/avif", "image/webp"]
  }
};

export default nextConfig;
```

No `output: "export"` — the app needs the `/api/leads` Route Handler (Node runtime). Content pages are still statically generated (SSG) by default.

---

## 5. `postcss.config.js`

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

---

## 6. `tailwind.config.ts`

Full mapping is specified in `design-system-setup.md` §3. Create the file there; this spec only establishes `content` globs:

```ts
content: [
  "./app/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",
  "./content/**/*.{ts,tsx}"
]
```

---

## 7. Folder structure (create empty dirs + placeholder files)

```
apps/website/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx                   # Home
│   ├── why-handled/page.tsx
│   ├── features/page.tsx
│   ├── pricing/page.tsx
│   ├── integrations/page.tsx
│   ├── how-it-works/page.tsx
│   ├── contact/page.tsx
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   └── api/leads/route.ts
├── components/
│   ├── layout/   (Nav.tsx, MobileNav.tsx, Footer.tsx, Container.tsx, Section.tsx)
│   ├── marketing/(Hero.tsx, StatBand.tsx, FeatureCard.tsx, FeatureGrid.tsx, StepList.tsx,
│   │              PricingTable.tsx, ComparisonTable.tsx, FaqAccordion.tsx, CtaBand.tsx,
│   │              Testimonial.tsx, LogoCloud.tsx, DifferentiatorBlock.tsx)
│   ├── form/     (DemoForm.tsx, Field.tsx, Select.tsx, FormSuccess.tsx)
│   └── ui/       (Button.tsx, Badge.tsx, Card.tsx, Container.tsx — see note)
├── content/      (nav.ts, stats.ts, features.ts, pricing.ts, comparison.ts,
│                  differentiators.ts, faqs.ts, integrations.ts, testimonials.ts, steps.ts, site.ts)
├── lib/
│   ├── supabase/server.ts
│   ├── validation/lead.ts
│   ├── rate-limit.ts
│   ├── seo.ts
│   └── utils/cn.ts
├── public/       (logo.svg, og-default.png, favicon.ico, integration logos)
├── tests/        (unit + integration; e2e under tests/e2e)
├── .env.example
├── .env.local    (gitignored, created by developer)
├── next.config.mjs
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

> Note on `Container`: it appears under both `layout/` and `ui/` in the ED folder sketch. Resolution: **`Container` lives in `components/ui/Container.tsx`** (a design-system primitive) and is re-used by layout. Do not create two. `Section` lives in `components/layout/Section.tsx`.

---

## 8. `vitest.config.ts`

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["tests/e2e/**"]
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") }
  }
});
```

`tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

---

## 9. `playwright.config.ts`

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } }
  ]
});
```

---

## 10. `.gitignore` additions (app level)

```
node_modules
.next
.env*.local
coverage
playwright-report
test-results
```

---

## 11. Acceptance criteria

- `npm install && npm run dev` serves the app on `http://localhost:3000` with no errors.
- `npm run typecheck` passes with strict mode on.
- `npm run build` completes; all nine content pages are statically generated; only `/api/leads` is dynamic (Node runtime).
- `@/` import alias resolves in app, tests, and build.
- No i18n/analytics packages are present (MVP scope).
