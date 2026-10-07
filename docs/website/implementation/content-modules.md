# Spec: Content Modules (`content/*.ts`)

**App:** `apps/website`
**Implements:** R6, R7, R9, R10, R11, R12, R13, R14, R15, R16, R18, R19, R35, R40
**Depends on:** `project-setup.md`
**Why:** ED §5 requires all copy, stats, pricing, FAQ, and comparison data to live in **typed `content/*.ts` modules** so pages stay declarative and content is reviewable in one place. This spec gives every module its exact type and verbatim content. **Build pages from these — do not invent copy.**

All strings below are the launch copy. Numbers trace to the PRD (§1 stats, §9 pricing) and Competitive Research (competitor prices). Messaging deliberately leads on **workflow depth** and **trust/billing transparency**, and never claims to beat anyone on voice quality (Competitive Research §8; R35).

---

## 1. `content/site.ts` — global site constants

```ts
export const site = {
  name: "Handled",
  domain: "handled.ai",
  url: "https://handled.ai",
  tagline: "The AI office manager for home & local service businesses",
  positioning:
    "Handled is an AI office manager that answers every call, books the job into your field-service schedule, and follows up — so you stop losing revenue to the competitor who picked up first.",
  primaryCta: { label: "Book a demo", href: "/contact" },
  secondaryCta: { label: "See how it works", href: "/how-it-works" },
  contactEmail: "hello@handled.ai",
  trades: [
    "Plumbing", "HVAC", "Electrical", "Roofing",
    "Landscaping", "Cleaning", "Pest control", "Garage doors", "Other"
  ] as const
} as const;
```

The `trades` array is the single source for the demo form's trade dropdown (R40) and any trade chips on marketing pages.

---

## 2. `content/nav.ts` — navigation + footer links

```ts
export type NavLink = { label: string; href: string };

export const primaryNav: NavLink[] = [
  { label: "Why Handled", href: "/why-handled" },
  { label: "Features", href: "/features" },
  { label: "Integrations", href: "/integrations" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" }
];

export const footerNav: { heading: string; links: NavLink[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Why Handled", href: "/why-handled" },
      { label: "Features", href: "/features" },
      { label: "Integrations", href: "/integrations" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Pricing", href: "/pricing" }
    ]
  },
  {
    heading: "Company",
    links: [{ label: "Book a demo", href: "/contact" }]
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" }
    ]
  }
];
```

---

## 3. `content/stats.ts` — the missed-call pain stats (R7)

Every figure is from PRD §1. Do not alter numbers.

```ts
export type Stat = { value: string; label: string; source: string };

export const missedCallStats: Stat[] = [
  { value: "27%", label: "of inbound calls to home-service businesses go unanswered", source: "Invoca, 2026" },
  { value: "52%", label: "of calls are answered by a live person", source: "Invoca, 2026" },
  { value: "62%", label: "of callers who don't get through immediately call a competitor", source: "Missed-call benchmarks, 2026" },
  { value: "85%", label: "of those callers never call back", source: "Missed-call benchmarks, 2026" },
  { value: "~$1,200", label: "average value of a single missed home-services call", source: "Invoca, 2026" }
];
```

---

## 4. `content/features.ts` — product capabilities (R12)

Each feature has an icon (lucide name), title, blurb, and a `status`: `"live"` or `"roadmap"`. Roadmap items are explicitly labeled (ED §10 F5). Capabilities derive from PRD §2 functional requirements.

