export type Step = { number: number; title: string; body: string };

export const onboardingSteps: Step[] = [
  { number: 1, title: "Connect your number & FSM",
    body: "Point your business number at Handled and connect Jobber, Housecall Pro, or ServiceTitan in a couple of clicks." },
  { number: 2, title: "Paste your website & set your rules",
    body: "Handled reads your site to learn your services, pricing, hours, and service area. Set your booking and emergency rules — no 40-field form." },
  { number: 3, title: "Go live in minutes",
    body: "Handled starts answering, booking, and texting back right away. Review transcripts and summaries any time and correct anything." }
];
