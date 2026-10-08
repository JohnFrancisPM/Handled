# Auth & Middleware

**Sub-system:** Dashboard
**Source:** engineering-doc §6.4, Flow K, §15, §5 (demo-stable)

## Auth strategy
- Supabase Auth, email/password (ED Appendix A#5). One org (Acme) for the demo; schema is multi-tenant via `org_id` + RLS.
- SSR cookie sessions via `@supabase/ssr`. On login, resolve the `dashboard_users` row for `auth.uid()` to get `org_id`.
- New-user bootstrap is out of MVP scope (self-serve signup is a future phase); the Acme owner's `dashboard_users` row is created at seed time against the Supabase Auth user (see seed-data.md README).

## Login flow (Flow K)
`(auth)/login` → email/password form (RHF + Zod) → `supabase.auth.signInWithPassword` → session cookie set → redirect `/dashboard`. Error states use the design error card.

## Middleware (`middleware.ts`)
- Matcher: all `(dashboard)` routes + `/api/*` (except `/api/auth/*`).
- Reads the SSR session; if absent AND not in demo mode → redirect to `/login`.
- Refreshes the Supabase session cookie on each request.

## Demo-stable read-only mode (ED §5, §15)
- If Supabase auth env is missing (`NEXT_PUBLIC_SUPABASE_URL`/anon key absent) OR `NEXT_PUBLIC_DEMO_ORG_SLUG` is set and no session exists:
  - the app loads seeded Acme data in **read-only** mode (no writes; policy editor disabled with a "demo mode" banner),
  - middleware does NOT redirect to login,
  - this guarantees the 3-minute recorded demo cannot hard-fail.
- `lib/supabase/demo.ts` supplies the read path (service-role or public seeded reads scoped to the demo org slug).

## Authz rules
- Every API handler calls `getSessionOrg()`; 401 when no session (and not demo).
- All reads org-scoped by RLS (anon client) or explicit `org_id` filter.
- Privileged writes use the service-role client and re-check `org_id == session.orgId` before writing (ED §6.4). Never trust a client-supplied `org_id`.
- Secrets (`SUPABASE_SERVICE_ROLE_KEY`, `N8N_WEBHOOK_SECRET`) are server-only; never imported into client components.
