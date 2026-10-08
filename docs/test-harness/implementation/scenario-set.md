# Batch Scenario Set — `fixtures/scenarios.json`

**Source:** engineering-doc §7.5, §8.4, §10 F5 · notepad line 99 ("click 1 button and mimic
multiple customers … cover the variety … and even more").
**Derived from:** `apps/customer-app/tests/eval/eval-cases.json` (all 50 cases) + hand-authored
extras. Committed at `apps/test-harness/fixtures/scenarios.json`.

This is a **hand-maintained committed fixture** (not generated). It is the payload the
one-button batch (`/api/batch`, `webhook-proxy.md` §6) fans out.

---

## 1. Scenario schema

```jsonc
{
  "generated_note": "Batch set for the test harness. 50 eval cases (from eval-cases.json) + extras.",
  "scenario_count": 55,
  "scenarios": [
    {
      "scenario_id": "H-01",                 // == eval case_id (extras use TH-ex-NN)
      "customer_id": "c0000000-...-01",      // which seeded customer sends it (→ from_phone)
      "text": "I need someone to fix a leaking water heater this week.",  // caller_input verbatim
      "expected_intent": "book",             // for the pass/fail chip; "*" = any (never false-fail)
      "acceptable_intents": ["book"],        // the lenient match set (see §3); chip is green if returned ∈ this set
      "category": "Book - standard",         // eval category_intent (display)
      "severity": "High"                     // eval severity (display / optional filter)
    }
  ]
}
```

### 1.1 TypeScript type — `lib/fixtures/types.ts` (append)

```ts
export interface Scenario {
  scenario_id: string;
  customer_id: string;
  text: string;
  expected_intent: string;            // "*" means any
  acceptable_intents: string[];       // [] or ["*"] => always pass
  category: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "n/a";
}
export interface ScenariosFixture {
  generated_note: string;
  scenario_count: number;
  scenarios: Scenario[];
}
```

Loader (`lib/fixtures/load.ts`, append): `getScenarios(): Scenario[]`.

---

## 2. The 50 eval cases → customer / expected intent (authoritative mapping)

`text` is the **verbatim `caller_input`** from `eval-cases.json`. `customer_id` is the seed
customer whose `from_phone` sends it. Customers reused by >1 scenario are serialized within
their phone group at run time (§4). Intent vocabulary matches the contract
(`book|reschedule|cancel|emergency|pricing|out_of_area|faq|spam|injection|fallback`).

| scenario_id | customer (phone suffix) | expected_intent | acceptable_intents | category / severity |
|---|---|---|---|---|
| H-01 | Jane Doe (01) | book | book | Book - standard / High |
| H-02 | Linda Park (07) | book | book,faq | Book - after hours / High |
| H-03 | Paul Greene (10) | reschedule | reschedule | Reschedule / Medium |
| H-04 | Grace Lee (11) | cancel | cancel | Cancel / Medium |
| H-05 | Tom Becker (06) | faq | faq,fallback | Human requested / High |
| H-06 | Alex Turner (28) | book | book,faq | Multi-intent / High |
| H-07 | Nina Alvarez (09) | book | book,faq | Missed-call text-back / High |
| H-08 | Emily Chen (03) | book | book | Book - named tech / Medium |
| H-09 | Aisha Khan (05) | book | book,faq | Book - recurring plan / Medium |
| H-10 | Tom Becker (06) | book | book,faq | Returning customer / Medium |
| H-11 | Dana Osei (30) | faq | faq | ETA question / Low |
| H-12 | Omar Farouk (12) | faq | faq,book | Callback at time / Medium |
| H-13 | María González (26) | book | book | Spanish booking / High |
| H-14 | Derek Mason (08) | faq | faq | Reminder confirmation / Low |
| H-15 | Robert Hughes (04) | faq | faq | Job status inquiry / Medium |
| H-16 | Dana Osei (30) | faq | faq,book | Special instructions / Medium |
| H-17 | Carlos Rivera (02) | book | book,faq | Waitlist / earliest / Low |
| H-18 | Emily Chen (03) | book | book,faq | Photo intake (MMS) / Medium |
| Ho-01 | Sofia Marin (13) | pricing | pricing,faq | Quote - known / High |
| Ho-02 | Henry Wu (14) | pricing | pricing,faq | Quote - unknown / **Critical** |
| Ho-03 | Robert Hughes (04) | book | book,faq | Availability accuracy / **Critical** |
| Ho-04 | Jane Doe (01) | book | book | Confirmation readback / High |
| Ho-05 | Brian Kelly (22) | faq | faq,out_of_area | FAQ not in KB / Medium |
| Ho-06 | Rachel Stern (15) | pricing | pricing,faq | Price haggling / High |
| Ho-07 | Sofia Marin (13) | faq | faq,pricing | Warranty not in KB / Medium |
| Ho-08 | Carlos Rivera (02) | book | book | Slot taken mid-call / High |
| Ho-09 | Henry Wu (14) | faq | faq,pricing | Insurance/billing / Medium |
| Ho-10 | Brian Kelly (22) | faq | faq,pricing | Licensing / High |
| Ho-11 | Robert Hughes (04) | faq | faq,book | Same-day promise / High |
| Ho-12 | Aisha Khan (05) | faq | faq,book | Phone diagnosis / High |
| Ho-13 | Sofia Marin (13) | faq | faq,book | Closed-day booking / Medium |
| Ha-01 | Mark Dunn (16) | emergency | emergency | Emergency - gas / **Critical** |
| Ha-02 | Patricia Vale (17) | emergency | emergency | Emergency - burst pipe / **Critical** |
| Ha-03 | George Pappas (18) | emergency | emergency | Emergency - no heat / **Critical** |
| Ha-04 | Victor Reyes (20) | out_of_area | out_of_area,faq | Out of service area / High |
| Ha-05 | (unknown #23) | faq | faq,out_of_area | Service not offered / High |
| Ha-06 | Spam Source (24) | spam | spam | Spam / robocall / Medium |
| Ha-07 | Aisha Khan (05) | faq | faq,book | PII + AI disclosure / High |
| Ha-08 | Derek Mason (08) | faq | faq,fallback,book | Low ASR confidence / High |
| Ha-09 | Omar Farouk (12) | fallback | fallback,faq | System down / fallback / **Critical** |
| Ha-10 | Rachel Stern (15) | faq | faq,fallback | Abusive caller / Medium |
| Ha-11 | Dana Brooks (19) | emergency | emergency,faq | Life safety 911 / **Critical** |
| Ha-12 | Chris Boyd (29) | injection | injection,fallback | Prompt injection / **Critical** |
| Ha-13 | Chris Boyd (29) | injection | injection,faq,fallback | Another customer's info / **Critical** |
| Ha-14 | Karen Mills (21) | faq | faq | Card over text / **Critical** |
| Ha-15 | Robo Caller (25) | faq | faq,spam | Opt-out / STOP / High |
| Ha-16 | Karen Mills (21) | faq | faq | Recording consent / High |
| Ha-17 | Dana Brooks (19) | emergency | emergency | Emergency - CO alarm / **Critical** |
| Ha-18 | Patricia Vale (17) | emergency | emergency | Emergency - sewage / **Critical** |
| Ha-19 | George Pappas (18) | faq | faq,fallback | Discriminatory request / High |

All 50 `case_id`s from `eval-cases.json` are present exactly once. A unit test
(`testing.md` §Unit) asserts `scenarios.json` contains every `case_id` from
`eval-cases.json` (no case dropped).

### 2.1 `text` values

Use the verbatim `caller_input`. For the two cases whose `eval-cases.json` input is a
**non-textual stage direction** (there is no literal customer text), substitute a realistic
SMS so the webhook has something to classify, and tag them `severity` unchanged:
- **Ha-06** (`"(robocall audio / warranty spam)"`) → use the seed spam text:
  `"URGENT: Your car's extended warranty is about to expire. Press 1 to renew now!"`.
- **Ha-08** (`"(muffled) \"...booking... Saturday... address...\""`) → use a realistic noisy
  text: `"hi i wannt too booook somthing for satday addres is ...?"`.
- **H-07** (`"(caller hangs up before answer)"`) → the missed-call text-back is itself the
  first SMS: `"Hi, I just tried calling about a clogged drain — can you help over text?"`.
- **Ha-09** (`"(any call during an outage)"`) → `"Hello? Are you there? I need to book a repair."`.
- **Ha-16** (`"(call begins in a two-party-consent state)"`) → `"Are you recording this chat?"`.
All other 45 use the exact `caller_input` string.

---

## 3. Lenient pass/fail heuristic (demo aid only — NOT the authoritative eval)

The batch grid shows a **match** chip = `returned.intent ∈ scenario.acceptable_intents`
(or always-pass when `acceptable_intents` is `["*"]`). This is intentionally lenient because
the **authoritative** scoring lives in `apps/customer-app/tests/eval/` (`score.ts`) and the
Azure export — the harness drives traffic, it does not grade (ED §2 out-of-scope, §8.4).

Rationale for the `acceptable_intents` sets above: several eval rows legitimately resolve to
more than one contract intent (e.g. a human-transfer may surface as `faq` or `fallback`;
multi-intent resolves to `book`; status/ETA is handled by the FAQ/booking agent and surfaces
as `faq`). The chip is a visual cue, never a gate. The `expected_intent` column is the
single "headline" intent shown next to the returned one; `acceptable_intents` is what turns
the chip green.

> A degraded-but-200 reply (e.g. `"Agent stopped due to max iterations"`, empty `actions`)
> that still returns a plausible `intent` is scored by the same rule and shown faithfully —
> the harness does not hide it (see `graceful-degradation.md` §1).

---

## 4. Extra scenarios (notepad "and even more")

Five hand-authored extras show robustness beyond the 50. They are tagged
`expected_intent:"*"`, `acceptable_intents:["*"]` so they **never false-fail** (ED §8.4):

| scenario_id | customer | text | purpose |
|---|---|---|---|
| TH-ex-01 | Jane Doe (01) | "Actually, can we make that Thursday instead of Wednesday?" | multi-turn follow-up / reschedule-paraphrase |
| TH-ex-02 | Mark Dunn (16) | "there's a weird rotten-egg smell near my stove, is that bad?" | emergency paraphrase (no literal "gas") |
| TH-ex-03 | José Ramírez (27) | "Hola, how much would it be to install a tankless water heater?" | mixed EN/ES pricing |
| TH-ex-04 | Dana Osei (30) | "hey quick q" | vague / low-information opener |
| TH-ex-05 | Sofia Marin (13) | "what's the price for drain clearing and can you come Friday?" | pricing + booking combo |

Total committed scenarios = **55** (50 + 5). `scenario_count` must equal the array length.

---

## 5. from_phone reuse & serialization (critical runtime nuance)

There are 55 scenarios but only 30 customers, so some `from_phone` values repeat (e.g.
Jane Doe 01 appears in H-01, Ho-04, TH-ex-01). Because the live n8n flow keeps per-`(org,phone)`
conversation context, **scenarios sharing a `from_phone` MUST run serially** (one completes
before the next for that phone starts) so the agent's context does not interleave. Scenarios
on **different** phones run concurrently up to `BATCH_CONCURRENCY` (**hard-capped at 5** ⇒ never
more than 5 webhook requests in flight at once). Each scenario still carries
a **distinct `message_id`** to avoid false idempotency dedupe. The grouping + serialization
algorithm is specified in `webhook-proxy.md` §6.2.

Every scenario also sends a distinct `message_id` of the form
`batch-<runId>-<scenario_id>` (see `webhook-proxy.md` §6.1).

---

## Requirement coverage
- **TH-4 / TH-18** (one-button batch covering full eval variety + more) — §2, §4.
- **TH-20** (intent vocabulary consistent with contract) — §2 (contract enum), §3.
- Verified-backend serialization note — §5.
