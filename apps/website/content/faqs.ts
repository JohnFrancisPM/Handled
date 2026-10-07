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
