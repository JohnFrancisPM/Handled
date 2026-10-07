// NOTE: This copy is launch-ready boilerplate tailored to what the site does
// (collects demo-request leads, no tracking). A lawyer should review before public launch.
import { Hero } from "@/components/marketing/Hero";
import { Section } from "@/components/layout/Section";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy — Handled",
  description: "How Handled collects, uses, and protects the information you submit through our website.",
  path: "/privacy",
  noindex: false
});

const sections: { heading: string; body: string }[] = [
  {
    heading: "What we collect",
    body: "When you submit the \"Book a demo\" form we collect the information you provide: your name, business name, email, and optionally phone number, trade, weekly call volume, plan interest, and message. We also record the page you submitted from and your browser's user-agent for coarse attribution. We do not collect any other personal information through this website."
  },
  {
    heading: "Why we collect it",
    body: "Solely to contact you about Handled and respond to your demo request. We do not sell or share your information with third parties for advertising."
  },
  {
    heading: "Consent",
    body: "We collect this information only when you actively submit the form. By submitting, you agree to be contacted about Handled."
  },
  {
    heading: "How it's stored & protected",
    body: "Submissions are transmitted over HTTPS and stored encrypted at rest in our database (Supabase/Postgres). Access is restricted to our team via a server-side service role; the browser never has direct database access."
  },
  {
    heading: "Cookies & tracking",
    body: "This website uses no non-essential cookies and no third-party advertising or analytics trackers. Any cookies are strictly functional."
  },
  {
    heading: "Data retention",
    body: "We keep demo-request data only as long as needed to evaluate and follow up on your interest, and we periodically purge non-converted leads (target: within 24 months). You may request deletion at any time (see Contact)."
  },
  {
    heading: "Your choices / contact",
    body: `To access, correct, or delete your information, email ${site.contactEmail}.`
  },
  {
    heading: "Children",
    body: "The site and product are not directed to children under 13."
  },
  {
    heading: "Changes",
    body: "We may update this policy; the \"Last updated\" date reflects the latest version."
  }
];

const LAST_UPDATED = "October 7, 2026";

export default function PrivacyPage() {
  return (
    <>
      <Hero
        as="h1"
        align="left"
        heading="Privacy Policy"
        subheading={`Last updated: ${LAST_UPDATED}`}
        primaryCta={site.primaryCta}
      />
      <Section>
        <div className="flex max-w-[760px] flex-col gap-10">
          {sections.map((s) => (
            <div key={s.heading} className="flex flex-col gap-3">
              <h2 className="type-h5 text-grey-900">{s.heading}</h2>
              <p className="type-body-lg text-grey-500">{s.body}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
