---
name: website-review-log
description: Round-by-round review verdicts and raised gaps for the Handled marketing website (app "website") implementation specs
metadata:
  type: project
---

# Website implementation-spec review log

App: `website` — specs under `docs/website/implementation/` (18 files + R1–R40 matrix).
Sources: `docs/PRD.md` (website-relevant subset), `docs/website/engineering/engineering-doc.md` (primary), `notepad.md`, `docs/design.md`.
Invocation: direct user audit (report to user, not planner).

## Round 1 — 2026-10-07 — ❌ NEEDS REVISION
All 40 requirement IDs covered; 9-page set, lead-capture contract, Zod/honeypot/min-fill/rate-limit, graceful no-op, supabase-schema.sql (leads + index + RLS service-role-only), pricing anchoring, and design-token usage all verified PASS.

Single gap raised:
1. `.env.example` documents `NEXT_PUBLIC_SITE_URL` claiming it sets "correct canonical/OG/sitemap URLs in non-prod", but `content/site.ts` (content-modules.md §1) hardcodes `url: "https://handled.ai"` and `lib/seo.ts` reads `site.url` directly — nothing reads the env var. Also contradicts ED §12 ("Public env vars: none required in MVP"). Fix: either wire `content/site.ts` to `process.env.NEXT_PUBLIC_SITE_URL ?? "https://handled.ai"` (and have sitemap/robots/seo use it), OR remove the NEXT_PUBLIC_SITE_URL block from `.env.example`.

**How to apply:** On re-review, confirm this specific inconsistency is resolved one of the two ways above before approving.

## Round 2 — 2026-10-07 — 👍 😊 APPROVED
R1 gap resolved via option (b): the `NEXT_PUBLIC_SITE_URL` block was removed from `.env.example`. File now states there are NO `NEXT_PUBLIC_*` vars in MVP and names `site.url` in `content/site.ts` (default `https://handled.ai`) as the single hardcoded base URL. Verified: `grep NEXT_PUBLIC_SITE_URL` returns zero hits across `docs/website/`; remaining `NEXT_PUBLIC` mentions all correctly say "none required"/"browser never touches Supabase"; `content/site.ts` (content-modules.md §1) hardcodes `url`; `seo.ts`/sitemap/robots (seo.md) all read `site.url`. Consistent with ED §6, §12. Zero remaining gaps across all 40 requirement IDs.
