"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/lib/data/home";
import { cn } from "@/lib/utils";

export function MainNav() {
  const pathname = usePathname();
  // Several promos share a path; only the first match shows as current.
  const activeLabel = mainNav.find((item) => item.href === pathname)?.label;

  return (
    <nav aria-label="Main" className="min-w-0 flex-1">
      <ul className="flex items-center gap-2.5 overflow-x-auto scrollbar-none">
        {mainNav.map((item) => {
          const active = item.label === activeLabel;
          return (
            <li key={item.label} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block rounded-md px-2.5 py-1 text-label-md transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  active
                    ? "bg-primary-container font-bold text-white"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
