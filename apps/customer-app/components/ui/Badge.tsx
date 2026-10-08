import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeTone = "brand" | "green" | "red" | "yellow" | "violet" | "orange" | "grey";

type BadgeProps = {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
};

// design.md "Semantic Status Badge": bg {color}-50, border {color}-200, text {color}-700.
const tones: Record<BadgeTone, string> = {
  brand: "bg-brand-50 border-brand-200 text-brand-700",
  green: "bg-green-50 border-green-200 text-green-700",
  red: "bg-red-50 border-red-200 text-red-700",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
  violet: "bg-violet-50 border-violet-200 text-violet-700",
  orange: "bg-orange-50 border-orange-200 text-orange-700",
  grey: "bg-grey-50 border-grey-200 text-grey-700"
};

export function Badge({ tone = "brand", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border rounded-sm type-body-sm font-medium py-[2px] px-2",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
