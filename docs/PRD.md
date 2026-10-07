# PRD: Handled - The AI Office Manager for Home & Local Service Businesses

**Author:** John Francis
**Date:** 2026-10-07
**Status:** Draft (Week 1-5 template, first pass)
**Related:** [`Competitive Research.md`](Competitive%20Research.md) (same folder)

> **Positioning in one line:** Handled is an AI office manager that answers every call, books the job into your field-service schedule, and follows up, so owner-operators stop losing revenue to the competitor who picked up first.
>
> **How this differs from an "AI receptionist":** receptionists answer and take a message. Handled does the office manager's job: answer, qualify, check real availability, book into the dispatch system, triage emergencies, text back missed callers, and chase quotes and reviews. The wedge is depth of workflow (dispatch integration + back-office tasks), not voice quality, which an $11B incumbent (ElevenLabs' reception.ai) already owns.

---

## 1. PROBLEM DEFINITION

### What problem is this solving?

Home and local service businesses (plumbing, HVAC, electrical, roofing, landscaping, cleaning, pest control, garage doors) run on inbound calls. The owner is usually in the field with their hands full, so the phone goes unanswered, and an unanswered call is a lost job. Voicemail does not save it: most callers just dial the next company.

**Job-to-be-done:** "When a customer calls while I'm on a job or after hours, capture that lead, book it into my schedule, and follow up, so I don't lose the work to a competitor."

The money problem underneath it:
- Home service businesses miss roughly **27% of inbound calls**, and a live person answers only about **52%** of calls (Invoca, 2026).
- **62% of callers who don't get through immediately call a competitor**, and **85% never call back** (missed-call benchmarks, 2026).
- Each missed call is worth roughly **$1,200** in a home-services job on average, before lifetime value (Invoca).

So the typical owner is leaking real revenue every week, and the leak is invisible because a missed call leaves no trace.

### Who are you solving this problem for?

**Primary persona: the owner-operator ("Mike the plumber").**
- Business size: 1 to 20 employees, often 1 to 5. Owner is a licensed tradesperson, not an office person.
- Revenue: ~$250K to $3M/yr. Average job value $150 to $2,500 depending on trade.
- Current setup: cell phone as the business line, maybe a spouse or a part-time person answering, maybe a generic answering service. Many already use a field-service management (FSM) tool (Jobber, Housecall Pro, ServiceTitan) for scheduling and invoicing.
- Pain: on a roof or under a sink, cannot answer. After 5pm, nobody answers. Can't justify a $42K to $62K/yr office manager (true loaded cost of a full-time receptionist, 2025 salary data).

**Buyer = user = owner.** This is a self-serve SMB sale, not a committee.

**Secondary persona: the office admin** (in 5-to-20-person shops) who juggles phones, scheduling, and dispatch and is drowning during busy season. Handled is their assistant, not their replacement.

### Why is this problem worth solving?

**Market reality:** US home services is a ~$600B industry with ~2.5M businesses (2026). The field-service software market that these businesses already buy into is ~$3.1B in the US and growing ~12% (global FSM $5.6B in 2026 to $12.7B by 2033). These buyers already pay for software and already feel the missed-call pain.

**The MOAT (why Handled wins and keeps winning):**
1. **Dispatch-grade integration, not a generic calendar.** Handled books real jobs into the owner's FSM (Jobber/Housecall Pro/ServiceTitan) respecting technician availability, skills, and service area. Most AI receptionists drop an event on a Google Calendar. That gap is the moat: deep two-way FSM integration is hard to build, sticky once installed, and exactly what this buyer needs.
2. **Office-manager scope, not receptionist scope.** Missed-call text-back, quote follow-up, appointment reminders, and review requests, all tied to the same job record. This expands revenue per customer and raises switching cost.
3. **Trade-aware emergency triage.** Handled recognizes a burst pipe, gas smell, or no-heat-in-winter as urgent and escalates to the on-call tech immediately. Generic tools either miss this or over-escalate.
4. **Trust and transparency on pricing.** The #1 complaint across competitors (Smith.ai, Goodcall, Ruby) is surprise billing and overage. Handled ships flat pricing, hard spend caps, and no charge for spam or hangups. This is a go-to-market wedge, not just a feature.

