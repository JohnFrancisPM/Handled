---
name: decisions-website
description: Architectural decisions made for the Handled marketing website engineering doc
metadata:
  type: project
---

Decisions locked for `docs/website/engineering/engineering-doc.md` (keep consistent in future revisions):

1. **9-page set:** Home, Why Handled (differentiator), Features, Pricing, Integrations, How it works, Contact/Book-a-demo, Privacy, Terms.
2. **Static-first:** all content pages are RSC/SSG. Exactly ONE dynamic endpoint: `POST /api/leads` (Node runtime, Vercel).
3. **One DB table:** `leads` (demo requests, PII) in shared Supabase, RLS enabled with NO anon policies — service-role server-only insert. Browser never touches Supabase.
4. **Demo-stability mechanism:** `/api/leads` gracefully no-ops (returns `{ok:true, stored:false}`) when Supabase env absent, so the recorded 3-min demo can't fail. This is covered by a guardrail integration test.
5. **Pricing anchoring:** 3 tiers Starter $149 / Pro $299 (most-popular, premium) / Scale $599. Pro is deliberately anchored to the premium competitor band (reception.ai Premium $199, Smith.ai Starter $300) with a comparison table showing Handled does more. ROI line: "one captured ~$1,200 job pays for months."
6. **Messaging wedge:** workflow depth + trust/transparency — NOT voice quality (closed wedge owned by ElevenLabs/reception.ai per competitive research).
7. **No AI on the website.** Section 8 (AI Architecture) intentionally N/A.
8. **English-only MVP;** Spanish deferred to Phase 2 (`next-intl` room left), even though product targets bilingual.
9. **Content-as-code:** all copy/stats/pricing/FAQ in typed `content/*.ts` modules.
10. **IA modeled on competitor marketing sites** (notepad W1): hero → stat band → features → integrations → how-it-works → pricing+comparison → why-us → demo CTA.

**Why:** These resolve the PRD/notepad website requirements with sensible defaults consistent with the fixed stack.
**How to apply:** If revising the website doc, preserve these unless the user changes them. Flag conflicts rather than silently diverging.
