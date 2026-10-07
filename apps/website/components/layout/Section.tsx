import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Container } from "@/components/ui/Container";

type SectionProps = {
  id?: string;
  surface?: boolean;
  className?: string;
  children: ReactNode;
};

export function Section({ id, surface = false, className, children }: SectionProps) {
  return (
    <section id={id} className={cn("py-16 md:py-24", surface && "bg-grey-25", className)}>
      <Container>{children}</Container>
    </section>
  );
}
