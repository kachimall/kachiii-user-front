import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRightIcon, RotateCcwIcon, ShieldCheckIcon, StarIcon, StoreIcon, TruckIcon } from "lucide-react";
import { AddToCart } from "@/components/product/add-to-cart";
import { perkTone, ProductGrid, StoreBadge } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { getProduct, getRelatedProducts } from "@/lib/api/products";
import { discountLabel, formatCount } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const promises = [
  { icon: ShieldCheckIcon, title: "100% authentic", text: "Sold by verified stores" },
  { icon: TruckIcon, title: "UAE-wide delivery", text: "Fee and date shown at checkout" },
  { icon: RotateCcwIcon, title: "Easy returns", text: "Request from your order page" },
];

export async function generateMetadata({ params }: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return {};
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  const crumbs = product.breadcrumbs ?? [];
  const discount = discountLabel(product.price, product.compareAtPrice);

  return (
    <div className="mx-auto max-w-7xl px-3 pt-3 md:px-6 md:pt-5">
      <nav aria-label="Breadcrumb" className="mb-3 text-body-sm text-on-surface-variant md:mb-4">
        <ol className="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-none">
          <li>
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
          </li>
          {crumbs.map((c) => (
            <li key={c.slug} className="flex items-center gap-1">
              <ChevronRightIcon aria-hidden className="size-3.5 text-outline" />
              <Link href={`/products?category=${c.slug}`} className="hover:text-primary">
                {c.name}
              </Link>
            </li>
          ))}
          <li aria-hidden>
            <ChevronRightIcon className="size-3.5 text-outline" />
          </li>
          <li aria-current="page" className="max-w-48 truncate text-on-surface sm:max-w-md">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-3 md:grid-cols-2 md:gap-8 lg:gap-10">
        <div className="md:sticky md:top-40 md:self-start lg:top-42">
          <ProductGallery name={product.name} category={crumbs[0]?.slug} images={product.images}>
            <StoreBadge store={product.storeTier} className="absolute top-4 left-4" />
            {discount && (
              <span className="absolute top-4 right-4 rounded-sm bg-primary px-1.5 py-0.5 text-label-md text-white">
                {discount}
              </span>
            )}
          </ProductGallery>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-4 rounded-lg bg-surface-container-lowest p-4 shadow-card md:p-6">
            <div className="flex flex-col items-start gap-2">
              {product.perks.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {product.perks.map((perk) => (
                    <span key={perk.label} className={cn("rounded-sm px-1.5 py-0.5 text-label-xs", perkTone[perk.tone])}>
                      {perk.label}
                    </span>
                  ))}
                </div>
              )}
              <h1 className="font-heading text-headline-md md:text-headline-lg">{product.name}</h1>
              {(product.rating !== undefined || product.soldCount !== undefined) && (
                <p className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                  {product.rating !== undefined && (
                    <span className="flex items-center gap-1">
                      <StarIcon aria-hidden className="size-4 fill-star text-star" />
                      <span className="font-semibold text-on-surface">
                        <span className="sr-only">Rated </span>
                        {product.rating}
                      </span>
                    </span>
                  )}
                  {product.rating !== undefined && product.soldCount !== undefined && <span aria-hidden>•</span>}
                  {product.soldCount !== undefined && <span>{formatCount(product.soldCount)} sold</span>}
                </p>
              )}
            </div>

            <AddToCart product={product} />
          </div>

          {product.store && (
            <Link
              href={`/products?q=${encodeURIComponent(product.store.name)}`}
              className="flex items-center gap-3 rounded-lg bg-surface-container-lowest p-3 shadow-card transition-shadow hover:shadow-card-hover md:p-4"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary-fixed text-secondary">
                <StoreIcon aria-hidden className="size-5" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-1.5">
                  <span className="truncate font-heading text-headline-sm">{product.store.name}</span>
                  <StoreBadge store={product.storeTier} />
                </span>
                <span className="text-body-sm text-on-surface-variant">Search more from this store</span>
              </span>
              <ChevronRightIcon aria-hidden className="size-5 text-outline" />
            </Link>
          )}

          <ul className="grid grid-cols-3 gap-2 rounded-lg bg-surface-container-lowest p-3 shadow-card md:p-4">
            {promises.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex flex-col items-center gap-1 text-center">
                <Icon aria-hidden className="size-5 text-primary" />
                <span className="text-label-md">{title}</span>
                <span className="hidden text-label-xs font-normal text-on-surface-variant sm:block">{text}</span>
              </li>
            ))}
          </ul>

          {product.description && (
            <section aria-labelledby="description-heading" className="rounded-lg bg-surface-container-lowest p-4 shadow-card md:p-6">
              <h2 id="description-heading" className="mb-2 font-heading text-headline-sm">
                Product details
              </h2>
              <p className="max-w-prose text-body-md leading-relaxed whitespace-pre-line text-on-surface-variant">
                {product.description}
              </p>
            </section>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-8 md:mt-12">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 id="related-heading" className="font-heading text-headline-md">
              More {product.category?.name.toLowerCase() ?? "like this"}
            </h2>
            {product.category && (
              <Link
                href={`/products?category=${product.category.slug}`}
                className="flex shrink-0 items-center text-label-md text-primary hover:underline"
              >
                See all
                <ChevronRightIcon aria-hidden className="size-4" />
              </Link>
            )}
          </div>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
