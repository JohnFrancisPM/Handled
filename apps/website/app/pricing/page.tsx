import { Check } from "lucide-react";
import { Hero } from "@/components/marketing/Hero";
import { PricingTable } from "@/components/marketing/PricingTable";
import { ComparisonTable } from "@/components/marketing/ComparisonTable";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Section } from "@/components/layout/Section";
import { pricingTiers, pricingPromise } from "@/content/pricing";
import { pricingComparison, pricingComparisonNote } from "@/content/comparison";
import { pricingFaqs } from "@/content/faqs";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Pricing — Handled AI office manager",
  description:
    "Flat monthly pricing with a hard spend cap and no charge for spam calls. Starter $149, Pro $299, Scale $599. Priced like a premium AI receptionist while booking real jobs.",
  path: "/pricing"
});

export default function PricingPage() {
  return (
    <>
      <Hero
        as="h1"
        eyebrow="Pricing"
        heading="Flat, transparent pricing. One captured job pays for months."
        subheading="No per-minute billing. No surprise overage. No charge for spam. Pick the plan that fits your shop."
        primaryCta={{ label: "Book a demo", href: "/contact" }}
      />

      <Section>
        <PricingTable tiers={pricingTiers} />
      </Section>

      <Section surface>
        <div className="mx-auto max-w-[760px] flex flex-col gap-6">
          <h2 className="type-h2 text-grey-900">{pricingPromise.heading}</h2>
          <ul className="flex flex-col gap-3">
            {pricingPromise.points.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <Check size={20} className="mt-[2px] shrink-0 text-brand" aria-hidden="true" />
                <span className="type-body-lg text-grey-900">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-8">
          <h2 className="type-h2 text-grey-900">Priced like a premium AI receptionist — doing far more.</h2>
          <ComparisonTable variant="pricing" rows={pricingComparison} note={pricingComparisonNote} />
        </div>
      </Section>

      <Section surface>
        <div className="mx-auto max-w-[760px] flex flex-col gap-8">
          <h2 className="type-h2 text-grey-900">Pricing questions</h2>
          <FaqAccordion faqs={pricingFaqs} />
        </div>
      </Section>

      <CtaBand heading="Not sure which plan? Let's talk." />
    </>
  );
}
