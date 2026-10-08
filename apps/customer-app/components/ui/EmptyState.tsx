import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

/**
 * EmptyState — shown when a data surface has no rows (dashboard-pages.md UX
 * states). Flat, token-styled, centered.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-grey-100 bg-white px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-grey-50 text-grey-400">
        <Icon aria-hidden="true" size={22} />
      </span>
      <div className="flex flex-col gap-1">
        <p className="type-body-lg text-grey-900">{title}</p>
        {description && <p className="type-body-sm text-grey-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