**Why Claude/ChatGPT/Copilots don't solve this:** those are text chat assistants in a browser. Handled is a voice-first agent that answers a live phone call 24/7, holds a natural multi-turn conversation, calls tools (checks the FSM calendar, creates a job, sends an SMS), and acts autonomously without the owner present. A general chatbot has no phone number, no telephony, no dispatch integration, and no autonomous task execution. Different product category.

### Why Agentic AI?

A home-services call is open-ended natural language with a real-world action at the end. The caller might want to book, reschedule, get a quote, ask a question, or report an emergency, in any order, with interruptions and accents. The agent has to understand intent, decide what to do, use tools against live systems, and confirm. That is planning plus tool use plus dialog, which is the definition of an agent.

Why not the alternatives:
- **Rule-based IVR ("press 1 for scheduling"):** callers hate phone trees, and job requests are too varied to script. Fails on comprehension and on customer experience.
- **A single classifier / traditional ML model:** can label intent but cannot carry a conversation, check availability, or book. No action-taking.
- **A scripted chatbot:** breaks the moment the caller goes off-script, which home-services callers always do ("my water heater's leaking and I also need someone to look at the furnace").

Agentic AI (LLM + tools + planning) is required because the task is: comprehend unstructured speech, reason about urgency and availability, and execute multi-step actions across external systems, reliably, in real time.

**Unstructured inputs Handled ingests (and why pattern-matching fails on each):** inbound **call audio** (accents, background noise, interruptions, multi-intent requests); two-way **SMS text** (shorthand, typos, partial info); the business's **website and documents** used to build the knowledge base (unstructured HTML/PDF with no fixed schema); and **call transcripts** used for learning and QA. None of these have a fixed structure, so a keyword or rules engine cannot reliably pull intent, service type, address, or urgency out of them. An LLM generalizes across phrasings and formats where rules break.

### How will you know that the problem is solved?

**North Star Metric:** **Captured Opportunity Value** = the dollar value of booked or actioned jobs from calls that would otherwise have been missed. This ties the product directly to the owner's revenue, which is the thing they actually care about.

**Primary metrics:**
| Metric | Baseline (industry) | Target | Timeframe |
|---|---|---|---|
| Call answer rate | ~52% answered by a person | 99%+ answered by Handled | At launch |
| Booking conversion (answered call → booked job) | [NEED: baseline from pilot] | ≥35% of qualified calls | 90 days post-onboard |
| After-hours / overflow capture rate | ~0% (voicemail) | ≥80% of after-hours calls actioned | 90 days |

**Secondary metrics:** owner admin hours saved per week; missed-call text-back response time (target <30s); caller CSAT (post-call survey); net revenue retention / logo retention; % of jobs booked without any human touch.

**Guardrail metrics (must not get worse):** misbooking rate (wrong time/service/address) ≤2%; emergency mis-triage rate ~0 (safety-critical, see Section 8); hallucinated-fact rate (invented price/availability) <1%; false/unnecessary transfer rate.

---

## 2. SOLUTION DEFINITION

### User Flows

**Flow A: Inbound call, book a job (the core loop)**

```
Caller dials business number
        │
        ▼
Handled answers as the business ("Thanks for calling Mike's Plumbing...")
        │
        ▼
Understand intent ─► [book | reschedule | quote | question | EMERGENCY]
        │
        ├─ EMERGENCY ─► triage ─► warm-transfer / page on-call tech ─► log
        │
        ▼ (book)
Collect: service type, address/service-area check, preferred time
        │
        ▼
TOOL: query FSM for real availability (tech skills + area + slot)
        │
        ▼
Offer slots ─► caller confirms
        │
        ▼
TOOL: create job in FSM + CRM  →  TOOL: send SMS confirmation to caller
        │
        ▼
Notify owner (SMS/app) + write call summary + transcript to dashboard
```

**Flow B: Missed-call text-back (safety net).** if a call is abandoned or overflows, Handled sends an SMS within seconds ("Sorry we missed you, this is Mike's Plumbing, can I book you in? Reply here"), then continues the booking over text.

