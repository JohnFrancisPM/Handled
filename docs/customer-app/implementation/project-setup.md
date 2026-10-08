# Project Setup — `apps/customer-app` (Next.js 14 dashboard)

**Sub-system:** Dashboard
**Source:** engineering-doc §5, §11, §12, §15

## Stack & dependencies
- Next.js 14 (App Router), React 18, TypeScript (strict).
- Tailwind CSS (design tokens from `design-system-setup.md`).
- `@supabase/supabase-js`, `@supabase/ssr` (SSR cookie auth).
- `@tanstack/react-query` (realtime-backed lists, optimistic edits).
- `zustand` (ephemeral UI state: open panels, filters).
- `react-hook-form` + `zod` + `@hookform/resolvers` (forms/validation; schemas shared with API).
- `recharts` (funnel + revenue charts).
- Dev/test: `vitest`, `@testing-library/react`, `@playwright/test`, `eslint`, `prettier`.

## package.json scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "typecheck": "tsc --noEmit"
  }
}
```

## tsconfig.json
- `"strict": true`, `"baseUrl": "."`, path alias `"@/*": ["./*"]`, `"moduleResolution": "bundler"`, `"jsx": "preserve"`, `"target": "ES2022"`.

## next.config.mjs
- `reactStrictMode: true`. Image remote patterns for Supabase storage if used. No telemetry.

## Folder structure (ED §11)
```
apps/customer-app/
  app/
    (auth)/login/page.tsx
    (dashboard)/
      layout.tsx
      dashboard/page.tsx
      inbox/page.tsx
      inbox/[conversationId]/page.tsx
      appointments/page.tsx
      leads/page.tsx
      analytics/page.tsx
      profile/page.tsx
      profile/services/page.tsx
      profile/pricing/page.tsx
      profile/areas/page.tsx
      profile/hours/page.tsx
      profile/team/page.tsx
      profile/emergency/page.tsx
    api/
      conversations/route.ts
      conversations/[id]/route.ts
      appointments/route.ts
      leads/route.ts
      leads/[id]/route.ts
      notifications/route.ts
      notifications/[id]/route.ts
      analytics/conversion/route.ts
      profile/[panel]/route.ts
  components/            # see dashboard-pages.md
  lib/
    supabase/server.ts   # SSR client (service-role for privileged writes)
    supabase/client.ts   # browser client (anon key, RLS)
    supabase/demo.ts     # read-only seeded demo fallback
    schemas/             # shared Zod schemas (ProfilePanelSchema, LeadPatchSchema, ...)
    analytics/conversion.ts
    env.ts               # typed env access + demo-mode detection
  middleware.ts          # protects (dashboard) routes
  styles/tokens.css      # design tokens (from design.md)
  tailwind.config.ts
  tests/{unit,integration,e2e}/
  netlify.toml
```

## Deployment — Netlify (ED §15, Appendix A#6)
- `@netlify/plugin-nextjs`; monorepo base `apps/customer-app`; `NODE_VERSION=20`.
- `netlify.toml` mirrors the marketing website's setup (same platform across all apps).
- Env in Netlify: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only), `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET` (server-only), `NEXT_PUBLIC_DEMO_ORG_SLUG`.

## Naming conventions (ED §12)
Route folders kebab-case; components PascalCase; hooks `useX`; Zod schemas `XSchema`; API routes plural REST nouns; DB tables/columns snake_case.
