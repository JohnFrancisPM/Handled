---
name: decisions-customer-app
description: Architectural decisions for the Handled customer-app engineering doc (dashboard + Supabase + n8n multi-agent)
metadata:
  type: project
---

Decisions locked for `docs/customer-app/engineering/engineering-doc.md` (keep consistent in future revisions):

1. **Three sub-systems in one app:** `apps/customer-app` (Next.js 14 dashboard), `supabase/` (Postgres + RLS), `n8n/` (agentic webhook). All planned in one engineering doc.
2. **Channel = SMS-style TEXT only** (per notepad Evaluations: "focus on text inputs only"). No voice/telephony in this build. Phone # is the end-customer ID.
3. **n8n webhook is the single entry point** — `POST /webhook/handled/message` in → `{reply, ...}` out. The Test Harness (separate app) calls this SAME contract. Doc defines the contract precisely; does NOT design the harness.
4. **Multi-agent topology:** Haiku intent router + spam/injection guard → specialist sub-agents (New Booking, Reschedule/Cancel, Emergency Triage, Pricing/Quote, Out-of-Area, General FAQ) on Claude Sonnet → shared tool layer (Supabase reads/writes) → persistence + eval-field extractor. Prompts themselves are an impl-stage artifact; doc enumerates each agent (responsibility, inputs, outputs, tools).
5. **LLM provider = Anthropic Claude** per PRD Model Requirements: Sonnet-class for dialog/decision, Haiku-class for intent/spam classification. Called from n8n.
6. **Eval pipeline:** every AI turn stored in Supabase `messages` with eval fields `question, response, citation, reasoning`. Export job produces Azure AI Foundry-compatible dataset (JSONL). This is the graded demo's eval step.
7. **FSM is simulated in Supabase for this build.** No real Jobber/Housecall Pro/ServiceTitan API. "Availability/booking" = rows in `appointments` + `technicians` tables. Keeps the capstone self-contained; doc notes the real-FSM adapter as a future seam.
8. **Seed data:** Acme Plumbing profile (Queens 11375, full service/area/pricing config) + 30 end-customers with chat logs, appointments, prices, spanning eval-xlsx interaction types (booking, reschedule, cancel, quote, emergency, out-of-area, service-not-offered, spam, Spanish, multi-intent, etc.).
9. **Dashboard auth:** Supabase Auth (email/password), one Handled-customer org = Acme for the demo; multi-tenant-ready schema (org_id FK + RLS). Demo-stable: read-only fallback if auth env missing.
10. **Design system:** allNeurons tokens from docs/design.md (Inter Display, brand blue #115ACB, 4px grid, data-dense). Dashboard is information-forward.

**Why:** Resolves notepad customer-experience scope + PRD requirements with the fixed stack, pivoting the voice-first PRD to text-only per the Evaluations note.
**How to apply:** Preserve these on revision; flag conflicts rather than silently diverging. See [[decisions-website]] for sibling app, [[project-handled]] for overall project.