**Flow C: After-hours.** same as Flow A, but emergencies page the on-call tech and non-urgent jobs are booked into the next available slot with a morning summary to the owner.

**Flow D: Outbound follow-up (later phase).** Quote not accepted after N days triggers a follow-up text; day-before reminders; post-job review request.

**Handling AI drawbacks in the flow (required by the template):**
- **Hallucination:** Handled only quotes prices, availability, and policies that come from the business's configured knowledge base and live FSM data. If a fact is not known, it says "I'll have the owner confirm and text you," never invents. Availability always comes from a tool call, never from the model's memory.
- **Explainability:** every call produces a transcript, a structured summary (intent, action taken, data captured), and the tool calls made, visible in the dashboard. The owner can see exactly what Handled did and why.
- **Wrong actions:** bookings are confirmed back to the caller verbatim before the tool writes to the FSM, and the owner gets a notification they can override.

### Functional Requirements (user stories)

**Call handling**
- As an owner, I want every call answered 24/7 so I never lose a lead while on a job.
- As a caller, I want to book by talking naturally, with no phone tree.
- As an owner, I want spam and robocalls filtered so I'm not charged or notified for junk.

**Booking & dispatch**
- As an owner, I want jobs booked into my FSM respecting technician skills, availability, and service area, so Handled never books a job I can't do.
- As an owner, I want address/service-area validation so I don't get booked outside my radius.
- As a caller, I want an SMS confirmation with the appointment details.

**Emergency triage**
- As an owner, I want urgent calls (gas, flooding, no heat) detected and routed to my on-call tech immediately.
- As an owner, I want a clear rule for what counts as an emergency that I can configure.

**Back-office (office-manager scope)**
- As an owner, I want missed callers texted back within 30 seconds.
- As an owner, I want quote follow-ups, reminders, and review requests sent automatically.

**Trust & control**
- As an owner, I want flat monthly pricing with a hard spend cap and no surprise overage.
- As an owner, I want to review transcripts and summaries and correct mistakes.
- As an owner, I want a clean warm transfer to me (with context) when the caller asks for a human or the agent is unsure.

**Setup**
- As an owner, I want to go live in minutes by pasting my website and connecting my FSM, not by filling out a 40-field form.

---

## 3. PRIORITIZATION

### Breaking the agentic workflow into components

```
[1 Telephony I/O: STT + TTS + turn-taking]
          │
[2 Conversation & intent agent (LLM reasoning)]
          │
   ┌──────┼───────────────┬──────────────┐
   ▼      ▼               ▼              ▼
[3 Business KB /    [4 Availability &   [5 Emergency   [6 Missed-call
 RAG config]         booking (FSM tool)] triage]        text-back / SMS]
          │
[7 Post-call: log to FSM/CRM + summary + owner notify]
          │
[8 Outbound follow-up (later)]      [9 Analytics dashboard]
```

### Component-level risk assessment

**Component: Conversation & intent understanding (voice)**

| Check | Result |
|---|---|
| Is ML necessary? | PASS. Open-ended speech across trades cannot be scripted; rules fail on comprehension and UX. |
| Do you have data to train? | Partial. Use a strong base LLM + business config; collect call transcripts for eval and prompt tuning. [NEED: pilot call corpus] |
| Can it meet accuracy needs? | Conditional. Target ≥95% intent accuracy; mitigate with confirmation steps and human transfer on low confidence. |
| Can it scale? | PASS. Cloud voice infra scales with concurrency. |
| How fast is feedback? | Fast. Every call is a labeled example (booked or not). |
| Laws? | Call-recording consent varies by state (one- vs two-party); AI-disclosure rules emerging. See Section 8. |
| Explainability? | PASS. Transcript + tool-call log per call. |
| Judge good vs bad? | PASS. Booking success and caller CSAT are clear signals; HHH evals in Section 6. |

**Component: Availability & booking (FSM integration)**

