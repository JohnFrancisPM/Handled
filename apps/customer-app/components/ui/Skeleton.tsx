import { cn } from "@/lib/utils/cn";

// Skeleton loading placeholder (design.md: skeleton → content 300ms ease-in-out).
// Flat depth; uses grey surface steps only.
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-grey-50",
        className
      )}
    />
  );
}
