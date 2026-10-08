# Supabase seed — Acme Plumbing demo data

Seeds one organization (**Acme Plumbing**, Forest Hills / Queens 11375) with its
full business profile, service areas (serve + deny), services (offered +
won't-provide), researched pricing, business hours, 6 technicians (1 sick today,
1 on vacation this week), emergency rules, and **30 end-customers** with
conversations + messages (eval fields populated), appointments (with prices and
statuses), leads, escalations, and notifications spanning the eval interaction
types.

> Source of truth: `docs/customer-app/implementation/seed-data.md`. All rows use
> service-role access (they bypass RLS); run them in the Supabase SQL Editor or
> with `psql` using the service-role connection — **never** from a browser/anon
> client.

## Run order

1. **Schema first** — run `supabase/migrations/0001_init.sql` (creates all 17
   tables, RLS, triggers, realtime). On a fresh project you can also use
   `supabase db push` if you use the Supabase CLI.
2. **Seed files, in numeric order:**
   | Order | File | Contents |
   |---|---|---|
   | 1 | `01_acme_profile.sql` | org, business_profiles, service_areas, services (offered + won't-provide) |
   | 2 | `02_acme_pricing.sql` | service_pricing (researched 2026 NYC-metro ranges) |
   | 3 | `03_acme_team_hours_emergency.sql` | technicians, business_hours, emergency_rules |
   | 4 | `04_end_customers_30.sql` | 30 end-customers (phone = key) |
   | 5 | `05_conversations_messages.sql` | 30 conversations + message threads with eval fields |
   | 6 | `06_appointments.sql` | appointments (+ prices/statuses), leads, escalations, notifications |

   Quick one-shot (psql, service-role connection string):
   ```bash
   psql "$SUPABASE_DB_URL" -f supabase/migrations/0001_init.sql
   for f in supabase/seed/0*.sql; do psql "$SUPABASE_DB_URL" -f "$f"; done
   ```

## Dashboard login (separate, manual) — `dashboard_users`

`dashboard_users.id` references `auth.users(id)`, so the seed does **not** insert
an owner row (it would fail without a real auth user). To log into the dashboard:

1. In **Supabase → Authentication → Users**, create the Acme owner (email +
   password).
2. Copy that user's UID and run:
   ```sql
   insert into public.dashboard_users (id, org_id, email, role)
   values (
     '<auth-user-uid>',
     'a0000000-0000-0000-0000-000000000001', -- Acme org id
     '<owner-email>',
     'owner'
   );
   ```

## Notes

- **Relative dates:** the sick/vacation tech states, appointment times, and job
  history use `now()` / `current_date` so the demo stays current on every run.
  Holiday `closed_dates` are fixed (2026-12-25, 2026-11-26, 2027-01-01) per the
  spec (eval Ho-13).
- **Fixed UUIDs:** org = `a0000000-…-000000000001`; offered services
  `50000000-…-0000000000NN`; technicians `70000000-…`; end-customers
  `c0000000-…`; conversations `d0000000-…`. This lets the files resolve FKs
  without lookups and makes inserts idempotent (`on conflict (id) do nothing`
  where a stable id exists).
- **Funnel for analytics:** inbound 30 → booked ~17 → `closed_won` 10, giving the
  Analytics page a revenue total and Captured Opportunity Value.
- **Eval coverage:** every assistant turn carries `question/response/citation/
  reasoning/intent/agent/tool_calls`, so `scripts/export-evals.ts` produces a
  valid Azure AI Foundry JSONL with no extra setup.
