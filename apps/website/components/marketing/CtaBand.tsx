import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { site } from "@/content/site";

type CtaBandProps = {
  heading: string;
  subheading?: string;
  cta?: { label: string; href: string };
};

export function CtaBand({ heading, subheading, cta = site.primaryCta }: CtaBandProps) {
  return (
    <section className="bg-brand py-16 md:py-24">
      <Container>
        <div className="mx-auto flex max-w-[720px] flex-col items-center gap-6 text-center">
          <h2 className="type-h3 text-white">{heading}</h2>
          {subheading && <p className="type-body-lg text-brand-50">{subheading}</p>}
          <Button href={cta.href} variant="secondary" size="lg">
            {cta.label}
          </Button>
        </div>
      </Container>
    </section>
  );
}
