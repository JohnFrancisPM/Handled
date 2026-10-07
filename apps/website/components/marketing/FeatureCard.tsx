import type { Feature } from "@/content/features";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { resolveIcon } from "@/components/marketing/iconMap";

type FeatureCardProps = { feature: Feature };

export function FeatureCard({ feature }: FeatureCardProps) {
  const Icon = resolveIcon(feature.icon);
  return (
    <Card elevated className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Icon size={24} className="text-brand" aria-hidden="true" />
        {feature.status === "roadmap" && <Badge tone="grey">Roadmap</Badge>}
      </div>
      <h3 className="type-h5 text-grey-900">{feature.title}</h3>
      <p className="type-body-lg text-grey-500">{feature.blurb}</p>
    </Card>
  );
}
