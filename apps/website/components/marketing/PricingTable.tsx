import { Check } from "lucide-react";
import type { PricingTier } from "@/content/pricing";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type PricingTableProps = { tiers: PricingTier[] };

export function PricingTable({ tiers }: PricingTableProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {tiers.map((tier) => (
        <Card
          key={tier.id}
          highlight={tier.mostPopular}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="type-h5 text-grey-900">{tier.name}</h3>
              {tier.mostPopular && <Badge tone="brand">Most popular</Badge>}
            </div>
            <p className="type-body-lg text-grey-500">{tier.tagline}</p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="type-h2 text-grey-900">{tier.price}</span>
            <span className="type-body-lg text-grey-500">{tier.priceNote}</span>
          </div>

          <ul className="flex flex-col gap-3">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check size={20} className="mt-[2px] shrink-0 text-brand" aria-hidden="true" />
                <span className="type-body-lg text-grey-900">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto">
            <Button
              href={tier.cta.href}
              variant={tier.mostPopular ? "primary" : "secondary"}
              fullWidth
            >
              {tier.cta.label}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
