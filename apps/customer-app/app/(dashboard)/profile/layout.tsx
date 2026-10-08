import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";

// Profile editor shell (dashboard-pages.md /profile/*). Sub-nav lives in the
// sidebar; this provides the shared heading + card frame for each policy panel.
export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Business profile"
        description="Self-serve policy editor — the AI reads this live, so changes apply to the next inbound message."
      />
      <Card className="max-w-3xl">{children}</Card>
    </section>
  );
}
