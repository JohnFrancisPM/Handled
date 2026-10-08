# Dashboard API — Route Handlers & Zod schemas

**Sub-system:** Dashboard (`app/api/**`, `lib/schemas/*`, `lib/supabase/*`)
**Source:** engineering-doc §6.4, §9.2, §9.3
**Rules:** every query org-scoped; reads use the anon client (RLS); privileged writes use the service-role client and **re-check `org_id` from the session**; every handler returns the typed envelope `{ ok:true, data } | { ok:false, error }`; every body validated by a shared Zod schema (also used client-side).

## Supabase clients (`lib/supabase/`)
- `client.ts` — browser client, anon key, RLS-enforced (used by TanStack Query + Realtime).
- `server.ts` — `createServerClient` (SSR cookies) for session reads + a service-role client factory for privileged writes. Service-role key is server-only (never shipped to browser).
- `demo.ts` — when auth env is absent, resolves `NEXT_PUBLIC_DEMO_ORG_SLUG` and returns seeded Acme data read-only (demo-stability, ED §5/§15).

## Session / authz helper
`getSessionOrg()` → `{ userId, orgId }` from the SSR session; 401 if none. Every handler calls it first; service-role writes set/verify `org_id = session.orgId`.

## Endpoints (ED §9.2)

| Method · Path | Purpose | Request | Response `data` | Errors |
|---|---|---|---|---|
| `GET /api/conversations` | Inbox list (realtime-backed) | `?status&cursor` | `[{id, customer:{name,phone}, last_intent, status, updated_at}]` | 401 |
| `GET /api/conversations/[id]` | Thread | — | `{messages:[{role,content,intent,reasoning,citation,tool_calls,created_at}]}` | 401, 404 if not in org |
| `GET /api/appointments` | Jobs list | `?status&range` | `[{id, service, tech, scheduled_at, arrival_window, status, price, confirmed}]` | 401 |
| `GET /api/leads` | Follow-up queue | `?status` | `[{id, customer, reason, requested_service, detail, status, created_at}]` | 401 |
| `PATCH /api/leads/[id]` | Work a lead | `{status}` (LeadPatchSchema) | `{ok:true}` | 401, 404, 422 |
| `GET /api/notifications` | Owner/tech alerts | `?read` | `[{id, kind, ref_id, read, created_at}]` | 401 |
| `PATCH /api/notifications/[id]` | Mark read | `{read:true}` | `{ok:true}` | 401 |
| `GET /api/analytics/conversion` | Funnel + revenue | `?range` | `{inbound, booked, closed_won, conversion_rate, revenue, captured_opportunity_value}` | 401 |
| `GET /api/profile` | Load all policy config | — | `{profile, areas[], services[], pricing[], hours[], technicians[], emergency_rules[]}` | 401 |
| `PUT /api/profile/[panel]` | Save a policy panel | per-panel Zod | `{ok:true}` | 401, 422 |

> There is no eval-export route in the dashboard API. Eval export is a builder-side DB pull run outside `apps/customer-app` (see `eval-pipeline.md`).

`[panel]` ∈ `identity | areas | services | pricing | hours | team | emergency` (Flow H). Profile writes use the service-role client, re-checking `org_id`.

## Zod schemas (`lib/schemas/`) — shared client+server
- `ProfileIdentitySchema` = `{ legal_name, trade, base_zip, customer_types: string[], about, ai_disclosure_text, spanish_enabled: boolean }`
- `ServiceAreaSchema` = `{ region, zips: string[], mode: 'serve'|'deny' }` (panel = array)
- `ServiceSchema` = `{ name, category, offered: boolean, description?, notes? }`
- `ServicePricingSchema` = `{ service_id, price_min:number, price_max:number, unit:'flat'|'hourly'|'starting_at', notes? }` (refine `price_max >= price_min`)
- `BusinessHoursSchema` = `{ day_of_week:0..6, open_time?:string, close_time?:string }` + `closed_dates: string[]`
- `TechnicianSchema` = `{ name, skills:string[], status:'available'|'sick'|'vacation'|'off', status_until?:string }`
- `EmergencyRuleSchema` = `{ keyword_or_pattern, severity:'emergency'|'urgent', action:'escalate_oncall'|'advise_911'|'same_day_priority', guidance_text? }`
- `LeadPatchSchema` = `{ status:'open'|'contacted'|'converted'|'dismissed' }`
- `ConversionQuerySchema` = `{ range?: '7d'|'30d'|'90d'|'all' }`

## Analytics calc (`lib/analytics/conversion.ts`) — ED §5, §9.2
Within `range`:
- `inbound` = count of conversations with ≥1 user message (exclude `status='spam'`).
- `booked` = count of appointments with status in (`booked`,`completed`,`closed_won`).
- `closed_won` = count of appointments with `status='closed_won'`.
- `conversion_rate` = `booked / inbound`.
- `revenue` = sum(`price`) where `status='closed_won'`.
- `captured_opportunity_value` (North Star) = sum(`price`) across booked+closed_won jobs that originated from an inbound conversation (`source_conversation_id` not null) — the dollar value captured that would otherwise have been missed.

## Error envelope
`{ ok:false, error:{ code:'unauthorized'|'not_found'|'validation'|'server', message } }`. Never leak service-role key or internal detail (ED §6.4).
