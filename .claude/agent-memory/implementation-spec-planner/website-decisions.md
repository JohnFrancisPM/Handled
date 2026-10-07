---
name: website-decisions
description: Key Stage-2 implementation-spec decisions for apps/website (Handled marketing site) and their rationale
metadata:
  type: project
---

Stage-2 implementation specs for the Handled marketing website live in `docs/website/implementation/` (app-scoped, NOT the skill's default `docs/specs/`). 18 deliverables incl. `supabase-schema.sql` and `.env.example`.

**Why:** Handled is a monorepo of 3 apps (website, customer-app, test-harness); specs are namespaced per app under `docs/[AppName]/implementation/` to match the engineering-doc location `docs/[AppName]/engineering/`.

**How to apply:** For future website spec work, keep the same file set and the traceability matrix in `README.md` (R1–R40). Reuse these resolved decisions so specs stay consistent with the approved ED:

- Spec set derived from ED §14 "Specs → Implementation Mapping", expanded with `project-setup.md`, `content-modules.md`, `components.md`, `testing.md`.
- All marketing copy/data is verbatim in typed `content/*.ts` modules (ED §5 requires it) — pages are declarative, invent nothing at build time.
- Pricing: Starter $149 / **Pro $299 (most-popular, premium, anchored to competitor band)** / Scale $599. Competitor anchors = reception.ai Premium $199, Smith.ai Starter $300 (from Competitive Research §3). Pro CTA href `/contact?plan=pro`.
- Messaging rule: never claim superior voice quality (incumbent ElevenLabs owns it); lead on workflow depth + trust/billing transparency.
- The one dynamic feature (`/api/leads`) must **gracefully no-op** when Supabase env is absent (`{ok:true, stored:false}`) — this is the demo-stability guarantee; it has a mandatory integration test.
- Shared Zod schema `lib/validation/lead.ts` used by both client form and server route.
- `Container` lives in `components/ui/` (not duplicated in layout); `Section` in `components/layout/`.
- English-only MVP; Spanish is a labeled roadmap feature. `next-intl` NOT installed.
- No analytics / no third-party pixels (ED App.A.5).
