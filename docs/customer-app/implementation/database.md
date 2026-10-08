# Database — tables, RLS, relationships (companion to supabase-schema.sql)

**Sub-system:** Supabase
**Source:** engineering-doc §7
**This narrative explains the runnable `supabase-schema.sql`.** The SQL is authoritative; this maps each table to its purpose and requirement.

## Conventions
Every table: `id uuid default gen_random_uuid()`, `created_at timestamptz default now()`, `updated_at timestamptz` (except append-only `messages`, `eval_exports`). Every org-owned table carries `org_id` FK → `organizations` and is RLS-protected. Enums expressed as `CHECK` constraints (match ED exactly).

## Tables (17)
| Table | Purpose | Key fields / notes | Requirement |
|---|---|---|---|
| organizations | a Handled customer (business) | name, slug | CE1 |
| dashboard_users | auth users (id=auth.uid) | org_id, role(owner/admin) | personas |
| business_profiles | 1:1 business identity + policy flags | customer_types[], ai_disclosure_text, spanish_enabled | EC1/EC4, Ha-07, H-13 |
| service_areas | serve/deny regions | region, zips[], mode(serve/deny) | EC2, Ha-04 |
| services | offered + won't-provide | offered bool, category | EC5/6/7, Ha-05 |
| service_pricing | configured ranges | price_min/max, unit | EC10, Ho-01/02 |
| business_hours | weekly hours + closed dates | day_of_week, open/close, closed_dates[] | Ho-13 |
| technicians | 5 + owner, availability | status(available/sick/vacation/off), skills[] | EC3, H-08 |
| emergency_rules | owner-configurable triage | keyword, severity, action, guidance | PRD safety, Ha-01.. |
| end_customers | phone = ID | unique(org,phone), opted_out | EC8, Ha-15 |
| conversations | thread per customer | status, last_intent | CE8 |
| messages | memory + eval fields | question/response/citation/reasoning, tool_calls jsonb | CE3, EV3 |
| appointments | simulated FSM jobs | status, price, recurrence, waitlist, confirmed, notes, source_conversation_id | CE9, EC11, H-09/14/16/17 |
| leads | AI couldn't close | reason enum, media_url | Ho-02, Ha-04, H-09/12/18, Ho-07 |
| escalations | emergency/human-transfer | type, severity, target | Ha-01/02/03/08/10/11/17/18, H-05 |
| notifications | owner/tech alerts | kind, ref_id, read | H-02, PRD notify |
| eval_exports | export audit | row_count, format, created_by | EV2 |

## RLS strategy (ED §7.15)
- RLS enabled on EVERY table.
- `public.current_org_id()` (SECURITY DEFINER) resolves the caller's org from `dashboard_users`.
- **Config tables** (business_profiles, service_areas, services, service_pricing, business_hours, technicians, emergency_rules): authenticated full CRUD scoped to own org (owner self-serves).
- **Operational tables** (end_customers, conversations, messages, appointments, escalations): authenticated SELECT only — written by n8n with the service-role key.
- **leads, notifications:** authenticated SELECT + UPDATE (owner works the queue / marks read); created by n8n.
- **eval_exports:** authenticated SELECT + INSERT.
- **n8n & Route-Handler service-role** bypasses RLS; org scoping enforced in the tool layer / handlers (never a client-supplied org_id).
- End-customers never authenticate — they reach data only through parameterized, org-scoped webhook tools.

## Indexes (perf-critical paths)
`service_areas(org_id,mode)`, `services(org_id,offered)`/`(org_id,category)`, `end_customers(org_id,phone)` unique, `messages(conversation_id,created_at)`/`(org_id,role)`, `appointments(org_id,status)`/`(org_id,scheduled_at)`, plus org indexes on leads/escalations/notifications.

## Triggers
`set_updated_at()` BEFORE UPDATE on every table with `updated_at`.

## Realtime
`conversations`, `messages`, `appointments` added to the `supabase_realtime` publication for the live inbox.

## Retention & lifecycle (ED §6.5, Appendix A#10; PRD §8 Responsible-AI)
Conversation memory (`messages`, `conversations`) is retained for eval, with per-org isolation (RLS) and no cross-customer sharing. A configurable retention window + a deletion path are a documented **surface** here; the full controls (retention policy, deletion job, encryption-at-rest posture) are implemented in **Stage 7 (`security-foundation`)**, per the ED. Opt-out (`end_customers.opted_out`) suppresses future contact now (eval Ha-15).
