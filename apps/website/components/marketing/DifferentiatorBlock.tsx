import { Check } from "lucide-react";
import type { Differentiator } from "@/content/differentiators";
import { resolveIcon } from "@/components/marketing/iconMap";
import { cn } from "@/lib/utils/cn";

type DifferentiatorBlockProps = { item: Differentiator; index: number };

export function DifferentiatorBlock({ item, index }: DifferentiatorBlockProps) {
  const Icon = resolveIcon(item.icon);
  const flip = index % 2 === 1;

  return (
    <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-12">
      <div className={cn("flex flex-col gap-4", flip && "md:order-2")}>
        <Icon size={32} className="text-brand" aria-hidden="true" />
        <h3 className="type-h3 text-grey-900">{item.title}</h3>
        <p className="type-body-lg text-grey-900">{item.summary}</p>
      </div>
      <div className={cn("flex flex-col gap-6", flip && "md:order-1")}>
        <p className="type-body-lg text-grey-500">{item.body}</p>
        <ul className="flex flex-col gap-3">
          {item.points.map((point) => (
            <li key={point} className="flex items-start gap-2">
              <Check size={20} className="mt-[2px] shrink-0 text-brand" aria-hidden="true" />
              <span className="type-body-lg text-grey-900">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
