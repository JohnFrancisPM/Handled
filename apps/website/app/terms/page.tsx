// NOTE: This copy is launch-ready boilerplate. A lawyer should review before public launch.
import { Hero } from "@/components/marketing/Hero";
import { Section } from "@/components/layout/Section";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of Service — Handled",
  description: "The terms that govern your use of the Handled website.",
  path: "/terms"
});

const sections: { heading: string; body: string }[] = [
  {
    heading: "Acceptance",
    body: "By using this website you agree to these terms."
  },
  {
    heading: "Use of the site",
    body: "The site is provided for informational and marketing purposes. Don't misuse it, attempt to disrupt it, or submit unlawful content through the form."
  },
  {
    heading: "No warranty / informational content",
    body: "Information on the site (including pricing, features, stats, and roadmap items) is provided \"as is\" and may change. Pricing and feature availability are subject to change; roadmap items are not guarantees."
  },
  {
    heading: "Lead submissions",
    body: "Information you submit is handled per the Privacy Policy. Submitting the form does not create a contract or obligate either party."
  },
  {
    heading: "Intellectual property",
    body: "The Handled name, content, and design are owned by Handled. Don't copy or reuse them without permission."
  },
  {
    heading: "Third-party references",
    body: "Competitor names and prices referenced on the site (e.g., in comparisons) belong to their respective owners and are cited for comparison as of the stated date; they may change."
  },
  {
    heading: "Limitation of liability",
    body: "To the extent permitted by law, Handled is not liable for indirect or consequential damages arising from use of the site."
  },
  {
    heading: "Contact",
    body: `Questions: ${site.contactEmail}.`
  }
];

const LAST_UPDATED = "October 7, 2026";

export default function TermsPage() {
  return (
    <>
      <Hero
        as="h1"
        align="left"
        heading="Terms of Service"
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
