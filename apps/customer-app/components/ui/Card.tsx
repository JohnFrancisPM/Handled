import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type CardProps = {
  highlight?: boolean;
  elevated?: boolean;
  /** Adds a flat-depth hover affordance (border step only — no shadow). */
  hover?: boolean;
  className?: string;
  children: ReactNode;
};

// Cards: radius-lg (8px), flat depth (design.md §Visual Principles — no shadows;
// depth via background/border steps only).
export function Card({ highlight = false, elevated = false, hover = false, className, children }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-6 transition-colors duration-[var(--motion-base)] ease-ds-out",
        elevated ? "bg-grey-25" : "bg-white",
        highlight ? "border-2 border-brand" : "border border-grey-100",
        (hover || elevated) && !highlight && "hover:border-grey-200",
        className
      )}
    >
      {children}
    </div>
  );
}
