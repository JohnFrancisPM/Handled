import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type CardProps = {
  highlight?: boolean;
  elevated?: boolean;
  className?: string;
  children: ReactNode;
};

// Cards: radius-lg (8px), flat depth (design.md §Visual Principles — no shadows).
export function Card({ highlight = false, elevated = false, className, children }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-6",
        elevated ? "bg-grey-25 hover:border-grey-200" : "bg-white",
        highlight ? "border-2 border-brand" : "border border-grey-100",
        className
      )}
    >
      {children}
    </div>
  );
}
