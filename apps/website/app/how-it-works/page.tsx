import Link from "next/link";
import { Hero } from "@/components/marketing/Hero";
import { StepList } from "@/components/marketing/StepList";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Section } from "@/components/layout/Section";
import { onboardingSteps } from "@/content/steps";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "How it works — Handled AI office manager",
  description:
    "Connect your number and FSM, paste your website, set your rules, and go live in minutes. See exactly how Handled answers, books, and follows up.",
  path: "/how-it-works"
});

const callFlow = [
  "Answers the call in a natural conversation",
  "Understands what the caller needs",
  "Checks real availability in your FSM",
  "Confirms the service, time, and address verbatim",
  "Books the real job and texts the caller a confirmation",
  "Notifies you with a transcript and summary"
];

export default function HowItWorksPage() {
  return (
    <>
      <Hero
        as="h1"
        eyebrow="How it works"
        heading="Live in minutes — not a 40-field form."
        subheading="Connect your number and FSM, paste your website, set your rules. Handled starts answering and booking right away."
        primaryCta={{ label: "Book a demo", href: "/contact" }}
      />

      <Section>
        <StepList steps={onboardingSteps} />
      </Section>

      <Section surface>
        <div className="flex flex-col gap-8">
          <h2 className="type-h2 text-grey-900">What happens on a call</h2>
          <ol className="flex flex-col gap-3">
            {callFlow.map((item, i) => (
              <li key={item} className="flex items-start gap-3">
                <span
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand type-body-sm font-medium text-white"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="type-body-lg text-grey-900">{item}</span>
              </li>
            ))}
          </ol>
          <p className="type-body-lg text-grey-500 max-w-[70ch]">
            Dig into the{" "}
            <Link href="/features" className="text-brand underline hover:text-brand-600">
              full feature set
            </Link>{" "}
            or the{" "}
            <Link href="/integrations" className="text-brand underline hover:text-brand-600">
              FSM integrations
            </Link>
            .
          </p>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col gap-4">
          <h2 className="type-h3 text-grey-900">You stay in control</h2>
          <p className="type-body-lg text-grey-500 max-w-[70ch]">
            You see every transcript and summary and can correct anything — Handled keeps you in control.
          </p>
        </div>
      </Section>

      <CtaBand heading="See your shop go live." />
    </>
  );
}
