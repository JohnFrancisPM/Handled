import { redirect } from "next/navigation";

// Root → dashboard. Auth gating is handled by middleware in Stage 4.
export default function RootPage() {
  redirect("/dashboard");
}
