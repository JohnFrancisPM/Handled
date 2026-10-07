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
