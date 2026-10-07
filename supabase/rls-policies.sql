-- =============================================================================
-- Handled Marketing Website — RLS policies (Stage 7, Security Foundation)
-- App: apps/website
--
-- Paste-and-run in the Supabase SQL Editor. Idempotent — safe to re-run.
--
-- SCOPE NOTE: the marketing site has exactly ONE table (`public.leads`) and NO
-- user accounts, authentication, chat, contracts, or file storage. There is
-- therefore no `auth.users`-keyed data and no `rate_limit_events` table — the
-- generic SaaS security template does not apply here. Rate limiting for the
-- single public endpoint (/api/leads) is handled in application code
-- (apps/website/lib/rate-limit.ts); see docs/security/security-plan.md.
--
-- This file RE-ASSERTS the lead table's lockdown so the security posture is
-- enforced independently of the original schema file
-- (docs/website/implementation/supabase-schema.sql). Run whichever you like;
-- the end state is identical.
-- =============================================================================

-- The table must exist before we lock it down. (No-op if the schema file ran.)
-- We do NOT create columns here — that is the schema file's job. We only assert
-- security. If the table is missing, run supabase-schema.sql first.
do $$
begin
  if to_regclass('public.leads') is null then
    raise exception
      'public.leads does not exist — run docs/website/implementation/supabase-schema.sql first';
  end if;
end $$;

-- ---- Row Level Security -----------------------------------------------------
-- Enable RLS. With RLS on and ZERO permissive policies, the anon and
-- authenticated roles are denied all operations. The service-role key (used
-- only server-side in app/api/leads/route.ts) bypasses RLS by design and can
-- insert, which is the sole intended write path.
alter table public.leads enable row level security;

-- Force RLS even for the table owner, so no connection other than service-role
-- can bypass it accidentally.
alter table public.leads force row level security;

-- Belt-and-suspenders: remove any table grants from client-facing roles.
revoke all on public.leads from anon;
revoke all on public.leads from authenticated;

-- Intentionally NO policies are created for anon/authenticated. Do not add a
-- permissive policy for these roles — the browser never talks to Supabase, and
-- leads are written exclusively by the server's service-role client.

-- =============================================================================
-- Verification (run manually in the SQL Editor):
--
--   -- 1) RLS is enabled AND forced:
--   select relname, relrowsecurity, relforcerowsecurity
--   from pg_class where relname = 'leads';
--   -- expect: relrowsecurity = true, relforcerowsecurity = true
--
--   -- 2) No policies exist for client roles:
--   select policyname, roles from pg_policies
--   where schemaname = 'public' and tablename = 'leads';
--   -- expect: zero rows
--
--   -- 3) anon/authenticated have no grants:
--   select grantee, privilege_type from information_schema.role_table_grants
--   where table_schema = 'public' and table_name = 'leads'
--     and grantee in ('anon','authenticated');
--   -- expect: zero rows
-- =============================================================================
