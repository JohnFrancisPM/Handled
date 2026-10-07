import { Suspense } from "react";
import { Check } from "lucide-react";
import { Hero } from "@/components/marketing/Hero";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/Card";
import { DemoForm } from "@/components/form/DemoForm";
import { FormSkeleton } from "@/components/form/FormSkeleton";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Book a demo — Handled",
  description:
    "Book a 15-minute demo. See Handled answer a call and book a real job into your field-service system.",
  path: "/contact",
  noindex: false
});

const trustPoints = [
  "Live in minutes — not a 40-field form",
  "No charge for spam calls or hangups",
  "Books real jobs into your FSM",
  "We'll reach out within 1 business day"
];

export default function ContactPage() {
  return (
    <>
      <Hero
        as="h1"
        align="left"
        eyebrow="Book a demo"
        heading="See Handled answer and book a real job."
        subheading="Tell us about your shop and we'll reach out within 1 business day."
        primaryCta={{ label: "Book a demo", href: "/contact" }}
      />

      <Section>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr]">
          <Card className="flex flex-col gap-6">
            <Suspense fallback={<FormSkeleton />}>
              <DemoForm />
            </Suspense>
          </Card>

          <aside className="flex flex-col gap-6">
            <h2 className="type-h5 text-grey-900">What to expect</h2>
            <ul className="flex flex-col gap-3">
              {trustPoints.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <Check size={20} className="mt-[2px] shrink-0 text-brand" aria-hidden="true" />
                  <span className="type-body-lg text-grey-900">{point}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Section>
    </>
  );
}
