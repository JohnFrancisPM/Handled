import { Badge } from "@/components/ui/Badge";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { isDemoMode } from "@/lib/env";
import { DEMO_ORG, DEMO_USER_EMAIL } from "@/lib/demo/fixtures";

/**
 * Top bar (dashboard-pages.md §Layout): org name + user email + notifications
 * bell. Server Component; values come from fixtures in demo mode.
 */
export function TopBar() {
  const demo = isDemoMode();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-grey-100 bg-white px-6">
      <div className="flex items-center gap-3">
        <span className="type-body-lg text-grey-900">{DEMO_ORG.name}</span>
        {demo && <Badge tone="yellow">Demo mode — read-only</Badge>}
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <span className="type-body-sm text-grey-500">{DEMO_USER_EMAIL}</span>
      </div>
    </header>
  );
}
