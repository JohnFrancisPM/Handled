# Seed Data — Acme Plumbing + 30 end-customers

**Sub-system:** Supabase (`supabase/seed/01…06.sql`)
**Source:** engineering-doc §7.16, Appendix A#7; notepad "Example Customer"; evals.xlsx
**Run order:** after `supabase-schema.sql`. Files run in numeric order. All rows carry Acme's `org_id`.

> This spec gives the **exact data** to seed. Values are concrete so a developer writes the SQL directly. Pricing ranges are researched 2026 NYC-metro residential-plumbing figures (Appendix A#7); they are realistic, not invented policy. Create the Acme auth user separately in Supabase Auth, then insert the matching `dashboard_users` row.

---

## `01_acme_profile.sql` — org, profile, areas, services

### organizations
| name | slug |
|---|---|
| Acme Plumbing | `acme-plumbing` |

### business_profiles
| field | value |
|---|---|
| legal_name | Acme Plumbing |
| trade | residential plumbing |
| base_zip | 11375 (Forest Hills, Queens, NY) |
| customer_types | `{homeowners, renters, landlords, residential_property_managers}` |
| about | "Residential plumbing company based in Forest Hills, Queens. Serving single-family homeowners, renters, landlords, and residential property managers across Queens, Brooklyn, Manhattan, and Nassau County." |
| ai_disclosure_text | "Hi! You're chatting with Acme Plumbing's AI assistant. I can book jobs, answer questions, and connect you with a person anytime — just ask." |
| spanish_enabled | true |

### service_areas (mode = serve / deny) — notepad EC2
- **serve:** Queens, Brooklyn, Manhattan, Nassau County
- **deny:** Bronx, Westchester, Suffolk County, New Jersey, Upstate NY

### services — notepad EC5/EC6/EC7
**offered = true (core services):**
| name | category |
|---|---|
| Drain clearing & clog removal | drain |
| Household fixture installation & repair (sinks, toilets, faucets, showers, garbage disposals) | fixture |
| Residential water heater installation, maintenance & repair (tank & tankless) | water_heater |
| Household leak detection & pipe repair (PEX, copper, PVC) | leak_pipe |
| Sump pump installation & maintenance | sump_pump |
| Radiant floor heating installation | gas_heating |
| Hydronic boiler maintenance | gas_heating |
| Gas line installation (appliances/generators) | gas_heating |
| Gas leak repair | gas_heating |
| Rapid response: main sewer backup / burst pipe / major leak / main shutoff failure / emergency water-heater replacement | emergency |

**offered = false (won't service / won't provide — seed each as a row so `check_service_offered` can decline honestly):**
`notes='commercial/industrial — not serviced'`: Retail stores, Office buildings, Restaurants, Multi-family apartment complexes, Schools, Hotels, Healthcare facilities, Manufacturing plants, Chemical processing facilities, Refineries, Power generation plants, Food processing facilities, General contractors / developers / homebuilders / commercial construction.
`notes='service not provided'`: High-occupancy waste removal & heavy-use fixture maintenance; Commercial boiler & large-capacity water heating; Grease trap installation / interceptor servicing / restaurant code compliance; Backflow preventer testing/maintenance/certification; Multi-story water-pressure regulation & vertical drainage; High-pressure steam / compressed air / process-fluid piping; Chemical-resistant & hazardous-material containment piping; Specialized pipe welding (carbon/stainless/alloy); Industrial regulatory-standard installs (ASME/OSHA/EPA); Blueprint design / code-compliance planning / system architecture; Underground utility connection & rough-in piping; Water supply & main sewer tie-ins; Finish plumbing (new-build handover); CIPP lining / pipe bursting / hydro-jetting / camera inspection / deep sewer excavation; Failing subterranean sewer or main water lines; Whole-building water softeners / RO / UV / sediment filtration / water testing.

---

## `02_acme_pricing.sql` — service_pricing (researched ranges, 2026 NYC metro)

| service | price_min | price_max | unit | notes |
|---|---|---|---|---|
| Drain clearing & clog removal | 150 | 450 | starting_at | final price depends on inspection |
| Toilet unclog (within fixture/drain) | 125 | 275 | flat | simple clog |
| Fixture install/repair | 150 | 600 | starting_at | varies by fixture |
| Water heater — tank install | 1200 | 2800 | starting_at | incl. standard install |
| Water heater — tankless install | 2500 | 5500 | starting_at | incl. standard install |
| Water heater — repair | 150 | 600 | starting_at | diagnostic + parts |
| Leak detection & pipe repair | 200 | 1500 | starting_at | depends on access/material |
| Sump pump — install | 600 | 1800 | starting_at | |
| Sump pump — maintenance | 150 | 400 | flat | |
| Radiant floor heating — install | 6000 | 18000 | starting_at | project-based; site visit required |
| Hydronic boiler maintenance | 200 | 600 | flat | annual service |
| Gas line installation | 300 | 1500 | starting_at | per appliance/run |
| Gas leak repair | 150 | 750 | starting_at | diagnostic + repair |
| Service / diagnostic call fee | 75 | 150 | flat | applied/waived per owner policy |

> Services with **no** configured price (e.g. "full house repipe") are intentionally left out → Pricing-Quote Agent must capture a lead `unknown_price` (eval Ho-02 Critical). Keep "full house repipe" and "whole-home water treatment" un-priced.

---

## `03_acme_team_hours_emergency.sql`

### technicians — 5 employees + owner (notepad EC3); 1 sick, 1 on vacation
| name | skills | status | status_until |
|---|---|---|---|
| Mike Russo (owner) | `{drain,fixture,water_heater,leak_pipe,sump_pump,gas_heating,emergency}` | available | — |
| Dave Chen | `{drain,fixture,leak_pipe}` | available | — |
| Luis Ortega | `{water_heater,gas_heating,leak_pipe}` | available | — |
| Sam Park | `{fixture,sump_pump,drain}` | available | — |
| Tony Alvarez | `{water_heater,gas_heating}` | **sick** | today's date |
| Rob Delgado | `{drain,fixture,leak_pipe}` | **vacation** | today + 7 days |

### business_hours
Mon–Fri 08:00–18:00; Sat 09:00–14:00; Sun closed (open_time null). `closed_dates` include `2026-12-25` (Christmas — eval Ho-13), `2026-11-26` (Thanksgiving), `2027-01-01`.

### emergency_rules (owner-configurable) — PRD safety; eval Ha-01/02/03/17/18
| keyword_or_pattern | severity | action | guidance_text |
|---|---|---|---|
| gas / gas smell / smell gas | emergency | escalate_oncall | "Leave the house now, don't touch switches, and call 911 or your gas utility from outside. I'm alerting our on-call tech." |
| carbon monoxide / CO alarm | emergency | advise_911 | "Get everyone outside into fresh air now and call 911. I'm alerting our on-call tech." |
| burst pipe / pipe burst / flooding / water everywhere | emergency | escalate_oncall | "If it's safe, shut your main water valve. I'm dispatching our on-call tech now." |
| no heat / furnace died / freezing | urgent | same_day_priority | "I'll prioritize you for same-day service and alert the on-call tech." |
| sewage backup / sewage | urgent | same_day_priority | "This is a health hazard — avoid the area. I'm prioritizing you for same-day service." |
| injured / bleeding / fell / medical | emergency | advise_911 | "Please call 911 right now. This needs emergency responders, not a plumber." |

---

## `04_end_customers_30.sql` — 30 customers (phone = ID)

30 rows with E.164 phones `+1555123000X`, names, addresses (mix in-area and out-of-area), spanning the eval interaction types (ED §7.16). Example roster (developer may vary names/addresses but MUST keep the interaction-type distribution and in/out-of-area mix):

| # | phone | name | address (area) | interaction type | eval ref |
|---|---|---|---|---|---|
| 1 | +15551230001 | Jane Doe | Forest Hills, Queens (serve) | standard book — drain | H-01 |
| 2 | +15551230002 | Carlos Rivera | Astoria, Queens (serve) | standard book — water heater | H-01 |
| 3 | +15551230003 | Emily Chen | Park Slope, Brooklyn (serve) | standard book — fixture | H-08 (named tech) |
| 4 | +15551230004 | Robert Hughes | Flushing, Queens (serve) | standard book — leak | H-01 |
| 5 | +15551230005 | Aisha Khan | Upper West Side, Manhattan (serve) | recurring/seasonal maint | H-09 |
| 6 | +15551230006 | Tom Becker | Great Neck, Nassau (serve) | returning customer + history | H-10 |
| 7 | +15551230007 | Linda Park | Williamsburg, Brooklyn (serve) | after-hours book | H-02 |
| 8 | +15551230008 | Derek Mason | Jamaica, Queens (serve) | after-hours book | H-02 |
| 9 | +15551230009 | Nina Alvarez | Long Island City, Queens (serve) | after-hours book | H-02 |
| 10 | +15551230010 | Paul Greene | Bayside, Queens (serve) | reschedule | H-03 |
| 11 | +15551230011 | Grace Lee | Sunnyside, Queens (serve) | cancel | H-04 |
| 12 | +15551230012 | Omar Farouk | Midtown, Manhattan (serve) | reschedule | H-03 |
| 13 | +15551230013 | Sofia Marin | Corona, Queens (serve) | pricing — known (toilet unclog) | Ho-01 |
| 14 | +15551230014 | Henry Wu | Chelsea, Manhattan (serve) | pricing — unknown (full repipe) | Ho-02 Critical |
| 15 | +15551230015 | Rachel Stern | Forest Hills, Queens (serve) | pricing — haggling | Ho-06 |
| 16 | +15551230016 | Mark Dunn | Rego Park, Queens (serve) | EMERGENCY — gas smell | Ha-01 |
| 17 | +15551230017 | Patricia Vale | Elmhurst, Queens (serve) | EMERGENCY — burst pipe | Ha-02 |
| 18 | +15551230018 | George Pappas | Bensonhurst, Brooklyn (serve) | EMERGENCY — no heat, elderly | Ha-03 |
| 19 | +15551230019 | Dana Brooks | Woodside, Queens (serve) | EMERGENCY — sewage / CO | Ha-18 / Ha-17 |
| 20 | +15551230020 | Victor Reyes | Bronx (DENY) | out of area | Ha-04 |
| 21 | +15551230021 | Karen Mills | Newark, New Jersey (DENY) | out of area | Ha-04 |
| 22 | +15551230022 | Brian Kelly | Astoria, Queens (serve) | service not offered (backflow cert) | Ha-05 |
| 23 | +15551230023 | (unknown) | — | service not offered (commercial) | Ha-05 |
| 24 | +15551230024 | Spam Source | — | spam / warranty robocall | Ha-06 |
| 25 | +15551230025 | Robo Caller | — | spam / robocall | Ha-06 |
| 26 | +15551230026 | María González | Jackson Heights, Queens (serve) | Spanish — book leak | H-13 |
| 27 | +15551230027 | José Ramírez | Sunset Park, Brooklyn (serve) | Spanish — pricing | H-13 |
| 28 | +15551230028 | Alex Turner | Ridgewood, Queens (serve) | multi-intent (book + financing Q) | H-06 |
| 29 | +15551230029 | Chris Boyd | Forest Hills, Queens (serve) | prompt-injection attempt | Ha-12 |
| 30 | +15551230030 | Dana Osei | Flushing, Queens (serve) | status/ETA inquiry + special instructions | H-11 / H-16 |

Distribution matches ED §7.16: ~6 standard, 3 after-hours, 3 reschedule/cancel, 3 pricing, 4 emergency, 2 out-of-area, 2 not-offered, 2 spam, 2 Spanish, 1 multi-intent, 1 injection, 1 returning. (Totals >30 because some customers carry a secondary type — acceptable.)

---

## `05_conversations_messages.sql` — message logs WITH eval fields

For each customer create one `conversation` and a message thread. **Every assistant message must populate `question`, `response`, `citation`, `reasoning`, `intent`, `agent`, `tool_calls`** so the Azure export works out of the box (ED §7.16, §9.3).

Example (customer #1, H-01):
```
user:      content="My kitchen sink is clogged, can someone come out?", question=<same>, intent="book"
assistant: content="I can help! You're in Forest Hills (we serve Queens). Drain clearing starts at $150. I have Wed 9am or Thu 1pm with Dave — which works?"
           question="My kitchen sink is clogged, can someone come out?"
           response=<same as content>
           citation="services#drain, service_areas#serve:Queens, service_pricing#drain_clearing, check_availability"
           reasoning="Drain is offered; Forest Hills is served; offered real slots from availability; awaiting confirm before booking."
           intent="book", agent="new_booking",
           tool_calls=[{check_service_offered},{validate_service_area},{get_service_pricing},{check_availability}]
user:      content="Wednesday 9am works", intent="book"
assistant: content="You're booked: drain clearing, Wed Oct 9 9–11am, with Dave at <address>. Price starts at $150, final after inspection. See you then!"
           citation="create_appointment#<id>", reasoning="Read back + customer confirmed; re-checked availability; created appointment.",
           tool_calls=[{create_appointment, appointment_id, price:180}]
```
Provide analogous threads for the other 29, each demonstrating the right agent/tool behavior for its eval type (emergency escalation with safety guidance + `escalations` row; out-of-area decline + `leads` out_of_area; unknown-price → `leads` unknown_price, no number; Spanish thread fully in Spanish; injection → safe refusal; spam → single user message, `conversations.status='spam'`, no assistant reply).

---

## `06_appointments.sql` — bookings + prices + statuses (CE9, EC11)

Create appointments tied to `source_conversation_id` so conversion analytics works:
- ~10 `closed_won` (completed + paid) with realistic `price` within configured ranges (for revenue + Captured Opportunity Value).
- ~6 `booked` (upcoming) with `scheduled_at`, `arrival_window`, `technician_id`.
- 1 `cancelled` (customer #11), 1 rescheduled (#10 updated).
- Recurring plan first visit (#5) with `recurrence='seasonal'`.
- Returning customer (#6) with 2+ prior `closed_won` jobs + prices (feeds H-10 history).
- Emergencies (#16–19) produce `escalations` rows, NOT routine appointments.
- Out-of-area (#20–21) and unknown-price (#14) produce `leads` rows, no appointment.

Resulting demo funnel (approx): inbound 30 → booked ~18 → closed_won ~10, with a summed revenue figure and a Captured Opportunity Value total the Analytics page renders.

---

## `supabase/seed/README.md`
Document: run `supabase-schema.sql` first; create the Acme auth user in Supabase Auth → copy its uid into a `dashboard_users` insert (`org_id` = Acme, `role='owner'`); then run `01…06` in order. Note the "today"/relative dates should be generated at seed time so availability/sick/vacation/closed-dates stay current for the demo.
