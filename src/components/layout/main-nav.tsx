"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheckIcon, FlameIcon, GlobeIcon, PercentIcon, SparklesIcon, TicketIcon, type LucideIcon } from "lucide-react";
import { mainNav } from "@/lib/data/home";
import { cn } from "@/lib/utils";

const navIcon: Record<string, LucideIcon> = {
  "Flash Deals": FlameIcon,
  "Kachi Mall": BadgeCheckIcon,
  "Super Brand Day": SparklesIcon,
  "Global Express": GlobeIcon,
  "Vouchers & Rewards": TicketIcon,
  "Clearance 70% Off": PercentIcon,
};

// Promos drawn in the brand pink to stand out from the rest of the row.
const hot = new Set(["Flash Deals", "Clearance 70% Off"]);

export function MainNav() {
  const pathname = usePathname();
  // Several promos share a path; only the first match shows as current.
  const activeLabel = mainNav.find((item) => item.href === pathname)?.label;

  return (
    <nav aria-label="Main" className="h-full min-w-0 flex-1">
      <ul className="flex h-full items-center gap-1 overflow-x-auto scrollbar-none md:gap-2">
        {mainNav.map((item) => {
          const active = item.label === activeLabel;
          const Icon = navIcon[item.label];
          return (
            <li key={item.label} className="h-full shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-full items-center gap-1.5 rounded-md px-2 text-label-md transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:px-2.5",
                  "after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary-container after:transition-transform after:duration-200",
                  active ? "text-primary after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100",
                  hot.has(item.label) ? "text-primary-container hover:text-primary" : !active && "text-on-surface-variant hover:text-on-surface",
                )}
              >
                {Icon && <Icon aria-hidden className="size-4" />}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
