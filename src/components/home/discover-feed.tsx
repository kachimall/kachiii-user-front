"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDownIcon, CompassIcon } from "lucide-react";
import { ProductGrid } from "@/components/product/product-card";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

const PAGE_SIZE = 10;

type Tab = {
  id: string;
  label: string;
  mall?: boolean;
  select: (products: Product[]) => Product[];
};

const tabs: Tab[] = [
  { id: "discover", label: "Daily Discover", select: (p) => p },
  { id: "lowest", label: "Lowest Prices", select: (p) => [...p].sort((a, b) => a.price - b.price) },
  { id: "mall", label: "Kachi Mall Exclusives", mall: true, select: (p) => p.filter((x) => x.storeTier === "mall") },
  { id: "under-100", label: "Under AED 100", select: (p) => p.filter((x) => x.price < 100) },
  { id: "in-stock", label: "Ready to Ship", select: (p) => p.filter((x) => x.inStock) },
];

export function DiscoverFeed({ products }: { products: Product[] }) {
  const [tabId, setTabId] = useState(tabs[0].id);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const tab = tabs.find((t) => t.id === tabId) ?? tabs[0];
  const items = tab.select(products);
  const shown = items.slice(0, visible);
  const hasMore = items.length > visible;

  return (
    <section aria-labelledby="discover-heading" className="flex flex-col gap-2.5">
      <h2 id="discover-heading" className="sr-only">
        Recommended for you
      </h2>
      <div className="z-30 rounded-lg bg-surface-container-lowest p-1 shadow-card lg:sticky lg:top-38">
        <div role="tablist" aria-label="Recommendation filters" className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {tabs.map((t, i) => {
            const active = t.id === tab.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="discover-panel"
                onClick={() => {
                  setTabId(t.id);
                  setVisible(PAGE_SIZE);
                }}
                className={cn(
                  "flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  active
                    ? "bg-primary font-heading text-headline-sm text-white uppercase shadow-sm"
                    : "text-label-md hover:bg-surface-container",
                )}
              >
                {i === 0 && <CompassIcon aria-hidden className="size-4.5" />}
                {t.mall && <span className="rounded-sm bg-secondary px-1 text-[9px] font-bold text-white">MALL</span>}
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div id="discover-panel" role="tabpanel">
        {shown.length > 0 ? (
          <ProductGrid products={shown} />
        ) : (
          <p className="rounded-lg bg-surface-container-lowest p-6 text-center text-body-md text-on-surface-variant shadow-card">
            No products match this filter yet.{" "}
            <Link href="/products" className="font-bold text-primary hover:underline">
              Browse all products
            </Link>
          </p>
        )}
      </div>

      <div className="flex justify-center pt-2.5 pb-4">
        {hasMore ? (
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="flex items-center gap-1 rounded-lg bg-surface-container-lowest px-6 py-2.5 font-heading text-headline-sm text-secondary shadow-card transition-colors outline-none hover:bg-surface-container focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            See More Recommendations
            <ChevronDownIcon aria-hidden className="size-5" />
          </button>
        ) : (
          <Link
            href="/products"
            className="flex items-center gap-1 rounded-lg bg-surface-container-lowest px-6 py-2.5 font-heading text-headline-sm text-secondary shadow-card transition-colors hover:bg-surface-container"
          >
            Browse All Products
          </Link>
        )}
      </div>
    </section>
  );
}
