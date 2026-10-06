import Link from "next/link";
import { ChevronRightIcon, FlameIcon, TimerIcon, TriangleAlertIcon, ZapIcon } from "lucide-react";
import { BoxCountdown } from "@/components/home/countdown";
import { Price } from "@/components/product/price";
import { ProductImage } from "@/components/product/product-image";
import { discountLabel } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function FlashSale({ products }: { products: Product[] }) {
  return (
    <section id="flash" aria-labelledby="flash-heading" className="scroll-mt-40 rounded-lg bg-surface-container-lowest p-2.5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 id="flash-heading" className="flex items-center gap-1">
            <ZapIcon aria-hidden className="size-7 fill-primary-container text-primary-container motion-safe:animate-bounce" />
            <span className="font-heading text-headline-lg-mobile tracking-tight text-primary uppercase sm:text-headline-lg sm:font-extrabold">
              Flash Sale
            </span>
          </h2>
          <BoxCountdown />
          <span className="text-label-xs text-on-surface-variant">Ending soon</span>
        </div>
        <Link
          href="/products?sort=price-asc"
          className="flex items-center gap-0.5 text-label-md font-bold text-primary transition-colors hover:text-primary-container"
        >
          View all flash deals
          <ChevronRightIcon aria-hidden className="size-4" />
        </Link>
      </div>

      <ul className="-mx-2.5 flex snap-x gap-2 overflow-x-auto px-2.5 pb-1 scrollbar-none md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:px-0 lg:grid-cols-6">
        {products.map((p) => (
          <li key={p.id} className="w-36 shrink-0 snap-start md:w-auto">
            <FlashSaleCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function FlashSaleCard({ product }: { product: Product }) {
  const percent = product.flashSale?.soldPercent;
  const discount = discountLabel(product.price, product.compareAtPrice);
  const status =
    percent === undefined
      ? undefined
      : percent >= 95
        ? { icon: FlameIcon, text: `${percent}% sold - only a few left!`, tone: "text-error" }
        : percent >= 90
          ? { icon: TriangleAlertIcon, text: `${percent}% sold - almost gone!`, tone: "text-error" }
          : percent >= 75
            ? { icon: FlameIcon, text: `${percent}% sold`, tone: "text-primary" }
            : percent >= 60
              ? { icon: ZapIcon, text: `${percent}% sold`, tone: "text-on-surface-variant" }
              : { icon: TimerIcon, text: `${percent}% sold`, tone: "text-on-surface-variant" };
  const StatusIcon = status?.icon;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative flex h-full flex-col justify-between rounded-lg bg-surface-container-low p-1.5 outline-none transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {discount && (
        <span className="absolute top-2 left-2 z-10 rounded-sm bg-primary px-1.5 py-0.5 text-label-xs text-white shadow-sm">
          {discount}
        </span>
      )}
      <ProductImage
        name={product.name}
        category={product.breadcrumbs?.[0]?.slug}
        image={product.images[0]}
        sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 144px"
        className="mb-1.5"
        imageClassName="transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
      />
      <div className="flex flex-col gap-1">
        <h3 className="line-clamp-2 font-heading text-[13px] leading-tight font-bold">{product.name}</h3>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} />
        {status && StatusIcon && percent !== undefined && (
          <div className="flex flex-col gap-1 pt-1">
            <div
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Sold"
              className="h-3 overflow-hidden rounded-full bg-surface-container-highest"
            >
              <div
                className={cn(
                  "h-full rounded-full bg-linear-to-r",
                  percent >= 95 ? "from-error to-primary" : "from-primary to-primary-container",
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className={cn("flex items-center gap-0.5 text-[10px] font-bold uppercase", status.tone)}>
              <StatusIcon aria-hidden className="size-3" />
              {status.text}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
