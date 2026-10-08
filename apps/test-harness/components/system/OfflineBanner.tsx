import { copy } from "@/content/copy";
import { AlertTriangle } from "lucide-react";

/** Shown when the webhook isn't configured. Mock-on => "replies simulated"; off => "error". */
export function OfflineBanner({ offlineMock }: { offlineMock: boolean }) {
  return (
    <div
      role="status"
      className="flex items-center gap-2 border-b border-yellow-200 bg-yellow-50 px-4 py-2 type-body-sm text-yellow-900"
    >
      <AlertTriangle size={16} aria-hidden className="shrink-0" />
      <span>{offlineMock ? copy.banner.mock : copy.banner.error}</span>
    </div>
  );
}
