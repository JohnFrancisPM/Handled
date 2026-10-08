import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

/**
 * KpiCard — a single headline metric (dashboard-pages.md Overview/Analytics).
 * `highlight` marks the North-Star (Captured Opportunity Value) with the brand
 * border and a larger value.
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
    <Card highlight={highlight} className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="type-body-sm text-grey-500">{label}</span>
        {icon && <span className="text-grey-300">{icon}</span>}
      </div>
      <span
        className={cn(
          "text-grey-900",
          highlight ? "type-h3" : "type-h4"
        )}
      >
        {value}
      </span>
      {sublabel && <span className="type-body-sm text-grey-500">{sublabel}</span>}
    </Card>
  );
}
