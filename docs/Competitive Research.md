# Reception.ai Competitive Research

**Date:** 2026-10-07 (v2, expanded for PRD input)
**Prepared by:** Claude (market-research skill + four parallel research agents)
**Purpose:** Competitive-landscape input for John's portfolio Agentic AI PRD (Maven course).

**Major update since v1 (2026-10-06):** reception.ai is now confirmed as a **product built and launched by ElevenLabs**, not an independent startup. v1 could not reach the site (HTTP 403) and inferred everything about it; the 403 is explained by the site sitting behind ElevenLabs infrastructure. The real documentation is public at `elevenlabs.io/docs/reception-ai`, so reception.ai's own pricing, features, and positioning are now confirmed from source. Pricing for several competitors (Smith.ai especially) was also wrong in v1 and is corrected here.

---

## Bottom Line (read this first)

**reception.ai is not a startup you're competing against. It's ElevenLabs.** This is the single most important finding, and it was not obvious: the site 403s, it carries its own branding, and it took cross-referencing ElevenLabs' own docs to confirm. It reframes the entire competitive picture.

Three consequences for the PRD:

1. **The subject competitor has the deepest pockets in the category** (a $3.3B-plus parent, ~$500M-scale ARR). Treat it as a resource-heavy incumbent that moved down-market, not a scrappy peer.
2. **Voice quality is a closed wedge.** ElevenLabs' whole pitch is natural voice, built on the best TTS in the market. Competing there is a losing bet.
3. **The open lanes are trust/billing transparency (the #1 customer complaint across rivals), a HIPAA vertical (reception.ai has none), and live-human fallback (reception.ai lacks it).** Build the PRD's differentiation on one of these, not on being a cheaper or better-sounding receptionist.

---

## 1. Subject Profile: reception.ai (ElevenLabs Reception)

**What it is:** An AI phone receptionist for small and medium businesses, launched by ElevenLabs on **September 16, 2026**. Built on ElevenLabs' voice-agent stack. Headline on the marketing page: "AI receptionists that answer every call."

**Who's behind it:** ElevenLabs (founded 2022). Well-capitalized: a confirmed Series C of $180M at a $3.3B valuation (Jan 2025, co-led by a16z and ICONIQ), with a later round reportedly lifting it toward ~$11B in early 2026 (sources vary on the latest round; the $3.3B Series C is the firmest confirmed figure). Founders Mati Staniszewski (CEO, ex-Palantir) and Piotr Dąbkowski (ex-Google ML). Distributed company, hubs in New York, London, Warsaw. Reception-specific revenue and headcount are not broken out, since it's a product line inside ElevenLabs.

**Positioning:** Horizontal SMB, marketed by vertical. Named targets: legal and professional services, real estate and property management, home services and contracting (plumbing, electrical, HVAC), personal care and wellness (salons, studios), hotels and restaurants. The core pitch is **voice naturalness** ("sounds like a real person, not a phone tree"), powered by ElevenLabs TTS, plus self-serve setup in under five minutes (a website scan extracts services, pricing, hours).

**Pricing (confirmed, ElevenLabs official docs):**

| Tier | Monthly | Annual (effective/mo) | Credits/mo | Phone #s | Locations | Concurrent calls |
|---|---|---|---|---|---|---|
| Free Trial | $0 (14 days) | — | 30 | 1 | 20 | 20 |
| Basic | $29 | ~$24 ($288/yr) | 75 | 1 | 1 | 1 |
| Plus | $79 | ~$66 ($792/yr) | 275 | 3 | 1 | 3 |
| Premium | $199 | ~$166 ($1,992/yr) | 1,000 | 5 | 20 | 10 |

Credit model: inbound phone call = 1.0 credit/min; web widget or booking-page chat = 0.5 credit/min. Overage per credit: Basic $0.45, Plus $0.38, Premium $0.30 (cheaper as you scale up). 14-day free trial, no card required.

**Feature set (confirmed):** 24/7 answering; appointment booking (phone or hosted booking page, with staff and resource calendars); order and quote collection; built-in client list (light CRM with history); channels across phone, web chat widget, booking page, plus SMS and email for confirmations/reminders; named integrations Google Calendar, Calendly, Cal.com, HubSpot, Zapier (5,000+ apps), Webhooks, custom MCP servers (Basic tier is Google Calendar only, Plus/Premium unlock the rest); 70+ languages with auto-detection (the live marketing page claims 90+; use "70+" as the conservative figure); customizable voice/tone/greeting/personality; call recording, transcripts, and post-call summaries; analytics dashboard; knowledge base built from website plus uploaded files.

**Gaps that matter for a PRD wedge:**
- **No HIPAA.** Healthcare customers are redirected to ElevenLabs' broader ElevenAgents platform. If your PRD targets medical or dental, this is an opening.
- **No live-human fallback.** It supports "staff-first" routing (calls go to your team during business hours, AI after-hours) and transfer to your own team members, but there is no human-receptionist answering service behind it. Pure AI backend.
- **No WhatsApp** channel mentioned.
- **No published performance metrics.** No latency, booking-accuracy, or CSAT numbers. Differentiation is qualitative (voice quality) plus the ElevenLabs brand.

---

## 2. Competitor List

### Direct competitors (AI-first phone receptionist)

| Competitor | Positioning | Entry price (confirmed 2026-10-07) |
|---|---|---|
| Smith.ai | Hybrid: AI plus live-staffed human handling, bundled. Strong in legal, dental, home services. Premium tier. | $300/mo (30 calls) |
| My AI Front Desk | Pure AI, custom knowledge base, widest channel coverage (voice/SMS/email/chat), multilingual | $99/mo ($79 annual) |
| Goodcall | No-code AI builder, unlimited-minute flat pricing, per-agent + per-customer model | $79/agent/mo |
| Dialzara | Markets against Ruby/Smith.ai, cheapest credible full-featured option | $29/mo (60 min) |
| Rosie (heyrosie) | Solopreneurs/home services, simple setup, unlimited-minute framing | $49/mo (250 min) |
| AIRA | Budget, per-call billing, broad language claim (70+) | $24.95/mo (30 calls) |
| CallPark | AI receptionist for local businesses, appointment booking + text summaries | $149/mo (unconfirmed, see note) |
| Synthflow | No-code AI voice-agent builder, broader than reception | Enterprise only (~$30k+/yr) |
| Retell AI | Developer-first voice AI infrastructure (build-your-own) | Usage-based, $0.07-$0.31/min |

### New entrants to watch (surfaced during funding research)

- **Beside** (Paris, ex-stealth "M1"): $32M raised (Index + EQT), emerged Nov 2025 with 20,000+ paying customers and $4M ARR. Moving fast.
- **Phonely**: $22M Series A, YC-backed, founded 2023.

### Adjacent / legacy competitors (live-agent or hybrid, same buyer)

- **Ruby Receptionists**: human-first, premium, PE-owned (HGGC). AI add-ons bolted on. $250/mo entry.
- **Posh**, **AnswerConnect**: live-agent answering services.
- **Numa**: AI texting/calling for auto and home-services verticals.

### Platform-adjacent (could bundle receptionist as a feature)

- **CloudTalk**: full VoIP/call-center platform, CRM-native, adding AI answering.
- **Dialpad**: business phone system with AI receptionist feature, $2.2B valuation, $300M+ ARR.

---

## 3. Pricing Intelligence (exact, cited 2026-10-07)

Every figure below is from the vendor's live pricing page unless flagged. v1's "approx" numbers are replaced.

### Corrections to v1 (important)

- **Smith.ai: v1 was wrong.** There is no ~$95/mo self-serve tier. Entry is **Starter $300/mo (30 calls)**, then Basic $810 (90 calls), Pro $2,100 (300 calls), Enterprise custom. Human handling is bundled, transfers are included (extra transfer destination +$15/mo), overage runs $8.50-$11.50/call. 30-day money-back up to $1,000. **Smith.ai is firmly premium, not budget.**
- **Ruby: $250/mo entry** (50 min), not ~$235. Then $395 (100 min), $720 (200 min), $1,725 (500 min).
- **Goodcall** is priced **per agent and per unique customer with unlimited minutes**, not per minute. $79 / $129 / $249 per agent, overage $0.50 per extra customer.

### Full tier table

| Vendor / Tier | Monthly | Included | Overage | Notes |
|---|---|---|---|---|
| reception.ai Basic/Plus/Premium | $29 / $79 / $199 | 75 / 275 / 1,000 credits | $0.30-0.45/credit | Credit = 1 inbound min, 0.5 web min. 14-day free trial. |
| Smith.ai Starter/Basic/Pro | $300 / $810 / $2,100 | 30 / 90 / 300 calls | $8.50-$11.50/call | Human handling bundled. 30-day money-back. |
| My AI Front Desk | $99 ($79 annual) | 200 min + 100 chats + 400 SMS + 500 emails | $0.25/min | Pure AI. 7-day trial. |
| Goodcall Starter/Growth/Scale | $79 / $129 / $249 per agent | Unlimited min; 100 / 250 / 500 customers | $0.50/customer | Per-agent, per-customer model. |
| Dialzara Lite/Pro/Plus/Elite | $29 / $99 / $199 / $349 | 60 / 220 / 500 / 1,000 min | $0.35-0.48/min | 7-day trial. Likely bootstrapped. |
| Rosie Pro/Scale/Growth | $49 / $149 / $299 | 250 / 1,000 / 2,000 min | ~$0.25/min (unconfirmed) | Scale+ adds warm/live transfers. 7-day trial. |
| AIRA Starter/Premium/Pro/Scale | $24.95 / $59.95 / $159.95 / $299 | 30 / 90 / 300 / 600 calls | $0.70-1.50/call | Billed per call, not per minute. |
| Ruby (human) | $250 / $395 / $720 / $1,725 | 50 / 100 / 200 / 500 min | Not disclosed | Human service; AI add-ons free. |
| CallPark | $149 / $299 / $499 | 150 / 300 min | Not listed | From Capterra; live site unreachable, confirm before quoting. |
| Synthflow | ~$30k+/yr | Custom | — | Enterprise only, no self-serve tier. |
| Retell AI | No plan fee | Pay-as-you-go | $0.07-$0.31/min all-in | $10 free credits. Pure infra. |

### Mid-market pricing gap: mostly closed

v1 claimed a gap at $100-200/mo with usage-based scaling. That no longer holds cleanly. The band is now populated: Goodcall Growth $129 (unlimited min), Rosie Scale $149 (1,000 min), CallPark Starter $149, AIRA Pro $159.95, reception.ai Premium $199, Dialzara Plus $199 (500 min). A narrow version survives: a true per-minute metered plan at $100-200 with a generous included-minute allotment **and** transparent low overage is still thin. Dialzara Plus ($199/500 min, $0.40/min) is the closest single match. Do not lead the PRD with "nobody serves the mid-market," because reception.ai itself now does.

---

## 4. Feature Extraction Across Companies

✅ = confirmed, — = not mentioned/unclear. reception.ai column added from confirmed ElevenLabs docs.

### Call Handling Core

| Feature | reception.ai | Smith.ai | My AI Front Desk | Goodcall | Dialzara | Rosie | AIRA | Ruby |
|---|---|---|---|---|---|---|---|---|
| 24/7 answering | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (human) |
| Spam/robocall blocking | — | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ |
| Call recording & transcription | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ |
| Post-call summaries | ✅ | ✅ | ✅ | — | ✅ | ✅ | — | ✅ |
| Warm transfer / escalation | ✅ (to your team) | ✅ (human staff) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (human) |
| Live-human fallback service | — (AI + your staff) | ✅ | — | — | — | — | — | ✅ |

### Lead & Appointment Management

| Feature | reception.ai | Smith.ai | My AI Front Desk | Goodcall | Dialzara | Rosie | AIRA | Ruby |
|---|---|---|---|---|---|---|---|---|
| Appointment booking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Hosted booking page | ✅ | — | — | — | — | — | — | — |
| Lead qualification | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ |
| Order/quote collection | ✅ | — | — | — | — | — | — | — |
| Built-in CRM / client list | ✅ | — | ✅ | — | — | — | — | — |
| Vertical intake (insurance, case data) | — | ✅ | ✅ | — | — | — | — | ✅ (HIPAA) |

### Channels Beyond Voice

| Feature | reception.ai | Smith.ai | My AI Front Desk | Goodcall | Dialzara | Rosie | AIRA | Ruby |
|---|---|---|---|---|---|---|---|---|
| SMS | ✅ (confirmations) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Web chat widget | ✅ | — | ✅ | — | ✅ | ✅ | — | ✅ |
| WhatsApp | — | — | ✅ | — | — | — | — | — |
| Email | ✅ | — | ✅ | ✅ | ✅ | ✅ | — | — |

### Integrations

| Feature | reception.ai | Smith.ai | My AI Front Desk | Goodcall | Dialzara | Rosie | AIRA | Ruby |
|---|---|---|---|---|---|---|---|---|
| Named CRM | HubSpot | Salesforce, HubSpot, Clio | Built-in + API | CRM + Sheets + GHL | Generic | via Zapier | HubSpot, SF, GHL, Pipedrive | 5,000+ |
| Zapier / MCP | ✅ (Zapier + MCP) | ✅ | — | ✅ | — | ✅ | ✅ | ✅ |
| Calendar sync | ✅ (Google, Calendly, Cal.com) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Vertical/PM system | — | ✅ | ✅ (property PMS) | — | — | — | — | — |

### Language, Voice & Intelligence

| Feature | reception.ai | Smith.ai | My AI Front Desk | Goodcall | Dialzara | Rosie | AIRA | Ruby |
|---|---|---|---|---|---|---|---|---|
| Broad multilingual | ✅ (70+) | — | ✅ | — | — | — | ✅ (70+) | — |
| Bilingual (Eng/Spanish) | ✅ | ✅ | ✅ | — | — | ✅ | ✅ | ✅ |
| Voice customization | ✅ (thousands of voices) | ✅ (12+) | — | ✅ | ✅ (50+) | ✅ | ✅ | — |
| Named quality metric | — | ✅ (AQI) | — | — | — | — | — | — |
| Sentiment analysis | — | — | ✅ | — | — | — | — | ✅ |
| KB training from website/files | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | — |

### Feature takeaways

- **Table stakes:** 24/7 answering, booking, lead qualification, calendar sync, transcription, KB training. Everyone has these, including reception.ai. These are not differentiators.
- **reception.ai's distinctive combo:** voice naturalness (ElevenLabs TTS) + hosted booking page + built-in CRM + order/quote capture + MCP integration, all self-serve. The booking page and order/quote capture are rarer in this set.
- **What reception.ai lacks vs. premium rivals:** live-human fallback (Smith.ai, Ruby have it), HIPAA (Ruby, My AI Front Desk touch regulated intake), WhatsApp (My AI Front Desk), and any named quality metric (Smith.ai's AQI is still the only one in the set).
- **Still-open gap:** no one combines strong sentiment analysis + call tagging + outcome trend analysis into real call intelligence. AIRA, Ruby, My AI Front Desk each have a fragment.

---

## 5. Funding, Traction & Threat Ranking

Every figure is sourced below. Aggregator-sourced numbers (CB Insights, Getlatka, Sacra, Seedtable) are labeled, since they can lag or conflict.

### Highest 3-year threat

1. **Retell AI**: fastest grower by far: ~$60M ARR by early 2026, +650% YoY (Sacra), from ~$5M at start of 2025. Disclosed funding is only ~$5.1M (YC + $4.6M seed), and that's by design: the company is reported profitable and deliberately capital-efficient (~$10 ARR per $1 raised). The lean funding is a strength story, not a data gap. The >$1.5B valuation cited by some trackers is unconfirmed.
2. **ElevenLabs (reception.ai's parent)**: a $3.3B-plus company (see profile) that just entered the category directly with a dedicated SMB product. This is the platform-bundling threat v1 predicted for 2028-2030, arriving early. Deepest pockets in the set by far.
3. **Synthflow**: $20M Series A led by Accel (Jun 2025), ~$30M total. Well-capitalized infra play.
4. **Dialpad**: $2.2B valuation (Series F, Dec 2021), $300M+ ARR. Not a direct rival today, but a downmarket move would hurt. Watch item: reported 2025 layoffs and a valuation stale ~4 years despite ARR growth point to real flat/down-round risk.
5. **CloudTalk**: $28M Series B (Jan 2024), ~$36.7M total. Established, actively adding voice AI.

### Solid incumbents, slower AI motion

6. **Smith.ai**: category leader, ~$13M total funding (~$7M seed 2019 led by NFX + ~$6M Series A 2022), with revenue reported ramping to ~$22M (2023) and ~$27M est. (2024) per Getlatka. Watch item: the hybrid-human model (500+ human receptionists) is more exposed to pure-AI cost disruption, and aggregator headcount shows possible contraction (noisy, unconfirmed).
7. **Ruby**: PE-owned (HGGC; Updata took majority in 2014 for $38.8M), ~700 employees, founded 2003. Highest legacy/disruption risk in the set. Late AI mover.

### Emerging / watch

8. **My AI Front Desk**: funding unconfirmed. Aggregators conflate two different "AI Front Desk" entities, so the "$3M seed" figure is unreliable; the real myaifrontdesk.com (founder Ruchir Baronia, ex-Meta, NYC) only claims vague "early investors in DoorDash and Gusto." Claims 1M calls/month. Reportedly rebranding to "Frontdesk." Treat funding and identity as a diligence risk.
9. **Rosie (heyrosie)**: VC-backed, amount undisclosed (an earlier "$1.5M pre-seed" figure circulating belongs to an unrelated Rosie AI, do not attribute it here). Repeat founder Jordan Gal (ex-CartHook). Two flags: the founder publicly admits ~$1M ARR then a growth plateau, and the product is built on Bland's voice stack (third-party dependency risk).
10. **Goodcall**: $4M seed in 2021 (led by Neo), nothing since. Possible staleness or deliberate capital-efficiency; still shipping (3rd-gen agent Oct 2024, 2,000+ active agents, Yelp/Wix partnerships), so stale funding does not mean shut down.
11. **Beside** ($32M, 20k customers) and **Phonely** ($22M): new, fast, worth tracking.

### Lowest near-term threat (bootstrapped / undisclosed)

12. **Dialzara** and **AIRA**: no visible institutional funding. Nimble and cheap, but no war chest to scale fast. (Note: AIRA the receptionist is distinct from "Aira Tech," the accessibility-glasses company that raised $30M. Do not conflate.)

**Read for the PRD:** the category is attracting serious capital in 2025-2026 (Retell's hypergrowth, ElevenLabs entering, Beside and Phonely raising). The bar is rising fast. A new entrant competing on raw "AI answers the phone" walks into a fight against an $11B parent and a $60M-ARR infra player. Defensibility has to come from workflow depth, a vertical, or a trust angle, not voice quality alone.

---

## 6. Voice of Customer: the real gaps

Independent review footprints are thin for the newest players, so confidence is flagged. Ratings are as reported by cited sources (2026 snapshots); small-n ratings are directional.

### Ratings snapshot

| Company | Trustpilot | G2 | Notes |
|---|---|---|---|
| Smith.ai | 4.3 (~336) | 4.7-4.9 | BBB "F" (unanswered complaints) |
| Ruby | 4.6 (~832) | 3.7 (11) | Settled a $12M class-action billing suit in 2021 |
| Dialzara | 4.5 (16) | — | Mostly positive, small-n |
| My AI Front Desk | thin | 4.8 (10) | Low review count |
| Goodcall | small | — | Cancellation/billing complaints |
| reception.ai | none | none | No citable independent reviews yet (see note) |
| Rosie | none | none | Too new, vendor testimonials only |

### Cross-competitor complaint themes (the winnable wedges)

1. **Billing opacity, surprise overage, cancellation abuse.** The most consistent and emotionally charged theme. Smith.ai (transfer fees, charges after cancellation), Goodcall (silent price hikes $59 to $99 to $130, charges continuing months after cancellation), Ruby (documented "$660 to $5,100" bill, charging for spam-call hangups, 60-second rounding). **Wedge: transparent flat pricing, hard spend caps, real-time overage alerts, no charge for spam/hangups, one-click cancellation.** This is the strongest PRD differentiation candidate.
2. **Robotic voice on longer or off-script calls.** Smith.ai ("hit or miss"), My AI Front Desk (awkward pacing on phone numbers). Callers get angrier when they realize it's a bot. Note: this is exactly where reception.ai's ElevenLabs voice quality is strongest, so competing on voice alone against them is hard.
3. **Weak or looping human handoff.** Reddit's top ask is "sounds natural AND hands off to a human when needed." Smith.ai's transfers are both a feature and a billing complaint. **Wedge: clean, fast, clearly-priced escalation with no loops.**
4. **Breaks on the business's actual off-script questions.** My AI Front Desk product-market-fit complaints, accents, noisy audio, emotional calls. **Wedge: rigorous pre-launch testing against the business's real services, accent robustness.**

**Macro trust signal:** a June 2026 BBB study found 90%+ of reviews mentioning AI services expressed negative sentiment. Buyer skepticism is high. A trust-and-transparency angle has room to run.

---

## 7. Market Sizing

Unchanged from v1; figures vary 2-4x by methodology, treat as directional.

- **TAM (AI voice agents):** $2.54B (2025) to $35.24B (2033), ~39% CAGR (Grand View Research). Inbound use cases (receptionist, support, booking) are 52.1% of current revenue, the dominant use case.
- **SAM (virtual receptionist services):** roughly $4.5-17.8B depending on source, ~10-12% CAGR, with the AI-native slice growing far faster as it displaces live-agent spend.
- **AI-native receptionist slice:** blended 25-40% CAGR through 2030, well above the overall segment's 10-12%, because it's cannibalizing legacy spend, not just adding net-new demand.
- **Segments:** SMB solo/trade (home services, contractors) is highest-volume, lowest-ACV, most price-sensitive (Dialzara, AIRA, Rosie fight here). Professional services (legal, dental, medical) is lower-volume, higher-ACV, where vertical integration and HIPAA become real moats (Smith.ai leads; reception.ai is blocked by its HIPAA gap).

---

## 8. Strategic Implications for the PRD

1. **Voice quality is no longer a viable primary wedge.** ElevenLabs owns that claim now, and it's their whole pitch. Pick a different axis.
2. **The strongest differentiation lane is trust and billing transparency.** It's the #1 complaint across the three most-reviewed competitors, and buyer skepticism toward AI is high (90%+ negative BBB sentiment). Flat pricing, hard spend caps, no spam-call charges, one-click cancel, and transparent escalation pricing would hit a real, repeated pain point.
3. **A regulated vertical is open.** reception.ai has no HIPAA and pushes healthcare away. A dental or medical wedge with HIPAA plus practice-management integration is defensible against both reception.ai and the horizontal budget tools.
4. **Live-human fallback is a gap at the AI-native tier.** Smith.ai monetizes it at a premium; reception.ai doesn't offer it. A lightweight, clearly-priced human escalation closes the trust gap without Smith.ai's price.
5. **Do not claim a mid-market pricing gap.** reception.ai Premium ($199), Goodcall Growth ($129), and Rosie Scale ($149) fill it. If pricing is a wedge, make it transparency and predictability, not "cheaper mid-tier."
6. **Call intelligence is genuinely open.** No competitor combines sentiment + call tagging + outcome trends into real analytics. That's a feature-level differentiator if the vertical supports it.

### Recommendations

1. Anchor the PRD's competitive section on reception.ai as the primary benchmark (it's the best-resourced direct competitor and sets the feature bar).
2. Choose the wedge deliberately: trust/transparency, a regulated vertical (HIPAA + PM integration), or call intelligence. Voice quality and "cheaper mid-tier" are both closed.
3. If going vertical, go deep on one practice-management or field-service integration rather than staying horizontal against reception.ai and Goodcall.
4. Treat ElevenLabs/reception.ai as the pace-setter on self-serve onboarding (website scan, under 5 minutes). Match or beat that bar.
5. Re-verify pricing before the PRD ships; these vendors change tiers often.

---

## Sources

### reception.ai / ElevenLabs
- https://elevenlabs.io/docs/reception-ai/billing/plans-and-pricing
- https://elevenlabs.io/docs/reception-ai/overview
- https://elevenlabs.io/docs/reception-ai/integrations/overview
- https://elevenlabs.io/reception
- https://elevenlabs.io/blog/reception
- https://runtimewire.com/article/elevenlabs-reception-ai-receptionist-small-business
- https://www.reception.ai and https://reception.ai (both still HTTP 403 to automated fetch)

### Pricing
- https://smith.ai/pricing · https://www.myaifrontdesk.com/pricing · https://www.goodcall.com/pricing · https://dialzara.com/pricing · https://heyrosie.com/pricing · https://getaira.io/pricing · https://www.ruby.com/pricing/ · https://synthflow.ai/pricing · https://www.retellai.com/pricing · https://www.capterra.com/p/10038591/CallPark/ (live site unreachable)

### Funding & traction
- https://www.cbinsights.com/company/smithai/financials · https://getlatka.com (Smith.ai ARR + burn) · https://sacra.com/research/retell-ai-60m-yr-up-650-yoy · https://synthflow.ai/news/synthflow-raises-20m-series-a · https://tech.eu (CloudTalk, Synthflow rounds) · https://clay.com/dossier/dialpad-funding · https://seedtable.com (Rosie, My AI Front Desk) · https://fortune.com/2025/11/11/ (Beside)

### Voice of customer
- https://www.trustpilot.com/review/smith.ai · https://www.g2.com/products/smith-ai-ai-receptionist/reviews · https://serviceagent.ai/blogs/smith-ai-pricing/ · https://www.trustpilot.com/review/dialzara.com · https://www.g2.com/products/my-ai-front-desk/reviews · https://dialora.ai/blog/goodcall-reviews · https://www.trustpilot.com/review/ruby.com · https://www.consumeraffairs.com/business/ruby-receptionists.html · https://www.kcrg.com/2026/06/25/better-business-bureau-study-finds-over-90-reviews-that-mention-ai-are-negative/ (note: trustpilot.com/review/ai-receptionist.com was dropped, it is a different, unaffiliated product)

### Market sizing
- https://www.cloudtalk.io/blog/ai-voice-agent-statistics/ · https://www.ringly.io/blog/voice-ai-statistics-2026 · https://ainora.lt/blog/virtual-receptionist-market-statistics-2026 · https://schedulingkit.com/statistics/ai-receptionist-statistics

---

## Data Considerations

- **reception.ai is now confirmed as an ElevenLabs product**; its pricing/features come from ElevenLabs' own docs. The direct site still 403s, so screenshots of the live marketing page could not be captured.
- **Domain question, RESOLVED (2026-10-07):** `reception.ai` and `elevenlabs.io/reception` are the same product, Reception by ElevenLabs (confirmed via the live ElevenLabs page: headline "AI receptionists that answer every call," pricing $29/$79/$199). `ai-receptionist.com` is a **separate, unaffiliated product** (independent small US team, plans from $14/mo, no ElevenLabs connection). The "4.0 / 4 Trustpilot reviews" an earlier pass attributed to reception.ai were for that other product and have been removed. reception.ai has no citable independent reviews yet. Note: reception.ai itself returns HTTP 403 to automated fetch and is blocked by SecurityScorecard's browsing policy, so it was confirmed through the ElevenLabs page, not the domain directly.
- **Look-alike warning:** a separate "Reception AI" product on an Azure cloudapp domain lists $22/$55/$99 tiers with a flat $0.40/min overage. That is NOT ElevenLabs' reception.ai. Do not use those numbers.
- **Retell AI** revenue growth is well-sourced; its lean funding is intentional (profitable, capital-efficient), not missing data. The >$1.5B valuation some trackers cite is unverified.
- **ElevenLabs valuation conflicts across sources:** a confirmed $180M Series C at $3.3B (Jan 2025) vs. a later ~$11B figure (early 2026). The $3.3B round is firmest; the $11B is reported but less consistently sourced. Use "$3.3B-plus" unless you can confirm the newer round.
- **My AI Front Desk funding is unreliable** (two conflated entities); **Rosie's funding amount is undisclosed** (the "$1.5M pre-seed" is a mis-attribution to a different company). Do not state either as fact.
- **Nearly all revenue, customer, and headcount figures are self-reported or aggregator-sourced** (Getlatka, CB Insights, PitchBook, Sacra), not audited. Label them as estimates in the PRD.
- **CallPark** pricing is from Capterra; its live site was unreachable. Verify before quoting.
- Market sizing varies 2-4x across sources due to inconsistent category definitions.
- Feature matrix reflects marketing/docs content as of 2026-10-07, not hands-on testing. Absence of a checkmark means "not mentioned," not "doesn't exist."
- Review counts for Goodcall, My AI Front Desk, Rosie, and reception.ai are small (n≈4-10); treat their star ratings cautiously.