| Check | Result |
|---|---|
| Is ML necessary? | NO for the write itself (deterministic API call). ML decides *what* to book; the booking is a tool call. |
| Data to build? | Need FSM API access + schema per vendor. [NEED: partner/API agreements with Jobber, Housecall Pro, ServiceTitan] |
| Accuracy needs? | Highest. A misbooking is worse than a missed call. Guardrail ≤2%, verbatim confirm before write. |
| Scale? | PASS, rate limits per FSM vendor to manage. |
| Explainability? | PASS, every write is logged and reversible. |

**Component: Emergency triage** (safety-critical). ML classifies urgency; design errs toward escalation (a false "emergency" is cheap, a missed real emergency is not). Owner-configurable rules. See Section 8.

### Overall workflow risk summary

| Component | Risk | Comment |
|---|---|---|
| Telephony I/O | Low | Mature voice infra (Vapi/Retell/Twilio-class). Buy, don't build. |
| Conversation & intent | Medium | Core quality driver; mitigated by confirmation + transfer. |
| Business KB / RAG | Low-Med | Garbage-in risk if onboarding data is wrong; validate at setup. |
| Availability & booking (FSM) | High | Misbooking is the worst failure; strict confirm + reversible writes. |
| Emergency triage | High | Safety-critical; bias toward human escalation. |
| Missed-call text-back / SMS | Low | Well-trodden (A2P 10DLC compliance needed). |
| Post-call logging | Low | Deterministic. |
| Outbound follow-up | Low-Med | Deferred; TCPA/consent rules apply. |

### Prioritize and narrow scope (MVP)

**In the MVP, prioritize the components that capture revenue on day one:** telephony I/O, conversation/intent, business KB, availability+booking for **one** FSM (Jobber first, widest SMB footprint), missed-call text-back, and post-call logging/notify. Emergency triage ships as "detect + transfer to owner" (simplest safe version). Everything else (multi-FSM, outbound follow-up, analytics depth, call intelligence) is later.

Rationale (prioritization tenets): highest value + highest frequency = answer-and-book. Highest risk (FSM misbooking, emergency) gets the most guardrail investment. Lowest-value/nice-to-have (outbound campaigns, review requests) is deferred.

---

## 4. ROADMAP

| Release | Features | Target duration |
|---|---|---|
| **MVP** | 24/7 answer + natural booking into Jobber, address/service-area check, SMS confirmation, missed-call text-back, call transcript + summary + owner notify, spam filtering, flat transparent pricing | ~8-10 weeks |
| **MVP 1** | Emergency triage + warm transfer, Housecall Pro + ServiceTitan integrations, configurable business rules, dashboard v1, English/Spanish | +6-8 weeks |
| **Launch** | Multi-technician dispatch logic, outbound follow-up (quotes/reminders/reviews), multi-location support, A2P 10DLC at scale, billing + spend caps | +8-10 weeks |
| **Iteration** | Call intelligence (sentiment, tagging, outcome trends), more FSM/CRM integrations, additional trades, quality-score metric, self-serve onboarding polish | Ongoing |

---

## 5. IMPLEMENTATION PLAN

### Evaluation Strategy

- **Ground truth:** a labeled set of real (pilot) and synthetic calls per intent (book, reschedule, quote, question, emergency, spam), each with the correct action and captured fields. [NEED: 200+ labeled pilot calls to establish baseline]
- **Offline evals:** run the agent against the labeled set; measure intent accuracy, correct-action rate, field-extraction accuracy (name/address/service/time), misbooking rate, emergency recall (must be ~100%), and hallucination rate.
- **Online monitoring:** track booking conversion, transfer rate, caller CSAT, and guardrail breaches per customer, with alerts on regressions. Every live call feeds back into the eval set.
- **Human review:** sample N calls/week per cohort for manual HHH scoring during early phases.

### Model Requirements

