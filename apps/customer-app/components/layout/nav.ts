import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Inbox,
  CalendarClock,
  UserPlus,
  BarChart3,
  Building2
} from "lucide-react";

export type NavChild = { label: string; href: string };

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: NavChild[];
};

// Dashboard navigation (dashboard-pages.md §Layout). Profile has a sub-nav.
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Inbox", href: "/inbox", icon: Inbox },
  { label: "Appointments", href: "/appointments", icon: CalendarClock },
  { label: "Leads", href: "/leads", icon: UserPlus },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  {
    label: "Profile",
    href: "/profile",
    icon: Building2,
    children: [
      { label: "Identity", href: "/profile" },
      { label: "Services", href: "/profile/services" },
      { label: "Pricing", href: "/profile/pricing" },
      { label: "Areas", href: "/profile/areas" },
      { label: "Hours", href: "/profile/hours" },
      { label: "Team", href: "/profile/team" },
      { label: "Emergency", href: "/profile/emergency" }
    ]
  }
];
