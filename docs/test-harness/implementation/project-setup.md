# Project Setup — `apps/test-harness`

**Source:** engineering-doc §5.1, §11, §12 · **Consistency:** matches `apps/website` and
`apps/customer-app` conventions exactly (Next.js 14 App Router, TS strict, `@/` alias,
Node 20, Vitest + Playwright).

This spec is the Stage-3 scaffold contract. Stage 3 runs `/frontend-setup`; this file
fixes every config value so there is no ambiguity.

---

## 1. Runtime & tooling

| Thing | Value |
|---|---|
| Framework | Next.js **14** (App Router) |
| Language | TypeScript, **strict** |
| Node | **20 LTS** (pinned in `netlify.toml`, see `deployment.md`) |
| Package manager | npm |
| Styling | Tailwind CSS, tokens only (see `design-system-setup.md`) |
| State | Zustand (session/UI) + @tanstack/react-query (mutations) |
| Forms | react-hook-form + zod |
| Icons | lucide-react |
| Tests | Vitest (jsdom) + @playwright/test + @axe-core/playwright |

No `recharts` (no charts). No Supabase client of any kind — do not add `@supabase/*`.

---

## 2. `package.json`

```jsonc
{
  "name": "test-harness",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "build:fixture": "tsx ../../scripts/build-harness-fixture.ts"
  },
  "dependencies": {
    "next": "14.2.x",
    "react": "18.3.x",
    "react-dom": "18.3.x",
    "zustand": "^4.5.x",
    "@tanstack/react-query": "^5.x",
    "react-hook-form": "^7.x",
    "zod": "^3.23.x",
    "lucide-react": "^0.4xx.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  },
  "devDependencies": {
    "typescript": "^5.4.x",
    "@types/react": "^18.3.x",
    "@types/react-dom": "^18.3.x",
    "@types/node": "^20.x",
    "tailwindcss": "^3.4.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x",
    "eslint": "^8.x",
    "eslint-config-next": "14.2.x",
    "vitest": "^1.6.x",
    "@vitejs/plugin-react": "^4.x",
    "jsdom": "^24.x",
    "@testing-library/react": "^16.x",
    "@testing-library/jest-dom": "^6.x",
    "@playwright/test": "^1.4x.x",
    "@axe-core/playwright": "^4.x",
    "tsx": "^4.x",
    "pgsql-ast-parser": "^12.x"
  }
}
```

> `tsx` + `pgsql-ast-parser` are devDeps used ONLY by the builder-side fixture script
> (`scripts/build-harness-fixture.ts`). They are not shipped to the browser or used at
> runtime. `build:fixture` is a convenience alias; the canonical invocation is documented
> in `fixture-extraction.md`.

Pin exact minor versions to match whatever `apps/customer-app` resolves at scaffold time
(run `npm ls next react` in the customer-app and match majors/minors) so the three apps
stay on one Next 14 line.

---

## 3. `tsconfig.json` (identical shape to customer-app)

