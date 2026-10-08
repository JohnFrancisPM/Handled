import { PageHeader } from "@/components/dashboard/PageHeader";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";

// Analytics (dashboard-pages.md /analytics, CE9, Flow I).
export default function AnalyticsPage() {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Analytics"
        description="The inbound → booked → closed-won funnel, revenue per job, and Captured Opportunity Value."
      />
      <AnalyticsView />
    </section>
  );
}