| Criteria | Requirement | Rationale |
|---|---|---|
| Model type | Tool-using LLM for reasoning + dedicated voice stack (STT/TTS) | Needs function-calling to hit FSM/SMS tools and strong instruction-following for dialog. |
| Open vs closed | Closed-source API for MVP | Fastest path to quality; revisit open models for cost at scale. |
| Latency | Top priority (sub-second turn response) | Phone conversation dies past ~1s of silence. Willing to pay more / use a smaller fast model for the conversational turn. |
| Reasoning model | Claude (Sonnet-class for the dialog/decision loop; Haiku-class for cheap classification like spam/intent pre-filter) | Course-aligned; strong tool use and instruction-following, tiered by task to control cost. |
| Voice (STT/TTS) | Streaming STT + low-latency natural TTS via a voice platform (Vapi/Retell/Twilio-class) | Voice quality is table stakes; buy the infra rather than compete with ElevenLabs on TTS. |
| Context window | 32K+ | Hold business config, conversation, and tool results. |
| Modalities | Audio in/out (via STT/TTS), text | Core channel is the phone. |
| Multilingual | English + Spanish at launch | Large Spanish-speaking share of home-services callers and crews. |
| Accuracy | High on booking + emergency | Misbooking and mis-triage are the costly failures. |
| Cost efficiency | High priority | High call-minute volume; route cheap tasks to smaller models. |

[NEED: run a latency + cost bake-off across voice platforms and Claude model tiers before committing.]

---

## 6. EVALUATIONS

Evals framed on the HHH (Helpful, Honest, Harmless) framework. The test bank lives in [`evals.xlsx`](evals.xlsx) (50 cases across booking, emergencies, honesty/hallucination guards, spam, transfers, PII, security/prompt-injection, payment, and compliance, with an auto-calculating scorecard and launch gates). [NEED: upload to the course Google Sheet and paste the share link here.]

- **Helpful:** books the right service at a real available slot; captures correct name/address/time; resolves the caller's actual need. Metric: correct-action rate, booking conversion.
- **Honest:** never invents price, availability, or policy; says "I'll have the owner confirm" when unsure; confirms details verbatim before writing. Metric: hallucination rate <1%, confirmation compliance.
- **Harmless:** correctly escalates emergencies; never books out of service area; handles PII safely; discloses it's an AI where required. Metric: emergency recall ~100%, misbooking ≤2%, zero PII mishandling.

### Launch Plan (go / no-go criteria)

| Launch stage | Helpful | Honest | Harmless | Reason to proceed |
|---|---|---|---|---|
| Measurement (1-2%, design-partner shops) | Booking conversion ≥ manual baseline | Hallucination <1% | Emergency recall 100%, 0 misbookings in sample | Prove it captures revenue without harm |
| Beta (2-10%) | Conversion ≥35% | Confirmation compliance ≥99% | Misbooking ≤2%, no safety incidents | Stable quality across trades |
| General launch | Conversion sustained, CSAT ≥4/5 | Honesty metrics held | Guardrails held at scale | Ready for self-serve volume |

---

## 7. DATA REQUIREMENTS

| Item | Plan |
|---|---|
| Model fine-tuning | Not at MVP. Use base Claude + prompting + RAG. Revisit fine-tuning/distillation for cost once a proprietary call corpus exists. |
| Data preparation | Label pilot calls by intent + correct action + extracted fields to build ground truth. Generate synthetic edge-case calls (heavy accents, noise, multi-intent, emergencies). |
| Data quantity | MVP eval: [NEED: ~200-500 labeled calls]. Ongoing: all live calls become labeled examples via outcome tracking. |
| Iterative collection | Every call logged with transcript, tool calls, and outcome (booked/transferred/abandoned); owner corrections captured as labels. |
| Iterative fine-tuning | Later: fine-tune a smaller/cheaper model on the accumulated corpus for the high-volume conversational turn. |
| Knowledge base (RAG) | Per-business config: services, pricing, hours, service area, FAQs, booking rules, emergency rules. Built from website scrape + a short intake at onboarding. |

### Prompt Strategy

- **System/role prompt:** "You are the office manager for {business}. Book jobs, answer questions from the knowledge base only, triage emergencies, and never invent prices or availability." Grounds tone and guardrails.
- **Tool-use prompting:** structured function-calling for `check_availability`, `create_job`, `send_sms`, `transfer_call`. Availability and booking always via tools, never model memory.
- **Few-shot:** examples of correct booking dialogs and field-extraction output per trade.
- **Chain-of-thought (internal):** for emergency triage and multi-intent calls, reason step by step (classify urgency → decide action) before acting; expose only the action and a short rationale to the owner, not raw chain-of-thought to the caller.
- **Confirmation / validation step:** read back captured details verbatim before the write tool fires.
- **Feedback-driven improvement:** mine failed/abandoned/transferred calls and owner corrections to refine prompts and the KB.

