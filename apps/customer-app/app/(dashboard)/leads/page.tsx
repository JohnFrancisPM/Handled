import { PageHeader } from "@/components/dashboard/PageHeader";
import { LeadsQueue } from "@/components/leads/LeadsQueue";

// Leads / follow-up queue (dashboard-pages.md /leads, Flow E/F).
export default function LeadsPage() {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Leads"
        description="Follow-up queue for requests the AI couldn't close — out of area, unknown price, photos, and more."
      />
      <LeadsQueue />
    </section>
  );
}