```jsonc
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
    "baseUrl": ".",
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- `resolveJsonModule: true` is required so `fixtures/*.json` import with types.
- `@/` maps to the **`apps/test-harness` root** — must be mirrored in `vitest.config.ts`
  and `playwright.config.ts` (keep all three in sync, as the website does).

---

## 4. `vitest.config.ts`

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
    include: ["tests/unit/**/*.test.{ts,tsx}", "tests/integration/**/*.test.{ts,tsx}"]
  },
  resolve: { alias: { "@": path.resolve(__dirname) } }
});
```

`tests/setup.ts` imports `@testing-library/jest-dom`. E2E specs under `tests/e2e/**` are
**excluded** from Vitest (Playwright owns them) — same split as the other two apps.

---

## 5. `playwright.config.ts`

```ts
import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    // E2E runs against a STUBBED webhook (see testing.md), so set OFFLINE_MOCK on
    // and leave N8N_WEBHOOK_URL unset, OR point at a local stub route.
    env: { OFFLINE_MOCK: "true" }
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // @/ alias for test files resolved via tsconfig paths (ts-node/tsx) — mirror of above.
});
```

First run requires `npx playwright install chromium`.

---

## 6. Other root config files

- `next.config.mjs` — security headers only (full content in `deployment.md` §Security headers).
  No `images.remotePatterns` needed (the app renders no remote images; SMS avatars are
  initials/CSS). No rewrites/redirects.
- `tailwind.config.ts` + `postcss.config.js` — see `design-system-setup.md`.
- `.eslintrc.json` — `{ "extends": "next/core-web-vitals" }`.
- `.gitignore` — standard Next (`.next`, `node_modules`, `.env*` except `.env.example`,
  `.netlify`, `playwright-report`, `test-results`).
- `netlify.toml` — see `deployment.md`.

> **Committed fixtures are NOT gitignored.** `fixtures/customers.json` and
> `fixtures/scenarios.json` ship with the app (the whole point of decoupling). Only
> generated build output and secrets are ignored.

---

## 7. Folder tree (authoritative)

```
apps/test-harness/
  app/
    layout.tsx                  Root layout (Inter Display, globals.css, providers)
    providers.tsx               React Query provider (+ any client provider shells)
    page.tsx                    Single harness screen (roster + thread + batch)
    globals.css                 Design tokens as CSS variables (design-system-setup.md)
    api/
      send/route.ts             POST one turn → n8n proxy        (webhook-proxy.md §5)
      batch/route.ts            POST batch fan-out → n8n proxy   (webhook-proxy.md §6)
      health/route.ts           GET config-presence booleans     (env-and-config.md §4)
  components/
    layout/AppShell.tsx
    roster/CustomerRoster.tsx  roster/CustomerRow.tsx
    thread/ChatThread.tsx  thread/MessageBubble.tsx  thread/MetaChip.tsx
      thread/Composer.tsx  thread/TypingIndicator.tsx
    batch/BatchTrigger.tsx  batch/BatchPanel.tsx  batch/BatchResultsGrid.tsx
      batch/BatchResultRow.tsx
    system/OfflineBanner.tsx  system/ErrorBubble.tsx  system/EmptyState.tsx
  lib/
    env.ts                      Central env access (env-and-config.md)
    api/envelope.ts             ok()/fail() typed envelope (webhook-proxy.md §2)
    types.ts                    Shared types (Customer, WebhookReply, BatchResult, codes)
    webhook/
      callWebhook.ts            fetch + timeout + body-ok classification
      send.ts                   sendTurn(customerId, text)
      batch.ts                  runBatch() + concurrency + same-phone serialization
      mock.ts                   offline-mock reply generator
    validation/
      contract.ts               Zod: client request + webhook response (contract-aligned)
    fixtures/
      load.ts                   Typed loaders for customers.json / scenarios.json
      types.ts                  Fixture types (Customer, HistoryTurn, Scenario)
    store/
      session.ts                useSessionStore (Zustand)
    hooks/
      useSendTurn.ts  useBatchRun.ts  useHealth.ts   (React Query)
    utils/cn.ts                 clsx + tailwind-merge
  content/
    copy.ts                     UI copy (labels, empty/error strings)
  fixtures/
    customers.json              Committed (generated from seed 04/05/06)
    scenarios.json              Committed batch set (50 eval cases + extras)
  tests/
    setup.ts
    unit/        integration/        e2e/
  tsconfig.json  vitest.config.ts  playwright.config.ts
  next.config.mjs  tailwind.config.ts  postcss.config.js  .eslintrc.json
  package.json  .env.example  README.md

scripts/
  build-harness-fixture.ts      Builder-side extractor (repo-root scripts/, outside apps)
```

---

## Requirement coverage
- **TH-9** (Next 14 App Router, TS strict, `@/` alias) — §1–§5, §7.
- **TH-13** (Node 20 LTS) — §1; pinned in `deployment.md`.
- **TH-6/TH-12** (no Supabase coupling; config via env) — §2 (no `@supabase/*` dep), §7.
