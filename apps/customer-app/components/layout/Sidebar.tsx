"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCheck, X } from "lucide-react";
import { NAV_ITEMS } from "@/components/layout/nav";
import { useUiStore } from "@/lib/stores/ui";
import { cn } from "@/lib/utils/cn";

function isActive(pathname: string, href: string): boolean {
  if (href === "/profile") {
    // Identity owns the exact /profile path; sub-pages match their own href.
    return pathname === "/profile";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const open = useUiStore((s) => s.sidebarOpen);
  const setOpen = useUiStore((s) => s.setSidebarOpen);

  // Close the mobile drawer on navigation and on Escape.
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-overlay md:hidden"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      <nav
        aria-label="Dashboard"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-grey-100 bg-white",
          "transition-transform duration-[var(--motion-panel)] ease-ds-out",
          "md:static md:z-auto md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <Link href="/dashboard" className="flex items-center gap-2 rounded-md px-2 py-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white">
              <CheckCheck aria-hidden="true" size={18} />
            </span>
            <span className="type-h5 text-grey-900">Handled</span>
          </Link>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="rounded-md p-2 text-grey-500 hover:bg-grey-50 hover:text-grey-900 md:hidden"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <ul className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            const sectionOpen = pathname.startsWith("/profile");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 type-body-lg transition-colors duration-[var(--motion-fast)] ease-ds-out",
                    active
                      ? "bg-brand-50 font-medium text-brand-700"
                      : "text-grey-700 hover:bg-grey-50 hover:text-grey-900"
                  )}
                >
                  <Icon aria-hidden="true" size={18} className={active ? "text-brand-600" : "text-grey-400"} />
                  {item.label}
                </Link>

                {item.children && sectionOpen && (
                  <div className="mb-1 mt-2 flex flex-col gap-1">
                    <span className="px-3 pb-1 type-body-sm font-medium text-grey-400">
                      Profile settings
                    </span>
                    <ul className="flex flex-col gap-1 border-l border-grey-100 pl-3">
                      {item.children.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              aria-current={childActive ? "page" : undefined}
                              className={cn(
                                "block rounded-md px-3 py-2 type-body-sm transition-colors duration-[var(--motion-fast)] ease-ds-out",
                                childActive
                                  ? "bg-brand-50 font-medium text-brand-700"
                                  : "text-grey-500 hover:bg-grey-50 hover:text-grey-900"
                              )}
                            >
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
