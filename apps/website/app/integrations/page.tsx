import Link from "next/link";
import { Hero } from "@/components/marketing/Hero";
import { StepList } from "@/components/marketing/StepList";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { integrations, bookingSteps } from "@/content/integrations";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Integrations — Jobber, Housecall Pro & ServiceTitan | Handled",
  description:
    "Handled books real jobs into Jobber, Housecall Pro, and ServiceTitan — checking live availability, tech skills, and service area, then confirming verbatim before writing.",
  path: "/integrations"
});

export default function IntegrationsPage() {
  return (
    <>
      <Hero
        as="h1"
        align="left"
        eyebrow="Integrations"
        heading="Books real jobs into the system you already use."
        subheading="Handled connects to your field-service software and creates the actual job — respecting tech skills, availability, and service area. Not a generic calendar event."
        primaryCta={{ label: "Book a demo", href: "/contact" }}
      />

      <Section>
        <div className="flex flex-col gap-8">
          <h2 className="type-h2 text-grey-900">Your field-service system, connected</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {integrations.map((integration) => (
              <Card key={integration.name} elevated className="flex flex-col gap-4">
                <span className="inline-flex w-fit items-center rounded-md bg-grey-50 px-4 py-2 type-body-lg font-medium text-grey-700">
                  {integration.name}
                </span>
                <p className="type-body-lg text-grey-500">{integration.blurb}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <Section surface>
        <div className="flex flex-col gap-8">
          <h2 className="type-h2 text-grey-900">How Handled books a job</h2>
          <StepList steps={bookingSteps} />
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <h2 className="type-h3 text-grey-900">Not a calendar event — a real job</h2>
          <p className="type-body-lg text-grey-500 max-w-[70ch]">
            Most AI receptionists drop an event on a Google Calendar. Handled books the real job.{" "}
            <Link href="/why-handled" className="text-brand underline hover:text-brand-600">
              See why that matters
            </Link>
            .
          </p>
        </div>
      </Section>

      <CtaBand heading="Connect your FSM and go live in minutes." />
    </>
  );
}
