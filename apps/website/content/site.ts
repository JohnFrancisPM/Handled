export const site = {
  name: "Handled",
  domain: "handled.ai",
  url: "https://handled.ai",
  tagline: "The AI office manager for home & local service businesses",
  positioning:
    "Handled is an AI office manager that answers every call, books the job into your field-service schedule, and follows up — so you stop losing revenue to the competitor who picked up first.",
  primaryCta: { label: "Book a demo", href: "/contact" },
  secondaryCta: { label: "See how it works", href: "/how-it-works" },
  // External link to the customer dashboard app (separate Netlify site).
  loginCta: { label: "Log in", href: "https://handled-customer-app.netlify.app/login" },
  contactEmail: "hello@handled.ai",
  trades: [
    "Plumbing", "HVAC", "Electrical", "Roofing",
    "Landscaping", "Cleaning", "Pest control", "Garage doors", "Other"
  ] as const
} as const;
