import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, BadgeCheckIcon, PlaneTakeoffIcon, TruckIcon } from "lucide-react";
import { brandDeals, promoImages } from "@/lib/data/home";
import { cn } from "@/lib/utils";

const tileClass =
  "group relative flex flex-1 flex-col justify-between overflow-hidden rounded-lg bg-surface-container-lowest p-2.5 shadow-card outline-none transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50";

export function PromoTiles() {
  return (
    <div className="flex flex-col justify-between gap-4 lg:col-span-4">
      <Link href="/products" className={tileClass}>
        <div className="flex items-start justify-between gap-1.5">
          <div>
            <div className="mb-1 flex items-center gap-1">
              <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-label-xs text-white uppercase">Kachiii Mall</span>
              <span className="flex items-center gap-0.5 text-label-xs text-secondary">
                <BadgeCheckIcon aria-hidden className="size-3.5" />
                100% Authentic
              </span>
            </div>
            <h3 className="font-heading text-headline-sm">Official Super Brands</h3>
            <p className="line-clamp-1 text-body-sm text-on-surface-variant">15-day free returns &amp; zero fake guarantee</p>
          </div>
          <span className="rounded-md bg-surface-container-low p-1 text-secondary transition-transform group-hover:translate-x-0.5">
            <ArrowRightIcon aria-hidden className="size-5" />
          </span>
        </div>
        <div className="my-1.5 grid grid-cols-3 gap-1">
          {brandDeals.map((d) => (
            <div key={d.brand} className="flex flex-col items-center justify-center rounded-md bg-surface-container-low p-1 text-center">
              <span className={cn("font-heading text-headline-sm font-extrabold", d.tone)}>{d.value}</span>
              <span className="text-label-xs text-on-surface-variant">{d.brand}</span>
            </div>
          ))}
        </div>
        <div className="relative h-16 overflow-hidden rounded-md">
          <Image src={promoImages.brands} alt="" fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />
        </div>
      </Link>

      <Link href="/products" className={tileClass}>
        <div className="flex items-start justify-between gap-1.5">
          <div>
            <div className="mb-1 flex items-center gap-1">
              <span className="rounded-sm bg-primary px-1.5 py-0.5 text-label-xs text-white uppercase">Express Direct</span>
              <span className="rounded-sm bg-tertiary-fixed px-1 text-label-xs text-on-tertiary-fixed">FREE AIR SHIP</span>
            </div>
            <h3 className="font-heading text-headline-sm">Global Cross-Border</h3>
            <p className="line-clamp-1 text-body-sm text-on-surface-variant">Free flight shipping on orders over $25</p>
          </div>
          <span className="rounded-md bg-surface-container-low p-1 text-primary">
            <PlaneTakeoffIcon aria-hidden className="size-5" />
          </span>
        </div>
        <div className="my-1 flex items-center justify-between rounded-md bg-surface-container-low p-1.5">
          <div className="flex items-center gap-1">
            <TruckIcon aria-hidden className="size-5 text-secondary" />
            <div>
              <span className="block text-label-xs">KR • JP • US Imports</span>
              <span className="block text-label-xs font-normal text-on-surface-variant">Delivered in 3–5 days</span>
            </div>
          </div>
          <span className="rounded-sm bg-primary-container px-1.5 py-1 text-label-xs text-white">Shop Global</span>
        </div>
        <div className="relative h-16 overflow-hidden rounded-md">
          <Image src={promoImages.global} alt="" fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />
        </div>
      </Link>
    </div>
  );
}
