# Implementation Specs — Handled Customer Experience (`customer-app`)

**App:** `customer-app` (`apps/customer-app` dashboard · `supabase/` data model · `n8n/` agentic workflow)
**Stage:** 2 of 7 (Implementation Specs)
**Source of truth:** `docs/customer-app/engineering/engineering-doc.md` (approved Stage 1 HLD, **Netlify** deploy), `docs/PRD.md`, `notepad.md` ("Handled customer experience", "Example Customer", "Evaluations"), `docs/design.md`, `docs/Competitive Research.md`, `docs/evals.xlsx` (50 cases)
**Status:** Ready for Stage 3 once approved
**Scope:** text/SMS channel only (voice is a documented future seam, per the ED channel note). Covers the dashboard, Supabase data model, and the n8n multi-agent workflow — and fixes the n8n webhook contract the Test Harness (separate run) will consume. Excludes the marketing website and the Test Harness UI.

> These specs are granular and runnable. A developer can build the schema, the n8n workflow (incl. ready-to-paste agent prompts), the tool layer, and the dashboard from these files without re-deriving decisions.

---

## How to read these specs
1. **Supabase first:** run `supabase-schema.sql` in the SQL Editor (`database.md` explains it), then seed per `seed-data.md`.
2. **n8n backend:** `n8n-webhook-contract.md` (I/O) → `n8n-workflow.md` (topology/nodes) → `n8n-tools.md` (tool layer) → `n8n-agent-prompts.md` (paste the 8 prompts).
3. **Dashboard:** `project-setup.md` → `design-system-setup.md` → `auth-and-middleware.md` → `dashboard-api.md` → `dashboard-pages.md`.
4. **Eval:** `eval-pipeline.md` (offline 50-case eval + builder-side Azure Foundry export — a direct DB pull run outside the customer app).
5. **Tests:** `testing.md`.
6. Copy `.env.example` into the right places (dashboard `.env.local` / Netlify, n8n instance, Azure).

## Spec file index
| File | Specifies |
|---|---|
| `supabase-schema.sql` | Paste-and-run schema: 17 tables, enums(CHECK), FKs, indexes, `updated_at` triggers, RLS on every table, realtime publication |
| `database.md` | Table-by-table purpose, RLS strategy, indexes, relationships (companion to the SQL) |
| `seed-data.md` | Acme profile + serve/deny areas + offered/won't-provide services + researched pricing + 6 techs(1 sick,1 vacation) + hours + emergency rules + 30 end-customers w/ message logs (eval fields), appointments, prices across eval types |
| `n8n-webhook-contract.md` | The single webhook: auth, request/response schema, variants, errors, idempotency, latency — the contract the Test Harness reuses |
| `n8n-workflow.md` | Topology + node-by-node (webhook→validate→context loader→guard→router→6 specialists→tools→persist→respond→fallback), models/temps, cost/latency |
| `n8n-tools.md` | The org-scoped tool layer: each tool's I/O schema, Supabase op, guardrails, tool→agent matrix, FSM-adapter seam |
| `n8n-agent-prompts.md` | **Ready-to-paste prompts:** shared guardrail preamble + spam/injection guard + intent router + 6 Sonnet specialists + fallback template |
| `project-setup.md` | Next.js 14 scaffold, deps, scripts, folder structure, Netlify deploy |
| `design-system-setup.md` | allNeurons tokens → CSS vars → Tailwind, typography, state colors, UI primitives, dataviz palette |
| `auth-and-middleware.md` | Supabase Auth, SSR session, middleware route protection, demo-stable read-only mode |
| `dashboard-api.md` | Route Handlers + shared Zod schemas, analytics calc, error envelope, service-role write rules |
| `dashboard-pages.md` | Pages (overview/inbox/appointments/leads/analytics/profile editor), components, state mgmt, UX states |
| `eval-pipeline.md` | Stored eval fields, **builder-side** Azure Foundry JSONL export (direct DB pull, outside the customer app), offline 50-case harness, HHH launch gates |
| `testing.md` | Unit/integration(real DB)/E2E + agent eval |
| `.env.example` | Every env var across dashboard + n8n + Supabase + Azure (server-only marked) |

---

## Requirements traceability matrix
`ED`=engineering doc, `NP`=notepad, `PRD`=PRD, `EV`=evals.xlsx. Every requirement → spec.

### notepad "Handled customer experience" (CE)
| ID | Requirement | Covered by |
|---|---|---|
| CE1 | Supabase + n8n backend | `supabase-schema.sql`, `n8n-workflow.md` |
| CE2 | Customer profiles | `seed-data.md`, `database.md` |
| CE3 | Conversation memory for eval | `database.md` (messages), `eval-pipeline.md` |
| CE4 | n8n webhook entry point returning a response | `n8n-webhook-contract.md` |
| CE5 | Multi-agent flow w/ intent router | `n8n-workflow.md`, `n8n-agent-prompts.md` |
| CE6 | A prompt for each agent | `n8n-agent-prompts.md` (8 prompts) |
| CE7 | Dashboard | `dashboard-pages.md` |
| CE8 | Incoming messages + responses | `dashboard-pages.md` (inbox) |
| CE9 | Inbound→closed conversion + price each | `dashboard-api.md` (analytics), `dashboard-pages.md`, `seed-data.md` |
| CE10 | Self-service profile & policy setup | `dashboard-pages.md` (profile editor), `dashboard-api.md` |

