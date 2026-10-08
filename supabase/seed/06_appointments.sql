-- =====================================================================
-- Seed 06 — appointments (+ prices/statuses), leads, escalations,
--           notifications. Source: seed-data.md §06 (CE9, EC11).
-- Appointments tie to source_conversation_id so conversion analytics works.
-- Demo funnel (approx): inbound 30 → booked ~17 → closed_won 10.
-- Emergencies (#16–19) → escalations (NOT appointments).
-- Out-of-area (#20,21) + unknown-price (#14) → leads (no appointment).
-- Prices are within the configured ranges from 02_acme_pricing.sql.
-- Service ids: drain=…001 fixture=…002 water_heater=…003 leak=…004
--              sump=…005 boiler=…007 ; techs: Dave=…002 Luis=…003 Sam=…004
-- =====================================================================

-- ---------- CLOSED_WON (10): completed + paid (past-dated) ----------
insert into public.appointments
  (org_id, end_customer_id, service_id, technician_id, scheduled_at, arrival_window, status, price, source_conversation_id, recurrence, confirmed, notes) values
  -- #1 Jane Doe — drain
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000002', now() - interval '6 days', '9:00–11:00 AM','closed_won', 180, 'd0000000-0000-0000-0000-000000000001','none', true, 'Kitchen sink clog cleared.'),
  -- #2 Carlos Rivera — water heater
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000003','70000000-0000-0000-0000-000000000003', now() - interval '5 days', '10:00 AM–1:00 PM','closed_won', 1850, 'd0000000-0000-0000-0000-000000000002','none', true, 'Tank water heater replaced.'),
  -- #3 Emily Chen — fixture (named tech Dave)
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000002','70000000-0000-0000-0000-000000000002', now() - interval '4 days', '1:00–3:00 PM','closed_won', 220, 'd0000000-0000-0000-0000-000000000003','none', true, 'Kitchen faucet installed.'),
  -- #4 Robert Hughes — leak
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000004','50000000-0000-0000-0000-000000000004','70000000-0000-0000-0000-000000000002', now() - interval '3 days', '11:00 AM–1:00 PM','closed_won', 340, 'd0000000-0000-0000-0000-000000000004','none', true, 'Supply line leak repaired under bathroom sink.'),
  -- #6 Tom Becker — current sump maintenance
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000006','50000000-0000-0000-0000-000000000005','70000000-0000-0000-0000-000000000004', now() - interval '2 days', '1:00–3:00 PM','closed_won', 225, 'd0000000-0000-0000-0000-000000000006','none', true, 'Sump pump serviced.'),
  -- #6 Tom Becker — PRIOR job #1 (history for H-10), no conversation
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000006','50000000-0000-0000-0000-000000000003','70000000-0000-0000-0000-000000000003', now() - interval '320 days', '9:00–11:00 AM','closed_won', 480, null,'none', true, 'Prior job: water heater repair.'),
  -- #6 Tom Becker — PRIOR job #2 (history for H-10), no conversation
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000006','50000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000002', now() - interval '150 days', '8:00–10:00 AM','closed_won', 190, null,'none', true, 'Prior job: drain clearing.'),
  -- #7 Linda Park — after-hours disposal (fixture)
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000007','50000000-0000-0000-0000-000000000002','70000000-0000-0000-0000-000000000004', now() - interval '1 days', '8:00–10:00 AM','closed_won', 175, 'd0000000-0000-0000-0000-000000000007','none', true, 'Garbage disposal unjammed/repaired.'),
  -- #26 María González — leak (Spanish)
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000026','50000000-0000-0000-0000-000000000004','70000000-0000-0000-0000-000000000002', now() - interval '2 days', '11:00 AM–1:00 PM','closed_won', 300, 'd0000000-0000-0000-0000-000000000026','none', true, 'Leak under kitchen sink repaired.'),
  -- #28 Alex Turner — sump install
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000028','50000000-0000-0000-0000-000000000005','70000000-0000-0000-0000-000000000004', now() - interval '1 days', '10:00 AM–12:00 PM','closed_won', 950, 'd0000000-0000-0000-0000-000000000028','none', true, 'Sump pump installed.');

-- ---------- BOOKED (6): upcoming ----------
insert into public.appointments
  (org_id, end_customer_id, service_id, technician_id, scheduled_at, arrival_window, status, price, source_conversation_id, recurrence, waitlist, confirmed, notes) values
  -- #5 Aisha Khan — boiler maintenance, seasonal recurrence
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000007','70000000-0000-0000-0000-000000000003', now() + interval '3 days', '9:00–11:00 AM','booked', 350, 'd0000000-0000-0000-0000-000000000005','seasonal', false, true, 'First visit of seasonal maintenance plan; office to confirm standing plan.'),
  -- #8 Derek Mason — drain (after-hours booked for next day)
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000008','50000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000002', now() + interval '1 days', '9:00–11:00 AM','booked', 160, 'd0000000-0000-0000-0000-000000000008','none', false, true, 'Slow shower drain.'),
  -- #9 Nina Alvarez — toilet repair (fixture, after-hours)
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000009','50000000-0000-0000-0000-000000000002','70000000-0000-0000-0000-000000000004', now() + interval '1 days', '2:00–4:00 PM','booked', 190, 'd0000000-0000-0000-0000-000000000009','none', false, true, 'Toilet repair.'),
  -- #12 Omar Farouk — water heater (rescheduled to next Thu)
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000012','50000000-0000-0000-0000-000000000003','70000000-0000-0000-0000-000000000003', now() + interval '8 days', '8:00–11:00 AM','booked', null, 'd0000000-0000-0000-0000-000000000012','none', false, true, 'Rescheduled from Monday 8am at customer request.'),
  -- #30 Dana Osei — drain (status/ETA + special instructions)
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000030','50000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000004', now() + interval '1 days', '9:00–11:00 AM','booked', null, 'd0000000-0000-0000-0000-000000000030','none', false, true, 'Gate code 4417; dog on site.'),
  -- #10 Paul Greene — drain RESCHEDULED Thu->Fri (still booked)
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000010','50000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000002', now() + interval '2 days', '1:00–3:00 PM','booked', null, 'd0000000-0000-0000-0000-000000000010','none', false, true, 'Rescheduled from Thursday 10am to Friday 1pm.');

-- ---------- CANCELLED (1) ----------
insert into public.appointments
  (org_id, end_customer_id, service_id, technician_id, scheduled_at, arrival_window, status, price, source_conversation_id, recurrence, confirmed, notes) values
  -- #11 Grace Lee — cancelled (issue resolved)
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000011','50000000-0000-0000-0000-000000000002','70000000-0000-0000-0000-000000000002', now() + interval '2 days', '9:00–11:00 AM','cancelled', null, 'd0000000-0000-0000-0000-000000000011','none', false, 'Cancelled by customer — issue resolved on its own; offered rebook.');

-- ---------- LEADS (AI could not close) ----------
insert into public.leads
  (org_id, end_customer_id, conversation_id, reason, requested_service, detail, status) values
  -- #14 unknown price (full repipe) — Ho-02 Critical
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000014','d0000000-0000-0000-0000-000000000014','unknown_price','Full house repipe','No configured price; team to quote after assessment.','open'),
  -- #20 out of area (Bronx) — Ha-04
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000020','d0000000-0000-0000-0000-000000000020','out_of_area','Leak repair','Bronx is outside the service area; logged in case of expansion.','open'),
  -- #21 out of area (NJ) — Ha-04
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000021','d0000000-0000-0000-0000-000000000021','out_of_area','Water heater','Newark, NJ is outside the service area.','open'),
  -- #5 recurring plan — H-09
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000005','d0000000-0000-0000-0000-000000000005','recurring_plan','Hydronic boiler maintenance','Customer wants twice-yearly seasonal plan; first visit booked, confirm standing plan.','open'),
  -- #28 callback (financing question) — H-06 multi-intent
  ('a0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000028','d0000000-0000-0000-0000-000000000028','callback','Sump pump install','Customer asked about financing; office to follow up.','open');

-- ---------- ESCALATIONS (emergencies #16–19) — SAFETY ----------
insert into public.escalations
  (org_id, conversation_id, end_customer_id, type, severity, target, guidance_sent, status) values
  -- #16 gas smell — Ha-01 Critical
  ('a0000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000016','c0000000-0000-0000-0000-000000000016','emergency','emergency','on_call_tech','Leave the house now, don''t touch switches, call 911 or your gas utility from outside. On-call tech alerted.','open'),
  -- #17 burst pipe — Ha-02 Critical
  ('a0000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000017','c0000000-0000-0000-0000-000000000017','emergency','emergency','on_call_tech','Shut main water valve if safe. On-call tech dispatched immediately.','open'),
  -- #18 no heat, elderly — Ha-03 Critical
  ('a0000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000018','c0000000-0000-0000-0000-000000000018','emergency','urgent','on_call_tech','Prioritized for same-day service; on-call tech alerted; advised to call 911 if unwell from cold.','open'),
  -- #19 sewage + CO alarm — Ha-17 / Ha-18 Critical
  ('a0000000-0000-0000-0000-000000000001','d0000000-0000-0000-0000-000000000019','c0000000-0000-0000-0000-000000000019','emergency','emergency','on_call_tech','CO: everyone outside, call 911. Sewage health hazard — avoid area. On-call tech alerted; same-day priority.','open');

-- ---------- NOTIFICATIONS (owner / on-call alerts) ----------
insert into public.notifications (org_id, channel, kind, read) values
  ('a0000000-0000-0000-0000-000000000001','owner','new_booking', false),
  ('a0000000-0000-0000-0000-000000000001','owner','new_booking', true),
  ('a0000000-0000-0000-0000-000000000001','on_call_tech','escalation', false),
  ('a0000000-0000-0000-0000-000000000001','on_call_tech','escalation', false),
  ('a0000000-0000-0000-0000-000000000001','on_call_tech','escalation', false),
  ('a0000000-0000-0000-0000-000000000001','on_call_tech','escalation', false),
  ('a0000000-0000-0000-0000-000000000001','owner','after_hours_summary', false),
  ('a0000000-0000-0000-0000-000000000001','owner','lead', false),
  ('a0000000-0000-0000-0000-000000000001','owner','lead', false);
