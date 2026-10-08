-- =====================================================================
-- Seed 01 — Acme Plumbing: organization, business profile, service areas,
--           services (offered + won't-provide).
-- Source: docs/customer-app/implementation/seed-data.md §01
-- Run AFTER supabase/migrations/0001_init.sql. Run via service-role
-- (Supabase SQL Editor / psql) — bypasses RLS.
--
-- FIXED-UUID SCHEME (so later seed files resolve FKs without lookups):
--   org              a0000000-...-000000000001
--   business_profile a0000000-...-000000000002
--   services offered 50000000-...-0000000000NN   (01..11)
--   technicians      70000000-...-0000000000NN   (01..06)   [file 03]
--   end_customers    c0000000-...-0000000000NN   (01..30)   [file 04]
--   conversations    d0000000-...-0000000000NN   (01..30)   [file 05]
-- Not-offered services use gen_random_uuid() (never referenced elsewhere).
-- =====================================================================

-- ---------- organizations ----------
insert into public.organizations (id, name, slug) values
  ('a0000000-0000-0000-0000-000000000001', 'Acme Plumbing', 'acme-plumbing')
on conflict (id) do nothing;

-- ---------- business_profiles (1:1 with org) ----------
insert into public.business_profiles
  (id, org_id, legal_name, trade, base_zip, customer_types, about, ai_disclosure_text, spanish_enabled)
values (
  'a0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  'Acme Plumbing',
  'residential plumbing',
  '11375',
  '{homeowners,renters,landlords,residential_property_managers}',
  'Residential plumbing company based in Forest Hills, Queens. Serving single-family homeowners, renters, landlords, and residential property managers across Queens, Brooklyn, Manhattan, and Nassau County.',
  'Hi! You''re chatting with Acme Plumbing''s AI assistant. I can book jobs, answer questions, and connect you with a person anytime — just ask.',
  true
)
on conflict (id) do nothing;

-- ---------- service_areas (serve / deny) — notepad EC2 ----------
insert into public.service_areas (org_id, region, zips, mode) values
  ('a0000000-0000-0000-0000-000000000001', 'Queens',          '{}', 'serve'),
  ('a0000000-0000-0000-0000-000000000001', 'Brooklyn',        '{}', 'serve'),
  ('a0000000-0000-0000-0000-000000000001', 'Manhattan',       '{}', 'serve'),
  ('a0000000-0000-0000-0000-000000000001', 'Nassau County',   '{}', 'serve'),
  ('a0000000-0000-0000-0000-000000000001', 'Bronx',           '{}', 'deny'),
  ('a0000000-0000-0000-0000-000000000001', 'Westchester',     '{}', 'deny'),
  ('a0000000-0000-0000-0000-000000000001', 'Suffolk County',  '{}', 'deny'),
  ('a0000000-0000-0000-0000-000000000001', 'New Jersey',      '{}', 'deny'),
  ('a0000000-0000-0000-0000-000000000001', 'Upstate NY',      '{}', 'deny');

-- ---------- services: offered = true (core) — notepad EC5 ----------
insert into public.services (id, org_id, name, category, offered, description) values
  ('50000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','Drain clearing & clog removal','drain',true,'Clearing clogged drains and removing blockages.'),
  ('50000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000001','Household fixture installation & repair (sinks, toilets, faucets, showers, garbage disposals)','fixture',true,'Install and repair household fixtures.'),
  ('50000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000001','Residential water heater installation, maintenance & repair (tank & tankless)','water_heater',true,'Tank and tankless water heater work.'),
  ('50000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000001','Household leak detection & pipe repair (PEX, copper, PVC)','leak_pipe',true,'Find and repair leaks across PEX, copper, and PVC.'),
  ('50000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000001','Sump pump installation & maintenance','sump_pump',true,'Install and maintain sump pumps.'),
  ('50000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000001','Radiant floor heating installation','gas_heating',true,'Install radiant floor heating.'),
  ('50000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000001','Hydronic boiler maintenance','gas_heating',true,'Annual service of hydronic boilers.'),
  ('50000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000001','Gas line installation (appliances/generators)','gas_heating',true,'Install gas lines for appliances and generators.'),
  ('50000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000001','Gas leak repair','gas_heating',true,'Diagnose and repair gas leaks.'),
  ('50000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000001','Rapid response: main sewer backup / burst pipe / major leak / main shutoff failure / emergency water-heater replacement','emergency',true,'Rapid-response emergency plumbing.'),
  -- Offered but intentionally UN-PRICED (no service_pricing row) so the
  -- Pricing-Quote Agent must capture a lead unknown_price (eval Ho-02 Critical).
  ('50000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000001','Full house repipe','leak_pipe',true,'Whole-home repipe — quoted after a site visit; no fixed price.')
on conflict (id) do nothing;

-- ---------- services: offered = false (won't SERVICE — commercial/industrial) ----------
insert into public.services (org_id, name, category, offered, notes)
select 'a0000000-0000-0000-0000-000000000001', name, 'commercial', false, 'commercial/industrial — not serviced'
from (values
  ('Retail stores'),
  ('Office buildings'),
  ('Restaurants'),
  ('Multi-family apartment complexes'),
  ('Schools'),
  ('Hotels'),
  ('Healthcare facilities'),
  ('Manufacturing plants'),
  ('Chemical processing facilities'),
  ('Refineries'),
  ('Power generation plants'),
  ('Food processing facilities'),
  ('General contractors / developers / homebuilders / commercial construction')
) as t(name);

-- ---------- services: offered = false (won't PROVIDE — service not provided) ----------
insert into public.services (org_id, name, category, offered, notes)
select 'a0000000-0000-0000-0000-000000000001', name, 'not_provided', false, 'service not provided'
from (values
  ('High-occupancy waste removal & heavy-use fixture maintenance'),
  ('Commercial boiler & large-capacity water heating'),
  ('Grease trap installation / interceptor servicing / restaurant code compliance'),
  ('Backflow preventer testing/maintenance/certification'),
  ('Multi-story water-pressure regulation & vertical drainage'),
  ('High-pressure steam / compressed air / process-fluid piping'),
  ('Chemical-resistant & hazardous-material containment piping'),
  ('Specialized pipe welding (carbon/stainless/alloy)'),
  ('Industrial regulatory-standard installs (ASME/OSHA/EPA)'),
  ('Blueprint design / code-compliance planning / system architecture'),
  ('Underground utility connection & rough-in piping'),
  ('Water supply & main sewer tie-ins'),
  ('Finish plumbing (new-build handover)'),
  ('CIPP lining / pipe bursting / hydro-jetting / camera inspection / deep sewer excavation'),
  ('Failing subterranean sewer or main water lines'),
  ('Whole-building water softeners / RO / UV / sediment filtration / water testing')
) as t(name);
