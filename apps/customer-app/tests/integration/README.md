# Integration tests — real test Supabase (not mocks)

These suites validate the database contract the dashboard depends on — RLS
cross-org isolation, profile write→read round-trips, org-scoped lead updates, and
the n8n tool writes — against a **real, throwaway test Supabase project**
(testing.md §Integration, ED §13.1: integration tests use a real DB, never mocks).

They are **skipped by default** (via `describe.skipIf`) because there is no live
Supabase in the build/CI sandbox. A skipped run is expected and green; the console
prints the reason once per run.

## What's covered

| File | Covers |
|---|---|
| `rls.test.ts` | Org A cannot read org B's conversations / appointments / end-customers; sanity that RLS still allows self-reads |
| `api-roundtrip.test.ts` | `PUT /api/profile/[panel]` write reflected in a subsequent read; `PATCH /api/leads/[id]` is org-scoped (cannot touch another org's lead) |
| `tool-writes.test.ts` | Webhook context bundle; `create_appointment` rejects without `confirmed_readback`; `capture_lead` inserts a lead + a notification (these run in n8n → also need `N8N_WEBHOOK_URL`) |

## Environment variables

| Var | Required for | Purpose |
|---|---|---|
| `TEST_SUPABASE_URL` | all integration | Test project URL |
| `TEST_SUPABASE_SERVICE_ROLE_KEY` | all integration | Fixture setup/teardown (bypasses RLS) |
| `TEST_SUPABASE_ANON_KEY` | RLS + round-trip | Authenticated, RLS-enforced client sessions |
| `N8N_WEBHOOK_URL` | `tool-writes.test.ts` | Reachable n8n webhook (tools write to Supabase) |
| `N8N_WEBHOOK_SECRET` | `tool-writes.test.ts` | Optional webhook auth header |

## How to run against a throwaway test Supabase

> Use a **disposable project** — these tests create and delete orgs, auth users,
> conversations, appointments, leads, and notifications.

1. **Create a throwaway Supabase project** (or a local `supabase start` stack).
2. **Run the schema migration**: paste
   `docs/customer-app/implementation/supabase-schema.sql` into the SQL editor (it
   creates tables, the `current_org_id()` helper, and all RLS policies).
3. **Seed base data** (optional for RLS, which seeds its own orgs): run
   `docs/customer-app/implementation/seed-data.md`'s SQL for the Acme org.
4. The RLS suite **creates a second org** at runtime (`seedOrg`) to prove
   cross-org isolation, and tears both orgs down afterward.
5. Export the env and run vitest:

```bash
cd apps/customer-app
export TEST_SUPABASE_URL="https://<project>.supabase.co"
export TEST_SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
export TEST_SUPABASE_ANON_KEY="<anon-key>"
# optional, only for tool-writes.test.ts:
# export N8N_WEBHOOK_URL="https://<n8n-host>/webhook/handled"
# export N8N_WEBHOOK_SECRET="<secret>"

npm run test -- tests/integration
```

Without these vars the suites skip cleanly and the rest of the unit suite stays
green.
