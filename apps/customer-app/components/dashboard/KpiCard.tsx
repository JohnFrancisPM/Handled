import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

/**
 * KpiCard — a single headline metric (dashboard-pages.md Overview/Analytics).
 * `highlight` marks the North-Star (Captured Opportunity Value) with the brand
 * border, a brand-tinted icon tile, and the largest value on the page. Number →
 * label hierarchy: the value is the hero, the label its caption, sublabel the
 * supporting metadata.
 */
export function KpiCard({
  label,
  value,
  sublabel,
  highlight = false,
  icon
}: {
  label: string;
  value: ReactNode;
  sublabel?: string;
  highlight?: boolean;
  icon?: ReactNode;
}) {
  return (
    <Card highlight={highlight} hover className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <span className="type-body-sm font-medium text-grey-500">{label}</span>
        {icon && (
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
              highlight ? "bg-brand-50 text-brand-600" : "bg-grey-50 text-grey-400"
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <span
        className={cn(
          "text-grey-900 tabular-nums",
          highlight ? "type-h2" : "type-h3"
        )}
      >
        {value}
      </span>
      {sublabel && <span className="type-body-sm text-grey-500">{sublabel}</span>}
    </Card>
  );
}
