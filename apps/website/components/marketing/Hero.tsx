import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils/cn";

type Cta = { label: string; href: string };

type HeroProps = {
  eyebrow?: string;
  heading: string;
  subheading: string;
  primaryCta: Cta;
  secondaryCta?: Cta;
  as?: "h1" | "h2";
  align?: "center" | "left";
};

export function Hero({
  eyebrow,
  heading,
  subheading,
  primaryCta,
  secondaryCta,
  as = "h1",
  align = "center"
}: HeroProps) {
  const Heading = as;
  const centered = align === "center";

  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className={cn("flex flex-col gap-6", centered ? "mx-auto max-w-[820px] text-center items-center" : "max-w-[820px]")}>
          {eyebrow && (
            <p className="type-body-lg font-medium text-brand">{eyebrow}</p>
          )}
          <Heading className="type-h1 text-[32px] leading-[40px] text-grey-900 md:text-[48px] md:leading-[56px]">
            {heading}
          </Heading>
          <p className={cn("type-body-lg text-grey-500 max-w-[60ch]", centered && "mx-auto")}>
            {subheading}
          </p>
          <div className={cn("mt-4 flex flex-col gap-4 sm:flex-row", centered ? "justify-center" : "justify-start")}>
            <Button href={primaryCta.href} size="lg">
              {primaryCta.label}
            </Button>
            {secondaryCta && (
              <Button href={secondaryCta.href} variant="secondary" size="lg">
                {secondaryCta.label}
              </Button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
