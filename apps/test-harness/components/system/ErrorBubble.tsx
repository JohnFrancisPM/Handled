import { AlertCircle } from "lucide-react";

/** Non-blocking in-thread error (webhook ok:false, or unreachable with mock off). */
export function ErrorBubble({ message }: { message: string }) {
  return (
    <div className="flex justify-start">
      <div
        role="alert"
        className="flex max-w-[80%] items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 type-body-sm text-red-700"
      >
        <AlertCircle size={16} aria-hidden className="mt-[1px] shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
}
