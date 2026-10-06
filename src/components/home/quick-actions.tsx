import Link from "next/link";
import {
  AwardIcon,
  LaptopIcon,
  PiggyBankIcon,
  PlaneIcon,
  TicketIcon,
  TruckIcon,
  WandSparklesIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Action = {
  label: string;
  note: string;
  href: string;
  icon: LucideIcon;
  tile: string;
  noteTone: string;
};

const actions: Action[] = [
  { label: "Flash Sale", note: "Hot deals", href: "#flash", icon: ZapIcon, tile: "bg-linear-to-tr from-primary to-primary-container text-white", noteTone: "text-primary" },
  { label: "Vouchers & Coins", note: "Claim 50%", href: "#vouchers", icon: TicketIcon, tile: "bg-linear-to-tr from-tertiary to-tertiary-container text-white", noteTone: "text-tertiary-container" },
  { label: "Super Brands", note: "100% Mall", href: "/products", icon: AwardIcon, tile: "bg-linear-to-tr from-secondary to-secondary-container text-white", noteTone: "text-secondary" },
  { label: "Global Express", note: "Duty free", href: "/products", icon: PlaneIcon, tile: "bg-linear-to-tr from-secondary-container to-secondary text-white", noteTone: "text-on-surface-variant font-medium normal-case" },
  { label: "Free Shipping $0", note: "No min spend", href: "/products", icon: TruckIcon, tile: "bg-surface-container-high text-primary", noteTone: "text-primary" },
  { label: "Tech Mega Sale", note: "Gadgets", href: "/products?category=electronics", icon: LaptopIcon, tile: "bg-surface-container-high text-secondary", noteTone: "text-on-surface-variant font-medium normal-case" },
  { label: "Beauty & Glam", note: "Top picks", href: "/products?category=beauty", icon: WandSparklesIcon, tile: "bg-primary-fixed text-primary", noteTone: "text-primary" },
  { label: "Daily 99¢ Deals", note: "Flash drop", href: "/products?sort=price-asc", icon: PiggyBankIcon, tile: "bg-linear-to-tr from-primary to-tertiary text-white", noteTone: "text-primary-container" },
];

export function QuickActions() {
  return (
    <nav aria-label="Shortcuts" className="rounded-lg bg-surface-container-lowest p-2.5 shadow-card">
      <ul className="grid grid-cols-4 gap-2.5 md:grid-cols-8">
        {actions.map(({ label, note, href, icon: Icon, tile, noteTone }) => (
          <li key={label}>
            <Link href={href} className="group flex flex-col items-center gap-1 rounded-md text-center outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <span
                className={cn(
                  "grid size-12 place-items-center rounded-lg shadow-sm transition-all group-hover:scale-110 group-hover:shadow-md motion-reduce:transition-none",
                  tile,
                )}
              >
                <Icon aria-hidden className="size-6" />
              </span>
              <span className="text-label-md leading-tight transition-colors group-hover:text-primary">{label}</span>
              <span className={cn("-mt-1 text-[9px] font-bold uppercase", noteTone)}>{note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
