import type { ReactNode } from "react";

/**
 * PageHeader — the single `<h1>` per page (a11y: one h1/page) plus optional
 * description and right-aligned actions/filters.
 */
export function PageHeader({
  title,
  description,
  actions
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="type-h3 text-grey-900">{title}</h1>
        {description && <p className="type-body-lg text-grey-500">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
