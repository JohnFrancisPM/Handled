import { Hero } from "@/components/marketing/Hero";
import { DifferentiatorBlock } from "@/components/marketing/DifferentiatorBlock";
import { ComparisonTable } from "@/components/marketing/ComparisonTable";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Section } from "@/components/layout/Section";
import { workflowDepthIntro, differentiators } from "@/content/differentiators";
import { capabilityComparison } from "@/content/comparison";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Why Handled — the office manager, not just a receptionist",
  description:
    "A receptionist takes a message. Handled books real jobs into your FSM, handles office-manager work, and triages emergencies. See the four reasons shops choose Handled.",
  path: "/why-handled"
});

export default function WhyHandledPage() {
  return (
    <>
      <Hero
        as="h1"
        align="left"
        eyebrow={workflowDepthIntro.eyebrow}
        heading={workflowDepthIntro.heading}
        subheading={workflowDepthIntro.body}
        primaryCta={{ label: "Book a demo", href: "/contact" }}
      />

      <Section>
        <div className="flex flex-col gap-16 md:gap-24">
          {differentiators.map((item, index) => (
            <DifferentiatorBlock key={item.title} item={item} index={index} />
          ))}
        </div>
      </Section>

      <Section surface>
        <div className="flex flex-col gap-8">
          <h2 className="type-h2 text-grey-900">Handled vs. a typical AI receptionist</h2>
          <ComparisonTable
            variant="capability"
            rows={capabilityComparison}
            colA="Handled"
            colB="A typical AI receptionist"
          />
          <p className="type-body-lg text-grey-500 max-w-[70ch]">
            We don&apos;t compete on how the voice sounds — the incumbent owns that. We compete on everything that happens after &ldquo;hello.&rdquo;
          </p>
        </div>
      </Section>

      <CtaBand heading="See the office manager your shop never hired." />
    </>
  );
}
