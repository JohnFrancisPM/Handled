import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

type PlaceholderPageProps = {
  title: string;
  /** The spec file this page is built from in Stage 4, e.g. "dashboard-pages.md". */
  spec: string;
  description?: ReactNode;
};

/**
 * Standard scaffold page: heading + a "built in Stage 4" note. All Stage-3
 * placeholder pages render through this so they share design-system styling.
 */
export function PlaceholderPage({ title, spec, description }: PlaceholderPageProps) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="type-h3 text-grey-900">{title}</h1>
        {description && <p className="type-body-lg text-grey-500">{description}</p>}
      </div>

      <Card elevated>
        <p className="type-body-sm text-grey-500">
          Scaffold placeholder — built in Stage 4 (see{" "}
          <code className="text-grey-700">docs/customer-app/implementation/{spec}</code>).
        </p>
      </Card>
    </section>
  );
}
