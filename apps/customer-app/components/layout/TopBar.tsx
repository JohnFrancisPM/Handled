import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { SidebarToggle } from "@/components/layout/SidebarToggle";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { isDemoMode } from "@/lib/env";
import { DEMO_ORG, DEMO_USER_EMAIL } from "@/lib/demo/fixtures";

/**
 * Top bar (dashboard-pages.md §Layout): mobile nav toggle + org identity + demo
 * badge on the left; notification bell + signed-in user on the right. Server
 * Component; values come from fixtures in demo mode.
 */
export function TopBar() {
  const demo = isDemoMode();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-grey-100 bg-white px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        <SidebarToggle />
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-grey-50 text-grey-500">
          <Building2 aria-hidden="true" size={18} />
        </span>
        <span className="truncate type-body-lg font-medium text-grey-900">{DEMO_ORG.name}</span>
        {demo && (
          <span className="hidden sm:inline-flex">
            <Badge tone="yellow">Demo mode — read-only</Badge>
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <NotificationBell />
        <span className="hidden h-6 w-px bg-grey-100 sm:block" aria-hidden="true" />
        <div className="flex items-center gap-2">
          <Avatar name={DEMO_USER_EMAIL} size="sm" tone="brand" />
          <span className="hidden type-body-sm text-grey-500 lg:inline">{DEMO_USER_EMAIL}</span>
        </div>
        {!demo && <SignOutButton />}
      </div>
    </header>
  );
}
