-- =====================================================================
-- Seed 02 — service_pricing (researched 2026 NYC-metro residential ranges).
-- Source: docs/customer-app/implementation/seed-data.md §02 (verbatim values).
-- Prices attach to the offered service they describe (service_pricing allows
-- multiple rows per service). "Full house repipe" (svc …011) is intentionally
-- left UN-PRICED → Pricing-Quote Agent captures a lead unknown_price (Ho-02).
-- =====================================================================

insert into public.service_pricing (service_id, org_id, price_min, price_max, unit, notes) values
  -- Drain
  ('50000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001', 150, 450, 'starting_at', 'final price depends on inspection'),
  -- Fixture
  ('50000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000001', 125, 275, 'flat',        'toilet unclog — simple clog'),
  ('50000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000001', 150, 600, 'starting_at', 'fixture install/repair — varies by fixture'),
  -- Water heater
  ('50000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000001', 1200, 2800, 'starting_at', 'tank install — incl. standard install'),
  ('50000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000001', 2500, 5500, 'starting_at', 'tankless install — incl. standard install'),
  ('50000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000001', 150, 600, 'starting_at',  'water heater repair — diagnostic + parts'),
  -- Leak detection & pipe repair
  ('50000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000001', 200, 1500, 'starting_at', 'leak detection & pipe repair — depends on access/material'),
  -- Sump pump
  ('50000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000001', 600, 1800, 'starting_at', 'sump pump install'),
  ('50000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000001', 150, 400, 'flat',         'sump pump maintenance'),
  -- Radiant floor heating
  ('50000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000001', 6000, 18000, 'starting_at', 'project-based; site visit required'),
  -- Hydronic boiler maintenance
  ('50000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000001', 200, 600, 'flat',          'annual service'),
  -- Gas line installation
  ('50000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000001', 300, 1500, 'starting_at',  'per appliance/run'),
  -- Gas leak repair
  ('50000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000001', 150, 750, 'starting_at',   'diagnostic + repair'),
  -- Service / diagnostic call fee (cross-cutting; attached to leak/pipe service)
  ('50000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000001', 75, 150, 'flat',           'service / diagnostic call fee — applied/waived per owner policy');
