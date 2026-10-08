---
name: review-test-harness
description: Round-by-round verdicts and issues for the test-harness engineering doc review
metadata:
  type: project
---

# test-harness engineering-doc review log

Doc: `docs/test-harness/engineering/engineering-doc.md`
Primary requirements source: `notepad.md` §"Test Harness" (lines 94–99), §"Evaluations", demo goals (12–18) — NOT docs/PRD.md (PRD is product/brand context only).
Fixed contract it calls: `docs/customer-app/implementation/n8n-webhook-contract.md` (request: business_id, from_phone, text, channel, customer_name, message_id, optional media_url; 200 response returns reply/intent/agent/actions directly; harness named as intended caller).
Data source: seed SQL `supabase/seed/04_end_customers_30.sql` (30 customers; #23 null name/addr, #24 "Spam Source", #25 "Robo Caller"), `05_conversations_messages.sql` (messages cols: role, content, question, response, citation, reasoning, intent, agent, tool_calls, created_at; conversation last_intent values: book/reschedule/cancel/pricing/emergency/out_of_area/not_offered/spam/multi/injection/status), `06_appointments.sql`.
Batch variety: `apps/customer-app/tests/eval/eval-cases.json` = 50 cases (H-01..18, Ho-01..13, Ha-01..19).
Fixed user decisions: (1) no live Supabase/no coupling; (2) data = seed SQL via one-time build → committed JSON fixture (not live DB read); (3) live AI from webhook reply body, unique from_phone/customer, business_id=acme slug, no DB write-back/polling.

## Round 1 — 2026-10-08 — 👍 😊 APPROVED
Independently re-extracted all requirements from notepad §Test Harness/§Evaluations/demo goals, the webhook contract, the seed files (verified 30 customers + message/conversation schema + 50 eval cases), design.md ("allNeurons" is the real design-system name — doc's reference is correct, not a hallucination).
- All notepad TH requirements covered: impersonate/switch 30 customers (§2 F2, §4.1), view chat history (§4.2, §7.3), send-as-customer → webhook → render reply w/ intent/agent/actions (§4.3, §8.2–8.3, §9.1), SMS look (§5.2), use 30 backfilled customers (§7), one-button batch covering evals.xlsx variety + more (§4.4, §7.5, §8.4), demo goal "send a few prompts" (§1).
- **§8.4 batch mapping verified case-by-case against eval-cases.json: all 50 cases present with CORRECT category labels** (H-01..18, Ho-01..13, Ha-01..19). The recurring eval-mislabel issue class seen on the customer-app does NOT occur here. H-05=human/warm-transfer and H-06=multi-intent correctly labeled.
- Fixture provenance (§7.3) matches seed exactly (messages/conversations columns, #23/#24/#25 edge cases, intent vocabulary). Relative-date normalization handled (§7.4). Extraction = builder-side scripts/build-harness-fixture.ts using pgsql-ast-parser → committed apps/test-harness/fixtures/customers.json (decision #2 honored).
- Decisions #1/#2/#3 honored, not violated: §6.3 mermaid explicitly has NO Supabase/customer-app arrow; webhook reply is sole live source; unique from_phone; business_id from env ACME_BUSINESS_ID (not hardcoded); no write-back/polling.
- Contract fields used exactly (§8.2); media_url out of scope per contract; response variants (spam null reply, injection, emergency, opt-out, fallback 200) handled (§8.3).
- Stack/placement: Next.js 14 App Router + TS strict + @/ alias (§5.1), design tokens only (§5.1/§12), own apps/test-harness folder + own netlify.toml + own Netlify site + local-CLI deploy, NOT MCP connector (§11/§15), env-driven config secrets server-only/no NEXT_PUBLIC_ on secret (§6.1/§12/§16), Node 20 (§5.1/§15).
- Stage-6 prerequisite explicitly noted (§15.1): n8n workflow must be imported + Active (+ schema migrated/seeded) before live test; until then stubbed webhooks / OFFLINE_MOCK.
- Graceful degradation thorough (§4.5, §6.2, SC-4, F7, §16).

Non-blocking polish notes (NOT gaps, did not block approval): (a) batch has 50+ scenarios but only 30 seeded customers, so some from_phone reuse across scenarios is unavoidable; distinct per-scenario message_id (§9.2) prevents false idempotency dedupe, but concurrent same-phone sends could interleave n8n conversation context — a runtime nuance outside the harness's control, worth a Stage-2 note. (b) SC-2 "within the latency budget" is slightly vague vs contract's <3s typical.
