# Handled — Test Harness (`apps/test-harness`)

A standalone SMS-style tester for the Handled customer experience. It impersonates
Acme Plumbing's end-customers, shows each one's chat history, lets you send messages as
them, and renders the AI's reply — plus a one-button batch that fires many scenarios at
the agent at once. It is **completely decoupled**: no database, no coupling to the other
apps. It reads its ~30 customers + backfilled history from a committed fixture (built
one-time from the Supabase seed SQL) and gets live AI replies from the n8n webhook.

Specs: [`docs/test-harness/`](../../docs/test-harness/) (engineering doc + implementation/).

## Commands (run from `apps/test-harness/`)

```bash
npm run dev          # local dev server (http://localhost:3000)
npm run build        # production build (App Router pages + Route Handlers)
npm run typecheck    # tsc --noEmit (strict)
npm run lint         # next lint
npm run test         # Vitest (jsdom) — tests/unit + tests/integration
npm run test:watch   # Vitest watch
npm run test:e2e     # Playwright E2E (first: npx playwright install chromium)
npm run build:fixture # (builder-side) regenerate fixtures/*.json from supabase/seed
```

Run a single test: `npm run test -- tests/unit/<file>.test.ts`.

Node **20 LTS**. The `@/` alias maps to the `apps/test-harness` root (kept in sync across
`tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`).

## Configuration

All env is **server-only** — there are deliberately no `NEXT_PUBLIC_*` vars; the browser
calls only this app's `/api/*` routes and never sees the webhook secret. Copy
[`.env.example`](.env.example) to `.env.local`. With nothing set, the app still runs in
offline/demo-safe mode. See `docs/test-harness/implementation/env-and-config.md`.

## Status

Stage 3 (scaffold) complete. Feature implementation (roster, chat thread, webhook proxy,
batch simulator, fixtures) follows in Stage 4 per the approved specs.