---

## 8. RESPONSIBLE AI RISKS & MITIGATION

### Accountability
| Question | Answer |
|---|---|
| Efficacy and limitations? | Strong at booking, FAQs, triage; weak on highly unusual requests → transfer to human. Not a substitute for a licensed tradesperson's judgment. |
| Compliance / policies for sensitive data? | Call recordings and caller PII (name, address, phone). Follow state call-recording consent law, A2P 10DLC for SMS, TCPA for any outbound. |
| Managing sensitive data? | Encrypt in transit and at rest; per-business data isolation; retention limits; no cross-customer data sharing. |
| Human oversight? | Owner sees every transcript/summary, can correct and override; low-confidence and emergency paths route to a human. |

### Transparency
| Question | Answer |
|---|---|
| Direct/indirect use cases? | Direct: answer, book, triage, follow up. Indirect: call analytics for the owner. |
| How results are produced? | Intent from LLM, availability/booking from FSM tool calls, facts from the business KB; all logged. |
| Benchmarks to share? | Booking accuracy, misbooking rate, emergency recall, hallucination rate (shared with design partners). |
| Disclosure? | Disclose that the caller is speaking with an AI assistant where required; always offer a human. |

### Fairness
| Question | Answer |
|---|---|
| Underrepresented groups / failure modes? | Accents, non-native English, elderly callers, speech differences, poor-audio cell calls. Mitigate with robust STT, Spanish support, and easy "talk to a human." |
| Why some groups may not work well? | STT error rates rise on heavy accents and noise; triage must not penalize unclear speech. |
| Test/feedback loop? | Stratify eval set by accent/language/audio quality; monitor transfer and CSAT by segment; add a TTY/relay path. [NEED: accessibility review] |

### Reliability and safety
| Question | Answer |
|---|---|
| Acceptable error rates? | Misbooking ≤2%; emergency mis-triage ~0 (safety-critical); hallucination <1%. |
| Consequences of bad input / what can go wrong? | Worst cases: a real emergency (gas leak, flooding) treated as routine; a job booked at the wrong time/address. Both can cause real harm or lost trust. |
| Recovery plan? | Bias triage toward human escalation; verbatim confirmation before any booking; all writes reversible; if the system is down, fail over to voicemail + instant text-back so no call is silently dropped. |
| Monitoring + customer comms? | Real-time guardrail alerts; per-customer health dashboard; proactive notice to owners on any incident. |

---

## 9. PRICING

### Costs & Accuracy Tradeoffs
| # | Item | Likely choice | Why | Trade-off |
|---|---|---|---|---|
| 1 | Reasoning model | Claude Sonnet-class (dialog) + Haiku-class (classification) | Quality where it matters, cheap where it doesn't | Two-model orchestration complexity |
| 2 | Voice infra | Buy (Vapi/Retell/Twilio-class) | Don't compete with ElevenLabs on TTS; faster to market | Per-minute cost + vendor dependency |
| 3 | FSM integration | Official APIs (Jobber first) | Reliability + partnership path | Build cost per vendor |
| 4 | Knowledge base | RAG over per-business config | No fine-tune needed at MVP | Quality depends on onboarding data |

### Development Costs (one-time)
[NEED: real quotes.] Directional: a small founding team (1 PM, 2 backend, 1 full-stack) for ~4-6 months to MVP, plus voice-platform and LLM usage during build. Rough order: engineering the dominant cost; infra minor at pilot scale.

### Operational Costs (ongoing)
The dominant variable cost is **voice minutes** (STT + TTS + telephony + LLM per call), industry benchmark roughly **$0.07 to $0.31 per minute all-in** (per competitive research on Retell-class infra). A typical booking call of 3-5 minutes costs ~$0.30 to $1.50 in infra. This must sit well inside the subscription margin. Plus SMS (A2P), hosting, and support.