### notepad "Example Customer" (EC)
| ID | Requirement | Covered by |
|---|---|---|
| EC1 | Acme profile | `seed-data.md` §01 |
| EC2 | Serve/deny areas | `seed-data.md`, `supabase-schema.sql` (service_areas) |
| EC3 | 5+owner, sick/vacation | `seed-data.md` §03 (technicians) |
| EC4 | Customer types | `seed-data.md` (customer_types[]) |
| EC5/6/7 | Core / won't-service / won't-provide | `seed-data.md` §01 (services offered/not-offered) |
| EC8 | Phone=ID, name/address stored | `supabase-schema.sql` (end_customers unique(org,phone)) |
| EC9 | Context to agent: phone/name/address/history/prior jobs+prices | `n8n-workflow.md` (context bundle) |
| EC10 | Pricing research | `seed-data.md` §02 (researched ranges) |
| EC11 | 30-customer backfill w/ logs/appointments/prices | `seed-data.md` §04–06 |
| EC12 | Interaction variety from evals.xlsx | `seed-data.md` roster + `eval-pipeline.md` |

### notepad "Evaluations" (EV)
| ID | Requirement | Covered by |
|---|---|---|
| EV1 | Text-only | ED channel note; `eval-pipeline.md` |
| EV2 | Stored → Azure export (builder-side DB pull, not a dashboard feature) | `eval-pipeline.md` |
| EV3 | question/response/citation/reasoning | `supabase-schema.sql` (messages), `n8n-agent-prompts.md` output, `eval-pipeline.md` |

### evals.xlsx — all 50 cases
Every case H-01…H-18, Ho-01…Ho-13, Ha-01…Ha-19 (and the E-00 example) is mapped to an agent + tool + pass criterion in **`eval-pipeline.md` §3** and realized by `n8n-agent-prompts.md` + `n8n-tools.md`. Critical cases (Ho-02, Ho-03, Ha-01/02/03/09/11/12/13/14/17/18) and the emergency-recall-100% gate are called out there.

### PRD
| Area | Covered by |
|---|---|
| User flows A–D (as text) | `n8n-workflow.md`, `n8n-agent-prompts.md` |
| AI-drawback handling (hallucination/explainability/wrong-action) | `n8n-agent-prompts.md` (grounding, read-back), `dashboard-pages.md` (reasoning/citation popover), `n8n-tools.md` (confirmed_readback) |
| Functional reqs (answer 24/7, natural booking, spam filter, area/service validation, SMS confirm, emergency triage+configurable rules, instant text-back, review/correct, warm transfer/escalate, fast setup) | `n8n-*`, `dashboard-pages.md` (profile editor = fast setup; inbox = review) |
| Model Requirements (Haiku classify + Sonnet dialog, 32K ctx, EN/ES) | `n8n-workflow.md`, `.env.example` |
| Eval strategy + HHH + launch gates | `eval-pipeline.md`, `testing.md` |
| Data requirements (conversation memory, KB/config as RAG) | `database.md`, `n8n-workflow.md` (context bundle) |
| Prompt strategy (system/role, tool-use, few-shot, internal CoT, confirmation) | `n8n-agent-prompts.md` |
| Responsible-AI (accountability/transparency/fairness/reliability, PII, disclosure, retention, isolation) | `n8n-agent-prompts.md` (guardrails), `database.md` (RLS), `auth-and-middleware.md`, `n8n-workflow.md` (fallback) |
| Guardrails (emergency recall, misbooking, hallucination) | `eval-pipeline.md`, `n8n-tools.md`, `n8n-agent-prompts.md` |
| North-Star Captured Opportunity Value + conversion | `dashboard-api.md` (analytics calc), `dashboard-pages.md` |

### design.md & Competitive Research
| Area | Covered by |
|---|---|
| allNeurons tokens applied to dashboard | `design-system-setup.md`, `dashboard-pages.md` |
| Workflow-depth/trust framing | scope reflected in `dashboard-pages.md` (leads/escalations/analytics) |

---

## Resolved decisions (consistent with ED)
- Specs live under `docs/customer-app/implementation/` (app-scoped, matching the website precedent — NOT the skill's default `docs/specs/`).
- Deployment is **Netlify** for the dashboard (ED §15, Appendix A#6).
- Text-only channel; phone = end-customer ID; FSM simulated in Supabase behind an adapter seam.
- LLM = Anthropic Claude: Haiku (guard+router), Sonnet (6 specialists).
- Service-role (n8n + Route Handlers) bypasses RLS; org scoping enforced in the tool/handler layer.
