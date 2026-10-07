-- =============================================================================
-- Handled Marketing Website — Supabase Schema
-- App: apps/website   |   Implements: R25 (ED §7 "leads")
-- Paste-and-run in the Supabase SQL Editor on a fresh project. Idempotent.
--
-- Scope: EXACTLY ONE table (`leads`). The marketing site holds no other entities.
-- The table name is intentionally specific and does NOT collide with the
-- customer-app schema in the shared Supabase project.
--
-- Security model (ED §7):
--   * RLS ENABLED with NO anon/public policies.
--   * Only the server's service-role client may insert/select.
--   * The browser NEVER touches Supabase directly (no NEXT_PUBLIC Supabase keys).
--   * The service role bypasses RLS by design, so inserts from the Route Handler
--     work while anon/authenticated roles are denied all access.
-- =============================================================================

-- ---- Extensions -------------------------------------------------------------
create extension if not exists "pgcrypto";   -- provides gen_random_uuid()

-- ---- Table: leads -----------------------------------------------------------
create table if not exists public.leads (
  id             uuid        primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  name           text        not null check (char_length(name) between 1 and 200),
  business_name  text        not null check (char_length(business_name) between 1 and 200),
  email          text        not null check (char_length(email) between 3 and 320),
  phone          text        null     check (phone is null or char_length(phone) <= 40),
  trade          text        null     check (
                                trade is null or trade in (
                                  'Plumbing','HVAC','Electrical','Roofing',
                                  'Landscaping','Cleaning','Pest control',
                                  'Garage doors','Other'
                                )
                              ),
  weekly_calls   integer     null     check (weekly_calls is null or weekly_calls between 0 and 100000),
  plan_interest  text        null     check (plan_interest is null or plan_interest in ('starter','pro','scale')),
  message        text        null     check (message is null or char_length(message) <= 2000),
  source_path    text        null     check (source_path is null or char_length(source_path) <= 500),
  user_agent     text        null     check (user_agent is null or char_length(user_agent) <= 1000)
);

comment on table  public.leads is 'Demo/trial requests submitted from the Handled marketing website.';
comment on column public.leads.trade         is 'Caller trade; matches site TRADES list.';
comment on column public.leads.plan_interest is 'Tier interest from ?plan= prefill: starter|pro|scale.';
comment on column public.leads.source_path   is 'Page the form was submitted from.';

-- ---- Indexes ----------------------------------------------------------------
create index if not exists idx_leads_created_at on public.leads (created_at desc);

-- ---- Row Level Security -----------------------------------------------------
alter table public.leads enable row level security;

-- Intentionally NO policies for anon or authenticated roles.
-- With RLS enabled and zero permissive policies, anon/authenticated are denied
-- all operations. The service-role key (used only server-side in the
-- /api/leads Route Handler) bypasses RLS and can insert/select.
-- (Stage 7 Security Foundation may add explicit deny/audit policies; none are
--  required for correct behavior here.)

-- Belt-and-suspenders: ensure anon/authenticated have no table grants either.
revoke all on public.leads from anon;
revoke all on public.leads from authenticated;

-- =============================================================================
-- Verification (optional, run manually):
--   insert as service role should succeed; as anon should fail.
--   select * from public.leads order by created_at desc;   -- newest first (idx)
-- =============================================================================
