import { AppShell } from "@/components/layout/AppShell";
import { getCustomers } from "@/lib/fixtures/load";

// Server component shell: load the bundled fixture at module scope (no backend call) and
// hand the ~30 customers to the client AppShell.
export default function Home() {
  const customers = getCustomers();
  return <AppShell customers={customers} />;
}
