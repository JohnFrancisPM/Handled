import type { Testimonial as TestimonialType } from "@/content/testimonials";
import { Card } from "@/components/ui/Card";

type TestimonialProps = { testimonial: TestimonialType };

export function Testimonial({ testimonial }: TestimonialProps) {
  return (
    <Card className="flex flex-col gap-6">
      <blockquote className="type-h5 text-grey-900">&ldquo;{testimonial.quote}&rdquo;</blockquote>
      <cite className="type-body-sm not-italic text-grey-500">
        {testimonial.name} — {testimonial.business}, {testimonial.trade}
      </cite>
    </Card>
  );
}
