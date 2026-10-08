-- =============================================================================
-- Handled Customer-app — RLS re-assertion (Stage 7, Security Foundation)
-- App: apps/customer-app  (+ n8n/ backend)
--
-- Paste-and-run in the Supabase SQL Editor, AFTER migrations/0001_init.sql and
-- the seed. Idempotent — safe to re-run.
--
-- PURPOSE: the tenant-isolation posture is already defined inside
-- migrations/0001_init.sql §21. This file RE-ASSERTS it so the security posture
-- is enforced and auditable INDEPENDENTLY of the schema file, and adds two
-- hardening steps the base migration does not:
--   (a) FORCE ROW LEVEL SECURITY on every table (so even the table-owner role is
--       subject to policies — the service_role key still bypasses RLS by design;
--       see the note below), and
--   (b) explicit REVOKE of all table privileges from the `anon` role, so an
--       unauthenticated browser key can read/write nothing even if a future
--       policy is added by mistake.
--
-- SCOPE NOTE — the generic SaaS template does NOT apply to this app:
--   • No file uploads / storage buckets  → no storage.objects policies here.
--   • No LLM / chat in the Next app       → prompt-injection is guarded in the
--     n8n workflow (Haiku guard node), not the DB.
--   • No `rate_limit_events` table        → the dashboard's API routes are all
--     auth-gated; the one public surface is the n8n webhook, rate-limited by its
--     shared secret + guard. There is no user-keyed rate-limit table to secure.
--   • No `OPENAI_API_KEY`                 → Claude is an n8n credential.
-- See docs/customer-app/security/security-plan.md for the full rationale.
--
-- MULTI-TENANCY MODEL (ED §7.15):
--   • Dashboard users authenticate with the anon key; RLS scopes every row to
--     their org via public.current_org_id().
--   • n8n and the Next.js Route Handlers use the SERVICE ROLE key, which BYPASSES
--     RLS. Those paths MUST re-check org_id in code — verified in
--     lib/data/mutations.ts (every write) and lib/data/dashboard.ts (every read).
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 0. Org-resolution helper — re-assert exactly as the migration defines it.
--    SECURITY DEFINER + pinned search_path = no RLS recursion, no search_path
--    hijack. STABLE so the planner can cache it per statement.
-- -----------------------------------------------------------------------------
create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.dashboard_users where id = auth.uid()
$$;

-- -----------------------------------------------------------------------------
-- 1. Enable + FORCE RLS on every table in the schema.
-- -----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'organizations','dashboard_users','business_profiles','service_areas',
    'services','service_pricing','business_hours','technicians','emergency_rules',
    'end_customers','conversations','messages','appointments','leads',
    'escalations','notifications','eval_exports'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('alter table public.%I force  row level security;', t);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- 2. Lock out the anon role entirely. Dashboard access is `authenticated` only;
--    the browser anon key authenticates a user before any row is visible.
--    (service_role is unaffected — it bypasses RLS and grants by design.)
-- -----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'organizations','dashboard_users','business_profiles','service_areas',
    'services','service_pricing','business_hours','technicians','emergency_rules',
    'end_customers','conversations','messages','appointments','leads',
    'escalations','notifications','eval_exports'
  ]
  loop
    execute format('revoke all on public.%I from anon;', t);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- 3. Re-assert the policy set (mirrors migrations/0001_init.sql §21 exactly).
-- -----------------------------------------------------------------------------

-- organizations: read your own org row only.
drop policy if exists org_select on public.organizations;
create policy org_select on public.organizations
  for select to authenticated using (id = public.current_org_id());

-- dashboard_users: read your own row only.
drop policy if exists du_select on public.dashboard_users;
create policy du_select on public.dashboard_users
  for select to authenticated using (id = auth.uid());

-- Config tables the owner self-serves (full CRUD, org-scoped):
do $$
declare t text;
begin
  foreach t in array array[
    'business_profiles','service_areas','services','service_pricing',
    'business_hours','technicians','emergency_rules'
  ]
  loop
    execute format('drop policy if exists %I on public.%I;', t||'_sel', t);
    execute format('drop policy if exists %I on public.%I;', t||'_ins', t);
    execute format('drop policy if exists %I on public.%I;', t||'_upd', t);
    execute format('drop policy if exists %I on public.%I;', t||'_del', t);
    execute format('create policy %I on public.%I for select to authenticated using (org_id = public.current_org_id());', t||'_sel', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (org_id = public.current_org_id());', t||'_ins', t);
    execute format('create policy %I on public.%I for update to authenticated using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());', t||'_upd', t);
    execute format('create policy %I on public.%I for delete to authenticated using (org_id = public.current_org_id());', t||'_del', t);
  end loop;
end $$;

-- Operational tables written by n8n (service role), read by the dashboard:
--   SELECT (org-scoped) only — no authenticated write path.
do $$
declare t text;
begin
  foreach t in array array[
    'end_customers','conversations','messages','appointments','escalations'
  ]
  loop
    execute format('drop policy if exists %I on public.%I;', t||'_sel', t);
    execute format('create policy %I on public.%I for select to authenticated using (org_id = public.current_org_id());', t||'_sel', t);
  end loop;
end $$;

-- leads: dashboard reads AND updates status (PATCH /api/leads/[id]); created by n8n.
drop policy if exists leads_sel on public.leads;
drop policy if exists leads_upd on public.leads;
create policy leads_sel on public.leads
  for select to authenticated using (org_id = public.current_org_id());
create policy leads_upd on public.leads
  for update to authenticated using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());

-- notifications: dashboard reads and marks read; created by n8n.
drop policy if exists notif_sel on public.notifications;
drop policy if exists notif_upd on public.notifications;
create policy notif_sel on public.notifications
  for select to authenticated using (org_id = public.current_org_id());
create policy notif_upd on public.notifications
  for update to authenticated using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());

-- eval_exports: builder-side audit rows (scripts/export-evals.ts); org-scoped read/insert.
drop policy if exists evx_sel on public.eval_exports;
drop policy if exists evx_ins on public.eval_exports;
create policy evx_sel on public.eval_exports
  for select to authenticated using (org_id = public.current_org_id());
create policy evx_ins on public.eval_exports
  for insert to authenticated with check (org_id = public.current_org_id());

commit;

-- =============================================================================
-- VERIFICATION — run these after applying. Expectations in comments.
-- =============================================================================

-- (a) RLS enabled AND forced on all 17 tables (expect relrowsecurity = t AND
--     relforcerowsecurity = t for every row):
-- select relname, relrowsecurity, relforcerowsecurity
--   from pg_class
--  where relnamespace = 'public'::regnamespace
--    and relkind = 'r'
--    and relname in (
--      'organizations','dashboard_users','business_profiles','service_areas',
--      'services','service_pricing','business_hours','technicians','emergency_rules',
--      'end_customers','conversations','messages','appointments','leads',
--      'escalations','notifications','eval_exports')
--  order by relname;

-- (b) No table privileges remain for anon (expect 0 rows):
-- select table_name, privilege_type
--   from information_schema.role_table_grants
--  where grantee = 'anon' and table_schema = 'public';

-- (c) No operational table exposes an authenticated INSERT/UPDATE/DELETE policy
--     (expect only *_sel rows for end_customers/conversations/messages/
--      appointments/escalations):
-- select tablename, policyname, cmd
--   from pg_policies
--  where schemaname = 'public'
--    and tablename in ('end_customers','conversations','messages','appointments','escalations')
--  order by tablename, policyname;