### Market Size
- **TAM:** US home services ~$600B industry, ~2.5M businesses. If software ACV ~$2-4K/yr, serviceable software spend is on the order of **$5-10B**; the AI-voice slice of it is growing 25-40%/yr (per competitive research).
- **SAM:** home-service businesses with enough call volume and an FSM in place (or ready to adopt one). Estimate **~1M businesses**, roughly **$3B** at target ACV.
- **SOM (3-year, directional):** 5,000 to 20,000 businesses at ~$3K ACV = **$15M to $60M ARR**. [NEED: validate with pilot conversion + CAC.]

### Revenue Potential
Simple scenarios at a $249/mo blended ACV (~$3K/yr):
- Conservative: 2,000 customers → ~$6M ARR
- Base: 8,000 customers → ~$24M ARR
- Upside: 20,000 customers → ~$60M ARR

### Pricing Models (and the one we choose)
Options considered: per-minute metered (opaque, the thing buyers hate), per-booking (aligns to value but unpredictable for the owner), and **flat monthly tiers with transparent included usage + hard caps (chosen)**. Flat tiers directly answer the category's #1 complaint (surprise billing) and make ROI obvious: one captured ~$1,200 job pays for months of service.

### Directional Pricing
| Tier | Price | For | Includes |
|---|---|---|---|
| **Starter** | ~$149/mo | Solo operator | 1 number, 24/7 answer + book into 1 FSM, missed-call text-back, transcripts, spam filtering, hard spend cap |
| **Pro** | ~$299/mo | Small team (2-10) | Everything + emergency triage/transfer, multi-tech dispatch, outbound follow-up, Spanish, dashboard |
| **Scale** | ~$599/mo | Multi-location / high volume | Everything + multiple numbers/locations, priority support, call intelligence |

Positioning: **above budget AI receptionists** (because Handled books into dispatch and does office-manager work) and **far below a $42-62K/yr human office manager** and below Smith.ai's premium hybrid ($300+/mo). Every tier includes a transparent cap and no charge for spam or hangups.

---

## Open Questions / What this draft still needs

- [NEED] Customer discovery: 5-10 owner-operator interviews to replace industry stats with first-party quotes (the checklist wants validated, qualitative evidence; I did not fabricate quotes).
- [NEED] FSM partnership/API confirmation (Jobber, Housecall Pro, ServiceTitan) and their booking/availability schemas.
- [NEED] Voice-platform + Claude-tier latency/cost bake-off to lock model requirements and unit economics.
- [NEED] Labeled pilot call corpus (~200-500 calls) to set eval baselines and the booking-conversion baseline.
- [NEED] Legal review: state call-recording consent, AI-disclosure, A2P 10DLC, TCPA for outbound.
- [NEED] Real development-cost quotes to replace the directional figures in Section 9.

---

## Self-Evaluation Checklist Status (Week 1 focus)

**Problem Definition:** problem + JTBD ✅ · persona ✅ · validated with market data ✅ (first-party quotes pending) · worth-solving + MOAT ✅ · agentic-AI justification ✅ · differentiation from ChatGPT/Copilots ✅
**Core Metrics:** North Star ✅ · primary ✅ · secondary ✅ · measurable over time ✅ (baselines pending pilot)
**Solution:** visual user flow ✅ · AI-drawback handling ✅ · functional requirements as user stories ✅
**Prioritization / Roadmap:** components ✅ · per-component risk ✅ · MVP scope + rationale ✅ · phased roadmap ✅
**Implementation / Evals:** model requirements ✅ · eval strategy ✅ · HHH + launch criteria ✅ (evals sheet link pending)
**Data / Prompt:** data strategy ✅ · prompt strategy ✅
**Responsible AI:** accountability, transparency, fairness, reliability ✅ · human-in-the-loop ✅
**Pricing:** tradeoffs ✅ · dev + operational costs ✅ (real quotes pending) · TAM/SAM/SOM ✅ · revenue scenarios ✅ · pricing model + directional pricing ✅
