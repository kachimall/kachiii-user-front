"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { StarIcon, StoreIcon } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { countSponsoredClick, getSponsored } from "@/lib/api/catalog";
import { isApiImage } from "@/lib/api/client";
import { toCard } from "@/lib/api/products";
import type { ApiAdPlacement, ApiSponsoredAd } from "@/lib/api/schema";
import { cn } from "@/lib/utils";

type Props = {
  placement: ApiAdPlacement;
  /** The category's slug, for its results. */
  category?: string;
  /** The search, for its results. */
  q?: string;
  title?: string;
  className?: string;
};

/**
 * Vendor ads for a page. Fetched in the browser, so each view is counted against the visitor's
 * own address; a tap is counted before the link opens. Renders nothing when there are none.
 */
export function SponsoredAds({ placement, category, q, title = "Sponsored", className }: Props) {
  const [ads, setAds] = useState<ApiSponsoredAd[]>([]);

  useEffect(() => {
    if (placement === "category" && !category) return;
    if (placement === "search" && !q) return;
    const controller = new AbortController();
    getSponsored(placement, { category: placement === "category" ? category : undefined, q: placement === "search" ? q : undefined }, controller.signal).then(
      (result) => !controller.signal.aborted && setAds(result),
    );
    return () => controller.abort();
  }, [placement, category, q]);

  if (ads.length === 0) return null;

  return (
    <section aria-label={title} className={cn("flex flex-col gap-2", className)}>
      <h2 className="flex items-center gap-1.5 text-label-md text-on-surface-variant">
        {title}
        <span className="rounded-sm bg-surface-container-high px-1 text-[10px] font-semibold uppercase">Ad</span>
      </h2>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
        {ads.map((ad) => (
          // Capture phase: the tap counts even though the card's own link handles the click.
          <li key={ad.id} onClickCapture={() => countSponsoredClick(ad.id)} className="relative">
            {ad.type === "product" ? (
              <ProductCard product={toCard(ad.product)} sponsored />
            ) : (
              <StoreAdCard store={ad.store} />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function StoreAdCard({ store }: { store: Extract<ApiSponsoredAd, { type: "store" }>["store"] }) {
  const rating = store.rating.average != null ? Number(store.rating.average) : undefined;
  return (
    <Link
      href={`/stores/${store.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg bg-surface-container-lowest shadow-card outline-none transition-shadow hover:shadow-card-hover focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="relative aspect-2/1 bg-linear-to-br from-secondary-fixed to-primary-fixed">
        {store.banner_url && (
          <Image src={store.banner_url} alt="" fill sizes="(min-width: 1024px) 20vw, 50vw" unoptimized={isApiImage(store.banner_url)} className="object-cover" />
        )}
        <span className="absolute top-2 left-2 rounded-sm bg-on-surface/70 px-1 text-[9px] leading-4 font-semibold text-white uppercase">
          Sponsored
        </span>
      </div>
      <div className="flex flex-1 items-center gap-2 p-2">
        <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary-fixed text-secondary ring-2 ring-surface-container-lowest">
          {store.logo_url ? (
            <Image src={store.logo_url} alt="" fill sizes="40px" unoptimized={isApiImage(store.logo_url)} className="object-cover" />
          ) : (
            <StoreIcon aria-hidden className="size-5" />
          )}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-heading text-[13px] font-bold group-hover:text-primary">{store.name}</span>
          <span className="flex items-center gap-1 text-label-xs font-normal text-on-surface-variant">
            {rating !== undefined ? (
              <>
                <StarIcon aria-hidden className="size-3 fill-star text-star" />
                {rating.toFixed(1)} ({store.rating.count})
              </>
            ) : (
              "Visit store"
            )}
          </span>
        </span>
      </div>
    </Link>
  );
}