```ts
import type { LucideIcon } from "lucide-react";

export type Feature = {
  icon: string;          // lucide-react icon name, resolved in the component
  title: string;
  blurb: string;
  status: "live" | "roadmap";
};

export const features: Feature[] = [
  { icon: "PhoneCall", title: "24/7 natural-language answering",
    blurb: "Every call answered around the clock in a natural conversation — no phone tree, no voicemail. Callers just talk.", status: "live" },
  { icon: "CalendarCheck", title: "Books real jobs into your FSM",
    blurb: "Checks live availability and creates the job in Jobber, Housecall Pro, or ServiceTitan — respecting tech skills, availability, and service area.", status: "live" },
  { icon: "MapPin", title: "Address & service-area check",
    blurb: "Validates the caller's address against your service radius so you're never booked outside the area you cover.", status: "live" },
  { icon: "MessageSquare", title: "SMS confirmations",
    blurb: "Sends the caller a text with the appointment details the moment the job is booked.", status: "live" },
  { icon: "MessageCircleReply", title: "Missed-call text-back",
    blurb: "If a call is abandoned or overflows, Handled texts the caller within seconds and continues the booking over SMS.", status: "live" },
  { icon: "Siren", title: "Trade-aware emergency triage",
    blurb: "Recognizes a burst pipe, gas smell, or no-heat-in-winter as urgent and escalates to your on-call tech immediately.", status: "live" },
  { icon: "ShieldX", title: "Spam & robocall filtering",
    blurb: "Screens junk so you're never notified — or charged — for spam calls and hangups.", status: "live" },
  { icon: "FileText", title: "Transcripts, summaries & owner notify",
    blurb: "Every call produces a transcript, a structured summary, and an owner notification so you can see exactly what Handled did.", status: "live" },
  { icon: "Send", title: "Outbound follow-up",
    blurb: "Quote follow-ups, appointment reminders, and review requests — tied to the job record.", status: "roadmap" },
  { icon: "Languages", title: "Spanish support",
    blurb: "Bilingual English/Spanish answering for your callers and crews.", status: "roadmap" }
];
```

> Icon names map to `lucide-react` exports; the rendering component (`FeatureCard`) imports them dynamically via a name→icon map (see `components.md`).

---

## 5. `content/differentiators.ts` — the four moats (R9, R10, R35)

These are the Why-Handled page blocks. The umbrella narrative is **workflow depth: Handled does the office manager's job, not a receptionist's**. Content traces to PRD §1 MOAT, notepad, and ED §1.

```ts
export type Differentiator = {
  icon: string;
  title: string;
  summary: string;      // one-line claim
  body: string;         // the paragraph
  points: string[];     // concrete sub-claims / bullets
};

export const workflowDepthIntro = {
  eyebrow: "Why Handled is different",
  heading: "A receptionist takes a message. Handled does the office manager's job.",
  body:
    "Answering the phone is table stakes — the $11B voice incumbent already owns voice quality. The real leak is everything that happens after \"hello\": qualifying the job, checking who's actually available, booking it into dispatch, triaging the emergencies, texting back the callers you missed, and chasing the quotes. That depth of workflow is what an office manager does, and it's what Handled does. It's the part competitors skip."
};

export const differentiators: Differentiator[] = [
  {
    icon: "CalendarCheck",
    title: "Dispatch-grade FSM integration",
    summary: "Books real jobs into your field-service system — not a generic calendar event.",
    body:
      "Most AI receptionists drop an event on a Google Calendar. Handled books the actual job into Jobber, Housecall Pro, or ServiceTitan, respecting technician skills, live availability, and your service area. Deep two-way FSM integration is hard to build, sticky once installed, and exactly what this business needs.",
    points: [
      "Live availability check before any slot is offered",
      "Respects technician skills, schedule, and service radius",
      "Creates the real job record in your FSM, not a calendar hold",
      "Verbatim confirmation to the caller before the booking is written"
    ]
  },
  {
    icon: "Briefcase",
    title: "Office-manager scope",
    summary: "Missed-call text-back, quote follow-up, reminders, and review requests — all tied to the job.",
    body:
      "Handled doesn't stop at booking. It texts back the callers you miss, chases quotes that haven't been accepted, sends appointment reminders, and asks for reviews — all tied to the same job record. That expands revenue per customer and raises the cost of ever switching away.",
    points: [
      "Missed-call text-back within seconds",
      "Automated quote follow-up and reminders (roadmap)",
      "Review requests after the job (roadmap)",
      "Everything linked to the job record, not a separate inbox"
    ]
  },
  {
    icon: "Siren",
    title: "Trade-aware emergency triage",
    summary: "Knows a burst pipe from a leaky faucet — and escalates the real emergencies.",
    body:
      "Handled recognizes a gas smell, a burst pipe, or no heat in winter as urgent and escalates to your on-call tech immediately, while routine jobs get booked into the next available slot. Generic tools either miss this or over-escalate. The system is designed to err toward human escalation — a false alarm is cheap, a missed emergency is not.",
    points: [
      "Recognizes urgent trade scenarios in natural speech",
      "Warm-transfers or pages the on-call tech",
      "Owner-configurable emergency rules",
      "Biased toward escalation for safety"
    ]
  },
  {
    icon: "ShieldCheck",
    title: "Trust & transparent pricing",
    summary: "Flat pricing, hard spend caps, and no charge for spam or hangups.",
    body:
      "Surprise billing and overage are the #1 complaint across every competitor. Handled ships flat monthly pricing with a hard spend cap and never charges you for spam calls or hangups. You always know what you'll pay — and one captured ~$1,200 job pays for months of service.",
    points: [
      "Flat monthly price, no per-minute surprises",
      "Hard spend cap you control",
      "No charge for spam calls or hangups",
      "One captured job pays for months"
    ]
  }
];
```

