# Testing Strategy

**Source:** engineering-doc §13.1 (software tests) + §13.2 (agent eval — see `eval-pipeline.md`)

## Unit (Vitest) — target ≥80% on `lib/`
- Tool-layer logic: `validate_service_area` serve/deny precedence; `check_availability` excludes sick/vacation techs + respects hours/closed_dates + subtracts existing appointments; `get_service_pricing` returns range only, `found:false` for un-priced service.
- `lib/analytics/conversion.ts`: inbound/booked/closed_won counts, conversion_rate, revenue, Captured Opportunity Value.
- Builder-side eval export (`scripts/export-evals.ts`, outside `apps/customer-app`): JSONL builder emits the 4 required fields + optional ground_truth/category. (Not a dashboard route — tested as a standalone script against the DB pull.)
- Zod schemas: valid/invalid cases incl. `price_max >= price_min` refine.

## Integration (Vitest + real test Supabase — NOT mocks, ED §13.1)
- RLS: a user from org A cannot read org B's conversations/appointments/customers (cross-org read must fail).
- Profile write via `PUT /api/profile/[panel]` reflected in a subsequent `GET /api/profile`.
- `PATCH /api/leads/[id]` updates status, org-scoped.
- Webhook context loader returns the full bundle (phone/name/address/history/prior jobs+prices + business config).
- Tool writes: `create_appointment` rejects without `confirmed_readback`; `capture_lead` inserts a leads row + notification.

## E2E (Playwright)
- Owner login → edit a policy panel → persists.
- Inbox renders a seeded conversation thread with reasoning/citation popover.
- Analytics funnel renders with seeded data.
- Demo-stability: with auth env absent, app loads seeded Acme read-only (no login redirect, editor disabled).

> No E2E for eval export: it is a builder-side DB pull outside the customer app, covered by the builder-side export unit test above, not a dashboard page/route.

## Agent evaluation (the graded loop)
Full offline eval against the 50 `evals.xlsx` cases + Azure Foundry export — specified in `eval-pipeline.md`. Launch gates: any Critical failure blocks; emergency recall must = 100%.

## Fixtures
Seed data (`seed-data.md`) provides Acme + 30 customers spanning eval types, so integration/E2E/agent tests run against realistic data. A second throwaway org is created in integration tests to prove RLS isolation.
