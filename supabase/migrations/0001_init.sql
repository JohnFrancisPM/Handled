-- =====================================================================
-- Migration 0001_init — Handled Customer Experience schema (paste-and-run)
-- App: customer-app  |  Stage 4 (Feature Implementation)
-- Source (AUTHORITATIVE): docs/customer-app/implementation/supabase-schema.sql
--   (engineering-doc.md §7). This migration reproduces that schema verbatim:
--   17 tables, enums/CHECKs, FKs, indexes, updated_at triggers, RLS on every
--   table, and the realtime publication.
-- Run this ENTIRE file in the Supabase SQL Editor on a fresh project
--   (or `supabase db push`). Idempotent-ish: safe to re-run
--   (drops policies/triggers before create; CREATE TABLE IF NOT EXISTS).
-- After this, run the seed scripts in supabase/seed/ (see supabase/seed/README.md).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- ---------------------------------------------------------------------
-- 1. updated_at trigger function (shared by every table with updated_at)
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 2. Org-resolution helper (used by RLS). SECURITY DEFINER so it can
--    read dashboard_users without recursing through RLS.
-- ---------------------------------------------------------------------
-- (defined after dashboard_users exists — see section 4)

-- =====================================================================
-- 3. organizations  (a Handled customer = a business, e.g. Acme Plumbing)
-- =====================================================================
create table if not exists public.organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- 4. dashboard_users  (auth users; id = auth.users.id)
-- =====================================================================
create table if not exists public.dashboard_users (
  id         uuid primary key references auth.users(id) on delete cascade,
  org_id     uuid not null references public.organizations(id) on delete cascade,
  email      text not null,
  role       text not null default 'owner' check (role in ('owner','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists dashboard_users_org_idx on public.dashboard_users(org_id);

-- Org-resolution helper for RLS
create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.dashboard_users where id = auth.uid()
$$;

-- =====================================================================
-- 5. business_profiles  (1:1 with org)   (ED §7.3)
-- =====================================================================
create table if not exists public.business_profiles (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null unique references public.organizations(id) on delete cascade,
  legal_name         text not null,
  trade              text,
  base_zip           text,
  customer_types     text[] not null default '{}',
  about              text,
  ai_disclosure_text text,
  spanish_enabled    boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- =====================================================================
-- 6. service_areas   (ED §7.4) — serve / deny regions
-- =====================================================================
create table if not exists public.service_areas (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  region     text not null,
  zips       text[] not null default '{}',
  mode       text not null check (mode in ('serve','deny')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists service_areas_org_mode_idx on public.service_areas(org_id, mode);

-- =====================================================================
-- 7. services   (ED §7.5) — offered=true core, offered=false won't-provide
-- =====================================================================
create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  name        text not null,
  category    text,
  offered     boolean not null,
  description text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists services_org_offered_idx on public.services(org_id, offered);
create index if not exists services_org_category_idx on public.services(org_id, category);

-- =====================================================================
-- 8. service_pricing   (ED §7.6) — configured ranges; agents quote within
-- =====================================================================
create table if not exists public.service_pricing (
  id         uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  org_id     uuid not null references public.organizations(id) on delete cascade,
  price_min  numeric(10,2),
  price_max  numeric(10,2),
  unit       text not null default 'flat' check (unit in ('flat','hourly','starting_at')),
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists service_pricing_service_idx on public.service_pricing(service_id);
create index if not exists service_pricing_org_idx on public.service_pricing(org_id);

-- =====================================================================
-- 9. business_hours   (ED §7.7)
-- =====================================================================
create table if not exists public.business_hours (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations(id) on delete cascade,
  day_of_week  int not null check (day_of_week between 0 and 6), -- 0=Sunday
  open_time    time,     -- null = closed that day
  close_time   time,
  closed_dates date[] not null default '{}',  -- holidays (eval Ho-13)
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (org_id, day_of_week)
);

-- =====================================================================
-- 10. technicians   (ED §7.8) — 5 employees + owner; availability state
-- =====================================================================
create table if not exists public.technicians (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations(id) on delete cascade,
  name         text not null,
  skills       text[] not null default '{}',  -- service categories they can do
  status       text not null default 'available' check (status in ('available','sick','vacation','off')),
  status_until date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists technicians_org_status_idx on public.technicians(org_id, status);

-- =====================================================================
-- 11. emergency_rules   (ED §7.9) — owner-configurable triage rules
-- =====================================================================
create table if not exists public.emergency_rules (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references public.organizations(id) on delete cascade,
  keyword_or_pattern text not null,
  severity           text not null check (severity in ('emergency','urgent')),
  action             text not null check (action in ('escalate_oncall','advise_911','same_day_priority')),
  guidance_text      text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists emergency_rules_org_idx on public.emergency_rules(org_id);

-- =====================================================================
-- 12. end_customers   (ED §7.10) — phone = customer ID, unique per org
-- =====================================================================
create table if not exists public.end_customers (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  phone      text not null,
  name       text,
  address    text,
  opted_out  boolean not null default false,  -- STOP honored (Ha-15)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, phone)
);
create index if not exists end_customers_org_phone_idx on public.end_customers(org_id, phone);

-- =====================================================================
-- 13. conversations   (ED §7.11)
-- =====================================================================
create table if not exists public.conversations (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations(id) on delete cascade,
  end_customer_id uuid not null references public.end_customers(id) on delete cascade,
  channel         text not null default 'sms',
  status          text not null default 'open' check (status in ('open','booked','closed','escalated','spam')),
  last_intent     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists conversations_org_status_idx on public.conversations(org_id, status);
create index if not exists conversations_customer_idx on public.conversations(end_customer_id);

-- =====================================================================
-- 14. messages   (ED §7.12) — conversation memory + eval fields
-- =====================================================================
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role            text not null check (role in ('user','assistant','system')),
  content         text not null,
  question        text,   -- eval field (EV3)
  response        text,   -- eval field (EV3)
  citation        text,   -- eval field (EV3) — KB/tool/data source grounding the reply
  reasoning       text,   -- eval field (EV3) — short rationale (not raw CoT)
  intent          text,   -- router classification
  agent           text,   -- which specialist handled it
  tool_calls      jsonb,  -- tools invoked + args + results
  created_at      timestamptz not null default now()
);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at);
create index if not exists messages_org_role_idx on public.messages(org_id, role);

-- =====================================================================
-- 15. appointments   (ED §7.13) — simulated FSM jobs + prices
-- =====================================================================
create table if not exists public.appointments (
  id                     uuid primary key default gen_random_uuid(),
  org_id                 uuid not null references public.organizations(id) on delete cascade,
  end_customer_id        uuid not null references public.end_customers(id) on delete cascade,
  service_id             uuid references public.services(id) on delete set null,
  technician_id          uuid references public.technicians(id) on delete set null,
  scheduled_at           timestamptz,
  arrival_window         text,
  status                 text not null default 'requested'
                           check (status in ('requested','booked','completed','closed_won','cancelled','no_show')),
  price                  numeric(10,2),
  source_conversation_id uuid references public.conversations(id) on delete set null,
  recurrence             text not null default 'none'
                           check (recurrence in ('none','seasonal','monthly','quarterly')),
  waitlist               boolean not null default false,
  confirmed              boolean not null default false,
  notes                  text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index if not exists appointments_org_status_idx on public.appointments(org_id, status);
create index if not exists appointments_org_scheduled_idx on public.appointments(org_id, scheduled_at);
create index if not exists appointments_customer_idx on public.appointments(end_customer_id);

-- =====================================================================
-- 16. leads   (ED §7.13a) — captured when AI cannot complete
-- =====================================================================
create table if not exists public.leads (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references public.organizations(id) on delete cascade,
  end_customer_id   uuid not null references public.end_customers(id) on delete cascade,
  conversation_id   uuid references public.conversations(id) on delete set null,
  reason            text not null check (reason in
                      ('unknown_price','out_of_area','recurring_plan','unknown_warranty',
                       'callback','photo_followup','other')),
  requested_service text,
  detail            text,
  media_url         text,   -- photo follow-up (H-18)
  status            text not null default 'open' check (status in ('open','contacted','converted','dismissed')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists leads_org_status_idx on public.leads(org_id, status);

-- =====================================================================
-- 17. escalations   (ED §7.13b) — emergency / human-transfer (SAFETY)
-- =====================================================================
create table if not exists public.escalations (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  end_customer_id uuid not null references public.end_customers(id) on delete cascade,
  type            text not null check (type in ('emergency','human_transfer')),
  severity        text not null check (severity in ('emergency','urgent','standard')),
  target          text not null check (target in ('on_call_tech','owner')),
  guidance_sent   text,
  status          text not null default 'open' check (status in ('open','acknowledged','resolved')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists escalations_org_status_idx on public.escalations(org_id, status);

-- =====================================================================
-- 18. notifications   (ED §7.13c) — owner/tech alerts
-- =====================================================================
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  channel    text not null check (channel in ('owner','on_call_tech')),
  kind       text not null check (kind in ('new_booking','escalation','after_hours_summary','lead')),
  ref_id     uuid,   -- appointment/escalation/lead id (soft reference)
  read       boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists notifications_org_read_idx on public.notifications(org_id, read);

-- =====================================================================
-- 19. eval_exports   (ED §7.14)
-- =====================================================================
create table if not exists public.eval_exports (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  row_count  int not null default 0,
  format     text not null default 'azure_foundry_jsonl',
  created_by uuid references public.dashboard_users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists eval_exports_org_idx on public.eval_exports(org_id);

-- =====================================================================
-- 20. updated_at triggers (every table that has updated_at)
-- =====================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'organizations','dashboard_users','business_profiles','service_areas',
    'services','service_pricing','business_hours','technicians','emergency_rules',
    'end_customers','conversations','appointments','leads','escalations','notifications'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I;', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at();', t);
  end loop;
end $$;
-- Note: messages & eval_exports are append-only (no updated_at column).

-- =====================================================================
-- 21. Row Level Security
--   • Enable RLS on EVERY table.
--   • Dashboard users (authenticated, anon key) see ONLY their own org.
--   • n8n and Next.js Route Handlers use the SERVICE ROLE key, which
--     BYPASSES RLS; org scoping for those paths is enforced in the
--     tool layer / route handlers (ED §7.15).
-- =====================================================================
alter table public.organizations    enable row level security;
alter table public.dashboard_users  enable row level security;
alter table public.business_profiles enable row level security;
alter table public.service_areas    enable row level security;
alter table public.services         enable row level security;
alter table public.service_pricing  enable row level security;
alter table public.business_hours   enable row level security;
alter table public.technicians      enable row level security;
alter table public.emergency_rules  enable row level security;
alter table public.end_customers    enable row level security;
alter table public.conversations    enable row level security;
alter table public.messages         enable row level security;
alter table public.appointments     enable row level security;
alter table public.leads            enable row level security;
alter table public.escalations      enable row level security;
alter table public.notifications    enable row level security;
alter table public.eval_exports     enable row level security;

-- organizations: a user can read their own org row
drop policy if exists org_select on public.organizations;
create policy org_select on public.organizations
  for select to authenticated using (id = public.current_org_id());

-- dashboard_users: a user can read their own row only
drop policy if exists du_select on public.dashboard_users;
create policy du_select on public.dashboard_users
  for select to authenticated using (id = auth.uid());

-- Config tables the owner self-serves (full CRUD, org-scoped):
--   business_profiles, service_areas, services, service_pricing,
--   business_hours, technicians, emergency_rules
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
--   end_customers, conversations, messages, appointments, escalations
--   → authenticated gets SELECT (org-scoped) only.
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

-- leads: dashboard reads AND updates status (PATCH /api/leads/[id]); created by n8n (service role)
drop policy if exists leads_sel on public.leads;
drop policy if exists leads_upd on public.leads;
create policy leads_sel on public.leads
  for select to authenticated using (org_id = public.current_org_id());
create policy leads_upd on public.leads
  for update to authenticated using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());

-- notifications: dashboard reads and marks read; created by n8n
drop policy if exists notif_sel on public.notifications;
drop policy if exists notif_upd on public.notifications;
create policy notif_sel on public.notifications
  for select to authenticated using (org_id = public.current_org_id());
create policy notif_upd on public.notifications
  for update to authenticated using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());

-- eval_exports: builder-side export runs (the Azure AI Foundry JSONL export is a
-- builder task that pulls from the DB directly / via scripts/export-evals.ts,
-- not a customer-facing dashboard feature; records are inserted server-side)
drop policy if exists evx_sel on public.eval_exports;
drop policy if exists evx_ins on public.eval_exports;
create policy evx_sel on public.eval_exports
  for select to authenticated using (org_id = public.current_org_id());
create policy evx_ins on public.eval_exports
  for insert to authenticated with check (org_id = public.current_org_id());

-- =====================================================================
-- 22. Realtime (inbox live updates — ED §5)
--     Add the tables the dashboard subscribes to, to the realtime
--     publication. (Supabase creates supabase_realtime automatically.)
-- =====================================================================
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.conversations;
    exception when duplicate_object then null; end;
    begin
      alter publication supabase_realtime add table public.messages;
    exception when duplicate_object then null; end;
    begin
      alter publication supabase_realtime add table public.appointments;
    exception when duplicate_object then null; end;
  end if;
end $$;

-- =====================================================================
-- END — run seed-data.md scripts next.
-- =====================================================================
