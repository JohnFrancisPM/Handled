---
name: project-handled
description: What the Handled project is, its three apps, the fixed stack, and the stage workflow
metadata:
  type: project
---

Handled is John Francis's capstone project (Maven "Master Agentic AI for PMs and FDEs"). It is an **AI office manager for home & local service businesses** (plumbing, HVAC, electrical, etc.) — answers calls, books jobs into the owner's FSM (Jobber/Housecall Pro/ServiceTitan), triages emergencies, texts back missed callers, follows up.

**Three separate web apps** (each planned independently under `docs/[AppName]/engineering/`):
- `website` — public marketing/company site
- `customer-app` — customer experience (Next.js frontend + n8n agentic backend + Supabase)
- `test-harness` — standalone SMS-style tester to impersonate users and see AI responses

**Fixed stack:** Next.js 14 (App Router), Supabase, design system in `docs/design.md` (allNeurons — Inter Display, brand blue #115ACB, 4px spacing grid). Deploy on Vercel.

**Workflow:** 7 stages (Engineering Plan → Implementation Specs → Frontend Setup → Feature Impl → Testing → Deploy → Security). Gated on explicit user approval between stages. Engineering-planner only produces Stage 1 artifact and stops.

**Key source docs:** `docs/PRD.md` (voice-first product, but evals pivot to text-only for this exercise), `notepad.md` (authoritative per-app scope), `docs/Competitive Research.md` (reception.ai = ElevenLabs; wedge is workflow depth + trust/transparency, NOT voice quality).

**Why:** This is a graded portfolio project ending in a 3-minute recorded demo showing the website, customer experience, n8n architecture, test harness, and Azure Foundry eval export.
**How to apply:** Keep each app's engineering doc scoped to that app only. The website has NO AI features — all AI lives in customer-app/n8n.
