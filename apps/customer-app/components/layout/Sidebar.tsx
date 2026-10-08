"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/layout/nav";
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

  return (
    <nav
      aria-label="Dashboard"
      className="flex w-[240px] shrink-0 flex-col gap-1 border-r border-grey-100 bg-white p-4"
    >
      <div className="px-3 py-2">
        <span className="type-h5 text-grey-900">Handled</span>
      </div>

      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 type-body-lg transition-colors duration-[var(--motion-fast)] ease-ds-out",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-grey-700 hover:bg-grey-50"
                )}
              >
                <Icon aria-hidden="true" size={18} />
                {item.label}
              </Link>

              {item.children && (pathname.startsWith("/profile")) && (
                <ul className="mt-1 flex flex-col gap-1 border-l border-grey-100 pl-3">
                  {item.children.map((child) => {
                    const childActive = pathname === child.href;
                    return (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          aria-current={childActive ? "page" : undefined}
                          className={cn(
                            "block rounded-md px-3 py-[6px] type-body-sm transition-colors duration-[var(--motion-fast)] ease-ds-out",
                            childActive
                              ? "bg-brand-50 text-brand-700"
                              : "text-grey-500 hover:bg-grey-50 hover:text-grey-700"
                          )}
                        >
                          {child.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
