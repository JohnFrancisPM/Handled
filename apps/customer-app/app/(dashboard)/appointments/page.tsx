import { PageHeader } from "@/components/dashboard/PageHeader";
import { AppointmentsTable } from "@/components/appointments/AppointmentsTable";

// Appointments (dashboard-pages.md /appointments, CE9, EC11).
export default function AppointmentsPage() {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Appointments"
        description="Every job the AI books, reschedules, and closes — with prices and confirmation status."
      />
      <AppointmentsTable />
    </section>
  );
}
