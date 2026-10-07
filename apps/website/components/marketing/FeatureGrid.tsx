import type { Feature } from "@/content/features";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import { cn } from "@/lib/utils/cn";

type FeatureGridProps = { features: Feature[]; columns?: 2 | 3 };

export function FeatureGrid({ features, columns = 3 }: FeatureGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 md:grid-cols-2",
        columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"
      )}
    >
      {features.map((feature) => (
        <FeatureCard key={feature.title} feature={feature} />
      ))}
    </div>
  );
}
