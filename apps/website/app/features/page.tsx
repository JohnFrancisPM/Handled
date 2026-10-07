import Link from "next/link";
import { Hero } from "@/components/marketing/Hero";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Section } from "@/components/layout/Section";
import { features } from "@/content/features";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Features — Handled AI office manager",
  description:
    "24/7 answering, dispatch-grade booking into your FSM, address checks, SMS confirmations, missed-call text-back, emergency triage, spam filtering, and transcripts.",
  path: "/features"
});

export default function FeaturesPage() {
  const liveFeatures = features.filter((f) => f.status === "live");
  const roadmapFeatures = features.filter((f) => f.status === "roadmap");

  return (
    <>
      <Hero
        as="h1"
        align="left"
        eyebrow="Features"
        heading="Everything an office manager does — answered, booked, followed up."
        subheading="Handled handles the whole call, not just the hello. Here's what it does for your shop."
        primaryCta={{ label: "Book a demo", href: "/contact" }}
      />

      <Section>
        <div className="flex flex-col gap-8">
          <h2 className="type-h2 text-grey-900">What Handled does today</h2>
          <FeatureGrid features={liveFeatures} columns={3} />
        </div>
      </Section>

      <Section surface>
        <div className="flex flex-col gap-8">
          <h2 className="type-h2 text-grey-900">On the roadmap</h2>
          <FeatureGrid features={roadmapFeatures} columns={2} />
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <h2 className="type-h3 text-grey-900">How it comes together</h2>
          <p className="type-body-lg text-grey-500 max-w-[70ch]">
            See the onboarding flow on{" "}
            <Link href="/how-it-works" className="text-brand underline hover:text-brand-600">
              how it works
            </Link>{" "}
            and the field-service systems Handled books into on{" "}
            <Link href="/integrations" className="text-brand underline hover:text-brand-600">
              integrations
            </Link>
            .
          </p>
        </div>
      </Section>

      <CtaBand heading="See every feature in action." />
    </>
  );
}
