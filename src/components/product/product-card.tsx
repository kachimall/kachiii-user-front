import Link from "next/link";
import { StarIcon } from "lucide-react";
import { Price } from "@/components/product/price";
import { ProductImage } from "@/components/product/product-image";
import { QuickAddButton } from "@/components/product/quick-add-button";
import { discountLabel, formatCount } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export const perkTone = {
  primary: "bg-primary-fixed text-primary",
  secondary: "bg-secondary-fixed text-secondary",
  tertiary: "bg-tertiary-fixed text-on-tertiary-fixed",
  neutral: "bg-surface-container-high text-on-surface-variant",
} as const;

export function StoreBadge({ store, className }: { store: Product["storeTier"]; className?: string }) {
  if (!store) return null;
  return (
    <span
      className={cn(
        "rounded-sm px-1.5 py-0.5 text-label-xs uppercase text-white",
        store === "mall" ? "bg-secondary" : "bg-primary",
        className,
      )}
    >
      {store === "mall" ? "Mall" : "Preferred"}
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const discount = discountLabel(product.price, product.compareAtPrice);
  const soldOut = !product.inStock;

  return (
    <article className="group relative flex h-full flex-col rounded-lg bg-surface-container-lowest p-1.5 shadow-card transition-shadow hover:shadow-card-hover hover:ring-1 hover:ring-secondary-container/40">
      <div className="relative mb-1">
        <ProductImage
          name={product.name}
          category={product.breadcrumbs?.[0]?.slug}
          image={product.images[0]}
          imageClassName="transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
        />
        <StoreBadge store={product.storeTier} className="absolute top-2 left-2" />
        {discount && (
          <span className="absolute top-2 right-2 rounded-sm bg-primary px-1 py-0.5 text-label-xs text-white">
            {discount}
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-x-0 bottom-0 bg-on-surface/80 py-1 text-center text-label-md text-white">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-1 px-0.5">
        <div>
          {product.perks.length > 0 && (
            <div className="mb-1 flex flex-wrap gap-1">
              {product.perks.map((perk) => (
                <span key={perk.label} className={cn("rounded-sm px-1 text-[9px] leading-4 font-bold", perkTone[perk.tone])}>
                  {perk.label}
                </span>
              ))}
            </div>
          )}
          <h3 className="line-clamp-2 font-heading text-[13px] leading-snug font-bold transition-colors group-hover:text-primary">
            {/* Stretched link: the whole card opens the product, the + button stays separate. */}
            <Link href={`/products/${product.id}`} className="outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-3 focus-visible:after:ring-ring/50">
              {product.name}
            </Link>
          </h3>
        </div>

        <div className="pt-1">
          {product.rating !== undefined && product.soldCount !== undefined ? (
            <p className="flex items-center gap-1 text-label-xs text-on-surface-variant">
              <StarIcon aria-hidden className="size-3.5 fill-star text-star" />
              <span className="text-on-surface">
                <span className="sr-only">Rated </span>
                {product.rating}
              </span>
              <span aria-hidden>•</span>
              <span>{formatCount(product.soldCount)} sold</span>
            </p>
          ) : (
            product.store && <p className="truncate text-label-xs text-on-surface-variant">{product.store.name}</p>
          )}
          <div className="mt-1 flex items-center justify-between gap-1">
            <Price price={product.price} compareAtPrice={product.compareAtPrice} />
            <QuickAddButton product={product} />
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
      {products.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}
