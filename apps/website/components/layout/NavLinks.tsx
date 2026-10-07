"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNav } from "@/content/nav";
import { cn } from "@/lib/utils/cn";

// Minimal client sub-component so the Nav shell stays server-rendered while
// desktop links can show active state (components.md §Nav).
export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
      {primaryNav.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "type-body-lg hover:text-grey-900",
              active ? "text-brand" : "text-grey-500"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
