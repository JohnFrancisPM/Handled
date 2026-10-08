import { CHIP_CLASSES, type ChipColor } from "@/content/chips";
import { cn } from "@/lib/utils/cn";

/** Semantic Status Badge (design.md §Reusable Patterns): 50 bg / 200 border / 700 text,
 *  radius-sm, 2px 8px padding. Always paired with label text (color-independent). */
export function Chip({
  color,
  children,
  className
}: {
  color: ChipColor;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-2 py-[2px] type-body-sm",
        CHIP_CLASSES[color],
        className
      )}
    >
      {children}
    </span>
  );
}
