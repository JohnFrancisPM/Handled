import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";

/**
 * RowCard — the shared chrome for one entry in a repeatable policy list (a
 * service, pricing row, area, technician, emergency rule). Gives every panel a
 * consistent titled header + a polished destructive "Remove" control, so the
 * forms read as a designed settings UI rather than stacked raw inputs.
 */
export function RowCard({
  title,
  onRemove,
  removeLabel,
  children
}: {
  title: string;
  onRemove?: () => void;
  removeLabel?: string;
  children: ReactNode;
}) {
  return (
    <Card elevated className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 border-b border-grey-100 pb-3">
        <span className="type-body-sm font-medium text-grey-500">{title}</span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={removeLabel ?? `Remove ${title}`}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 type-body-sm text-grey-500 transition-colors duration-[var(--motion-fast)] ease-ds-out hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 aria-hidden="true" size={14} />
            Remove
          </button>
        )}
      </div>
      {children}
    </Card>
  );
}
