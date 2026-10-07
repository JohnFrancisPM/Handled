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