---

## 6. `content/comparison.ts` — "Handled vs an AI receptionist" + pricing comparison (R11, R14, R35)

Two tables share this module.

### 6.1 Capability comparison (Why Handled page)

```ts
export type ComparisonRow = { capability: string; handled: boolean | string; receptionist: boolean | string };

export const capabilityComparison: ComparisonRow[] = [
  { capability: "Answers every call 24/7", handled: true, receptionist: true },
  { capability: "Natural conversation, no phone tree", handled: true, receptionist: true },
  { capability: "Books into your FSM (Jobber / Housecall Pro / ServiceTitan)", handled: true, receptionist: "Calendar event only" },
  { capability: "Respects tech skills, availability & service area", handled: true, receptionist: false },
  { capability: "Address / service-area validation", handled: true, receptionist: false },
  { capability: "Trade-aware emergency triage & escalation", handled: true, receptionist: false },
  { capability: "Missed-call text-back", handled: true, receptionist: "Sometimes" },
  { capability: "Quote follow-up, reminders, review requests", handled: "Office-manager scope", receptionist: false },
  { capability: "Flat pricing, no charge for spam/hangups", handled: true, receptionist: "Surprise overage" },
  { capability: "Transcripts, summaries & owner notify", handled: true, receptionist: true }
];
```

### 6.2 Pricing comparison (Pricing page) — anchors the premium tier (R14)

Competitor prices are confirmed figures from Competitive Research §3. Handled's Pro tier ($299) sits at the premium AI-receptionist price band (reception.ai Premium $199, Smith.ai Starter $300) while doing strictly more.

```ts
export type PriceCompareRow = {
  product: string;
  price: string;
  booksIntoFsm: boolean;
  officeManagerScope: boolean;
  emergencyTriage: boolean;
  transparentPricing: boolean;
  highlight?: boolean;        // true for Handled's row
};

export const pricingComparison: PriceCompareRow[] = [
  { product: "Handled Pro", price: "$299/mo", booksIntoFsm: true, officeManagerScope: true, emergencyTriage: true, transparentPricing: true, highlight: true },
  { product: "reception.ai Premium (ElevenLabs)", price: "$199/mo", booksIntoFsm: false, officeManagerScope: false, emergencyTriage: false, transparentPricing: false },
  { product: "Smith.ai Starter", price: "$300/mo", booksIntoFsm: false, officeManagerScope: false, emergencyTriage: false, transparentPricing: false },
  { product: "A full-time office manager", price: "$42K–$62K/yr", booksIntoFsm: true, officeManagerScope: true, emergencyTriage: true, transparentPricing: true }
];

export const pricingComparisonNote =
  "Handled is priced at the same level as a premium AI receptionist — while booking real jobs into your dispatch, handling office-manager work, and triaging emergencies. And it costs a fraction of a $42–62K/yr human office manager.";
```

