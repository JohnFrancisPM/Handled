"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * ErrorCard — Red 50/500/700 card + retry (dashboard-pages.md: Error state).
 * Never shows internal/stack detail — only the safe envelope message.
 */
export function ErrorCard({
  message = "Something went wrong.",
  onRetry
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-lg border border-red-500 bg-red-50 p-6"
    >
      <div className="flex items-center gap-2 text-red-700">
        <AlertTriangle aria-hidden="true" size={18} />
        <p className="type-body-lg">{message}</p>
      </div>
      {onRetry && (
        <div>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
