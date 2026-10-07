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
