import { Skeleton } from "@/components/ui/Skeleton";

/** Shared loading skeleton for policy panels (300ms skeleton → content). */
export function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