> Competitor comparison framing is factual and sourced; it never claims Handled has better voice quality (R35). All competitor prices match Competitive Research §3 exactly.

---

## 7. `content/pricing.ts` — the three tiers (R13, R15, R17)

Numbers from PRD §9 Directional Pricing. **Pro is the premium / most-popular tier** anchored to competitor pricing (ED Appendix A.1).

```ts
export type PricingTier = {
  id: "starter" | "pro" | "scale";
  name: string;
  price: string;            // monthly
  priceNote: string;
  tagline: string;
  mostPopular: boolean;
  cta: { label: string; href: string };   // href carries ?plan= prefill
  features: string[];
};

export const pricingTiers: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$149",
    priceNote: "per month",
    tagline: "For the solo operator",
    mostPopular: false,
    cta: { label: "Book a demo", href: "/contact?plan=starter" },
    features: [
      "1 business number",
      "24/7 answering + booking into 1 FSM",
      "Missed-call text-back",
      "Call transcripts & summaries",
      "Spam & robocall filtering",
      "Hard spend cap — no surprise overage"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: "$299",
    priceNote: "per month",
    tagline: "For small teams (2–10)",
    mostPopular: true,
    cta: { label: "Book a demo", href: "/contact?plan=pro" },
    features: [
      "Everything in Starter",
      "Trade-aware emergency triage & warm transfer",
      "Multi-technician dispatch logic",
      "Outbound follow-up (quotes, reminders, reviews)",
      "Spanish support",
      "Owner dashboard"
    ]
  },
  {
    id: "scale",
    name: "Scale",
    price: "$599",
    priceNote: "per month",
    tagline: "For multi-location / high volume",
    mostPopular: false,
    cta: { label: "Book a demo", href: "/contact?plan=scale" },
    features: [
      "Everything in Pro",
      "Multiple numbers & locations",
      "Priority support",
      "Call intelligence (sentiment, tagging, trends)"
    ]
  }
];

export const pricingPromise = {
  heading: "Pricing you can actually trust",
  points: [
    "Flat monthly price — no opaque per-minute billing",
    "A hard spend cap you set and control",
    "Never charged for spam calls or hangups",
    "One captured ~$1,200 job pays for months of Handled"
  ]
};
```

Note: feature lists reflect the PRD §9 tier table and §4 roadmap (emergency triage, multi-FSM, outbound, Spanish, dashboard are Pro+; call intelligence is Scale). Roadmap capabilities are presented as tier inclusions per the PRD's forward-looking pricing table; the Features page separately labels not-yet-live items as "Roadmap" (R12). Keep the two consistent: anything marked `status:"roadmap"` in `features.ts` must not be implied as shipping-today on the Home hero.

---

## 8. `content/faqs.ts` — pricing & general FAQ (R16)

```ts
export type Faq = { question: string; answer: string };

export const pricingFaqs: Faq[] = [
  { question: "How does the pricing work?",
    answer: "Flat monthly tiers with transparent included usage and a hard spend cap. No per-minute metering, no surprise overage. You always know your bill before it arrives." },
  { question: "Do I get charged for spam or hangups?",
    answer: "No. Handled filters spam and robocalls, and you're never charged or notified for junk calls or hangups." },
  { question: "What if I go over my included usage?",
    answer: "You set a hard spend cap. Handled alerts you as you approach it and will not silently run up your bill." },
  { question: "Which field-service systems do you book into?",
    answer: "Jobber, Housecall Pro, and ServiceTitan. Handled checks live availability and creates the real job — not just a calendar event." },
  { question: "How long does setup take?",
    answer: "Minutes. Connect your number and FSM, paste your website so Handled learns your services and rules, and go live — no 40-field form." },
  { question: "Is there a contract?",
    answer: "No long-term lock-in. Pricing is month-to-month and transparent by design." },
  { question: "How is this different from an AI receptionist?",
    answer: "A receptionist answers and takes a message. Handled does the office manager's job — qualifies, checks real availability, books into dispatch, triages emergencies, texts back missed callers, and follows up." }
];
```

