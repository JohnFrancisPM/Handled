-- =====================================================================
-- Seed 03 — technicians (5 + owner; 1 sick today, 1 on vacation this week),
--           business_hours (weekly + holidays), emergency_rules.
-- Source: docs/customer-app/implementation/seed-data.md §03
-- Relative dates (current_date) keep the demo current on every run.
-- =====================================================================

-- ---------- technicians (notepad EC3) ----------
insert into public.technicians (id, org_id, name, skills, status, status_until) values
  ('70000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','Mike Russo (owner)','{drain,fixture,water_heater,leak_pipe,sump_pump,gas_heating,emergency}','available', null),
  ('70000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000001','Dave Chen','{drain,fixture,leak_pipe}','available', null),
  ('70000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000001','Luis Ortega','{water_heater,gas_heating,leak_pipe}','available', null),
  ('70000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000001','Sam Park','{fixture,sump_pump,drain}','available', null),
  ('70000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000001','Tony Alvarez','{water_heater,gas_heating}','sick', current_date),
  ('70000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000001','Rob Delgado','{drain,fixture,leak_pipe}','vacation', current_date + 7)
on conflict (id) do nothing;

-- ---------- business_hours (Mon–Fri 08–18, Sat 09–14, Sun closed) ----------
-- day_of_week: 0=Sunday … 6=Saturday. Holidays live in closed_dates[] (eval Ho-13).
insert into public.business_hours (org_id, day_of_week, open_time, close_time, closed_dates) values
  ('a0000000-0000-0000-0000-000000000001', 0, null,       null,       '{}'),                                    -- Sun closed
  ('a0000000-0000-0000-0000-000000000001', 1, '08:00',    '18:00',    '{2026-12-25,2026-11-26,2027-01-01}'),    -- Mon
  ('a0000000-0000-0000-0000-000000000001', 2, '08:00',    '18:00',    '{2026-12-25,2026-11-26,2027-01-01}'),    -- Tue
  ('a0000000-0000-0000-0000-000000000001', 3, '08:00',    '18:00',    '{2026-12-25,2026-11-26,2027-01-01}'),    -- Wed
  ('a0000000-0000-0000-0000-000000000001', 4, '08:00',    '18:00',    '{2026-12-25,2026-11-26,2027-01-01}'),    -- Thu
  ('a0000000-0000-0000-0000-000000000001', 5, '08:00',    '18:00',    '{2026-12-25,2026-11-26,2027-01-01}'),    -- Fri
  ('a0000000-0000-0000-0000-000000000001', 6, '09:00',    '14:00',    '{2026-12-25,2026-11-26,2027-01-01}')     -- Sat
on conflict (org_id, day_of_week) do nothing;

-- ---------- emergency_rules (owner-configurable triage; PRD safety) ----------
insert into public.emergency_rules (org_id, keyword_or_pattern, severity, action, guidance_text) values
  ('a0000000-0000-0000-0000-000000000001','gas / gas smell / smell gas','emergency','escalate_oncall','Leave the house now, don''t touch switches, and call 911 or your gas utility from outside. I''m alerting our on-call tech.'),
  ('a0000000-0000-0000-0000-000000000001','carbon monoxide / CO alarm','emergency','advise_911','Get everyone outside into fresh air now and call 911. I''m alerting our on-call tech.'),
  ('a0000000-0000-0000-0000-000000000001','burst pipe / pipe burst / flooding / water everywhere','emergency','escalate_oncall','If it''s safe, shut your main water valve. I''m dispatching our on-call tech now.'),
  ('a0000000-0000-0000-0000-000000000001','no heat / furnace died / freezing','urgent','same_day_priority','I''ll prioritize you for same-day service and alert the on-call tech.'),
  ('a0000000-0000-0000-0000-000000000001','sewage backup / sewage','urgent','same_day_priority','This is a health hazard — avoid the area. I''m prioritizing you for same-day service.'),
  ('a0000000-0000-0000-0000-000000000001','injured / bleeding / fell / medical','emergency','advise_911','Please call 911 right now. This needs emergency responders, not a plumber.');
