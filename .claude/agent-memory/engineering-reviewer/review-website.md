---
name: review-website
description: Review log for the Handled `website` (public marketing site) engineering doc — verdicts, rounds, issues
metadata:
  type: project
---

# Website engineering-doc reviews

Doc under review: `docs/website/engineering/engineering-doc.md`
Sources: `docs/PRD.md`, `notepad.md` ("Handled company website" lines 20-24, authoritative), `docs/Competitive Research.md`, `docs/design.md`
Scope: public marketing website ONLY — no AI/voice/telephony (those live in customer-app / n8n). Absence of AI architecture is NOT a gap.

## Round 1 — 2026-10-07 — Verdict: APPROVED

Extracted 14 website requirements; all passed present/unambiguous/correct/consistent/technically-addressed:
- WR1 IA based on competitor sites (doc §2), WR2 fill content via typed content/*.ts modules,
- WR3 competitor pricing anchored in premium tier (Pro $299 ≈ Smith.ai Starter $300 / reception.ai Premium $199; Appendix A.1),
- WR4 differentiator page w/ workflow depth umbrella + FSM/office-manager/emergency-triage + trust-pricing (§10 feat 4),
- WR5 positioning line, WR6 personas, WR7 4 MOATs, WR8 pricing tiers $149/$299/$599,
- WR9 trust/transparency, WR10 full feature set (24/7, FSM booking, service-area, SMS, text-back, triage, spam, transcripts, follow-up roadmap, Spanish roadmap),
- WR11 stats band (27/52/62/85/$1200), WR12 self-serve "live in minutes", WR13 design.md tokens correct (brand #115ACB, grey scale, type roles, 4px spacing, radius, state colors), WR14 competitive messaging (avoid voice-quality wedge, lead on workflow depth + billing transparency).

Noteworthy strengths: demo-stability via graceful no-op lead form; single-table `leads` schema w/ RLS enabled + service-role-only; shared Zod schema client+server; content isolated in typed modules.

Notes on interpretive calls that are acceptable (do not re-flag unless doc changes): (a) "premium tier" read as premium-positioned Pro tier, documented in Appendix A.1; (b) Spanish website localization deferred to Phase 2 while product is bilingual — explicitly flagged Appendix A.4.