---

## 9. `content/integrations.ts` — FSM vendors + "how booking works" (R18)

```ts
export type Integration = { name: string; logo: string; blurb: string };

export const integrations: Integration[] = [
  { name: "Jobber", logo: "/integrations/jobber.svg",
    blurb: "Books jobs into Jobber with the right service, time, and technician — respecting availability and service area." },
  { name: "Housecall Pro", logo: "/integrations/housecall-pro.svg",
    blurb: "Creates real Housecall Pro jobs from live calls, with address and service-area validation built in." },
  { name: "ServiceTitan", logo: "/integrations/servicetitan.svg",
    blurb: "Dispatch-grade booking into ServiceTitan that respects tech skills, schedules, and your coverage map." }
];

export const bookingSteps: { title: string; body: string }[] = [
  { title: "1. Check real availability",
    body: "Handled queries your FSM for an actual open slot that matches the service, the tech's skills, and your service area — never a guess." },
  { title: "2. Confirm verbatim",
    body: "The caller hears the service, time, and address read back and confirms before anything is written." },
  { title: "3. Create the job",
    body: "Handled creates the real job in your FSM and texts the caller a confirmation — then notifies you with a summary." }
];
```

> Logos: if official vendor marks aren't available at build time, use a simple text-label chip styled per design tokens (see `components.md` LogoCloud). Do not block the build on image assets.

---

## 10. `content/steps.ts` — how-it-works onboarding (R19)

```ts
export type Step = { number: number; title: string; body: string };

export const onboardingSteps: Step[] = [
  { number: 1, title: "Connect your number & FSM",
    body: "Point your business number at Handled and connect Jobber, Housecall Pro, or ServiceTitan in a couple of clicks." },
  { number: 2, title: "Paste your website & set your rules",
    body: "Handled reads your site to learn your services, pricing, hours, and service area. Set your booking and emergency rules — no 40-field form." },
  { number: 3, title: "Go live in minutes",
    body: "Handled starts answering, booking, and texting back right away. Review transcripts and summaries any time and correct anything." }
];
```

---

## 11. `content/testimonials.ts` — social proof (R8)

These are **illustrative/placeholder** testimonials for the marketing layout (the PRD has no first-party quotes yet — PRD "Open Questions" flags customer-discovery quotes as pending). Mark them clearly in code with a comment so they're swapped before any real launch. For the demo they render as realistic owner quotes.

```ts
export type Testimonial = { quote: string; name: string; business: string; trade: string };

// NOTE: Illustrative placeholders for layout/demo. Replace with real quotes before public launch (PRD open question: customer-discovery quotes pending).
export const testimonials: Testimonial[] = [
  { quote: "I was losing jobs every time I was under a sink. Now every call gets answered and booked — I stopped bleeding work to the shop down the road.",
    name: "Mike R.", business: "Acme Plumbing", trade: "Plumbing" },
  { quote: "It books straight into Housecall Pro with the right tech and time. It's not a message service — it actually does the dispatch.",
    name: "Dana L.", business: "Comfort HVAC", trade: "HVAC" }
];
```

---

## 12. Acceptance criteria

- Every page spec imports its data from these modules; no page hardcodes marketing copy.
- All numbers match their source: stats = PRD §1; tier prices = PRD §9 ($149/$299/$599); competitor prices = Competitive Research §3 (reception.ai $199, Smith.ai $300).
- `trades` array drives the form dropdown and matches the ED §7 `trade` list exactly.
- Pro tier has `mostPopular: true`; its CTA href is `/contact?plan=pro`.
- No content claims Handled has superior voice quality (R35); differentiation reads on workflow depth + trust.
- Roadmap features carry `status: "roadmap"` and are visually labeled by the rendering component.
- Testimonials carry the "illustrative placeholder" comment.
- Each module is covered by a shape unit test (`testing.md`).
