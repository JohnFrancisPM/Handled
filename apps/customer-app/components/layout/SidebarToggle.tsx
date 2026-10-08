"use client";

import { Menu } from "lucide-react";
import { useUiStore } from "@/lib/stores/ui";

/** Hamburger that opens the mobile nav drawer (below md). Hidden on desktop. */
export function SidebarToggle() {
  const toggle = useUiStore((s) => s.toggleSidebar);
  const open = useUiStore((s) => s.sidebarOpen);
  return (
    <button
      type="button"
      aria-label="Open navigation"
      aria-expanded={open}
      onClick={toggle}
      className="rounded-md p-2 text-grey-500 hover:bg-grey-50 hover:text-grey-900 md:hidden"
    >
      <Menu aria-hidden="true" size={20} />
    </button>
  );
}
