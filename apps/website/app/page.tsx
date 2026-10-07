import Link from "next/link";
import { PhoneCall, CalendarCheck, Send } from "lucide-react";
import { Hero } from "@/components/marketing/Hero";
import { StatBand } from "@/components/marketing/StatBand";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { StepList } from "@/components/marketing/StepList";
import { LogoCloud } from "@/components/marketing/LogoCloud";
import { Testimonial } from "@/components/marketing/Testimonial";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { site } from "@/content/site";
import { missedCallStats } from "@/content/stats";
import { features } from "@/content/features";
import { onboardingSteps } from "@/content/steps";
import { integrations } from "@/content/integrations";
import { testimonials } from "@/content/testimonials";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Handled — The AI office manager for home & service businesses",
  description:
    "Handled answers every call, books the job into Jobber, Housecall Pro, or ServiceTitan, and follows up — so you stop losing revenue to the competitor who picked up first.",
  path: "/"
});

const miniPoints = [
  { icon: PhoneCall, title: "Answer", body: "Every call picked up 24/7 in a natural conversation." },
  { icon: CalendarCheck, title: "Book", body: "Real jobs created in your FSM — not a calendar hold." },
  { icon: Send, title: "Follow up", body: "Missed-call text-back, reminders, and review requests." }
];

export default function HomePage() {
  const liveFeatures = features.filter((f) => f.status === "live");
  const firstTestimonial = testimonials[0];

  return (
    <>
      <Hero
        as="h1"
        eyebrow="The AI office manager for home & local service businesses"
        heading="Stop losing jobs to the competitor who picked up first."
        subheading={site.positioning}
        primaryCta={{ label: "Book a demo", href: "/contact" }}
        secondaryCta={{ label: "See how it works", href: "/how-it-works" }}
      />

      <StatBand stats={missedCallStats} heading="The leak is invisible — until you add it up." />

      {/* Problem → Solution */}
      <Section>
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 className="type-h3 text-grey-900">The phone rings while you&apos;re working</h2>
            <p className="type-body-lg text-grey-500">
              You&apos;re on a roof or under a sink. The phone rings. Voicemail doesn&apos;t save the job — most callers just dial the next company.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="type-h3 text-grey-900">Handled picks it up and gets it done</h2>
            <p className="type-body-lg text-grey-500">
              Handled answers every call, qualifies the job, checks real availability, and books it into your field-service system — then texts the caller and follows up. The work that used to fall through the cracks gets <em>handled</em>.
            </p>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {miniPoints.map((p) => (
            <div key={p.title} className="flex flex-col gap-2">
              <p.icon size={24} className="text-brand" aria-hidden="true" />
              <h3 className="type-h5 text-grey-900">{p.title}</h3>
              <p className="type-body-lg text-grey-500">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Feature grid */}
      <Section surface>
        <div className="flex flex-col gap-4">
          <h2 className="type-h2 text-grey-900">Everything an office manager does — without the $62K salary.</h2>
        </div>
        <div className="mt-12">
          <FeatureGrid features={liveFeatures} columns={3} />
        </div>
        <div className="mt-10">
          <Button href="/features" variant="secondary">See all features</Button>
        </div>
      </Section>

      {/* How it works teaser */}
      <Section>
        <div className="flex flex-col gap-4">
          <h2 className="type-h2 text-grey-900">Live in minutes</h2>
          <p className="type-body-lg text-grey-500 max-w-[60ch]">
            Connect your number and FSM, paste your website, set your rules. Handled starts answering and booking right away.
          </p>
        </div>
        <div className="mt-12">
          <StepList steps={onboardingSteps} />
        </div>
        <div className="mt-10">
          <Button href="/how-it-works" variant="ghost">See how it works →</Button>
        </div>
      </Section>

      {/* Integrations strip */}
      <Section surface>
        <LogoCloud items={integrations} heading="Books real jobs into your field-service system" />
        <p className="mt-6 type-body-lg text-grey-500 text-center">
          Jobber, Housecall Pro, and ServiceTitan — not a generic calendar event.{" "}
          <Link href="/integrations" className="text-brand underline hover:text-brand-600">
            See integrations
          </Link>
          .
        </p>
      </Section>

      {/* Pricing teaser */}
      <Section>
        <div className="mx-auto flex max-w-[640px] flex-col items-center gap-6 text-center">
          <h2 className="type-h2 text-grey-900">One captured job pays for months.</h2>
          <p className="type-body-lg text-grey-500">
            Flat, transparent pricing with a hard spend cap and no charge for spam calls. A single captured ~$1,200 job pays for months of Handled.
          </p>
          <Button href="/pricing" size="lg">See pricing</Button>
        </div>
      </Section>

      {/* Testimonial */}
      {firstTestimonial && (
        <Section surface>
          <div className="mx-auto max-w-[760px]">
            <Testimonial testimonial={firstTestimonial} />
          </div>
        </Section>
      )}

      <CtaBand
        heading="See Handled answer and book a real job."
        subheading="Book a 15-minute demo — we'll show it live."
      />
    </>
  );
}
