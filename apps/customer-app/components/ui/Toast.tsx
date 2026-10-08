import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ToastTone = "success" | "error" | "warning" | "info";

type ToastProps = {
  tone?: ToastTone;
  className?: string;
  children: ReactNode;
};

// Presentational toast (design.md state tints). A full queue/provider is Stage 4.
// aria-live so screen readers announce transient confirmations ("Saved").
const tones: Record<ToastTone, string> = {
  success: "bg-green-50 border-green-500 text-green-700",
  error: "bg-red-50 border-red-500 text-red-700",
  warning: "bg-yellow-50 border-yellow-500 text-yellow-800",
  info: "bg-brand-50 border-brand-200 text-brand-700"
};

export function Toast({ tone = "info", className, children }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-4 py-3 type-body-lg",
        tones[tone],
        className
      )}
    >
      {children}
    </div>
  );
}
