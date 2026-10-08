import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRightIcon, RotateCcwIcon, ShieldCheckIcon, StarIcon, StoreIcon, TruckIcon } from "lucide-react";
import { MessageStoreButton } from "@/components/messages/message-store-button";
import { AddToCart } from "@/components/product/add-to-cart";
import { DeliveryEstimate } from "@/components/product/delivery-estimate";
import { perkTone, ProductGrid, StoreBadge } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductReviews } from "@/components/product/product-reviews";
import { formatRating } from "@/components/product/rating-stars";
import { getProductReviews } from "@/lib/api/catalog";
import { getProduct, getProductWithSeo, getRelatedProducts } from "@/lib/api/products";
import { discountLabel, formatCount } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const promises = [
  { icon: ShieldCheckIcon, title: "100% authentic", text: "Sold by verified stores" },
  { icon: TruckIcon, title: "UAE-wide delivery", text: "To all seven emirates" },
  { icon: RotateCcwIcon, title: "Easy returns", text: "Request from your order page" },
];

// The path segment is the product's id, or "{slug}-{id}" as the backend's sitemap and
// canonical address give it.
export async function generateMetadata({ params }: PageProps<"/products/[id]">): Promise<Metadata> {
  const { id } = await params;
  const found = await getProductWithSeo(id);
  if (!found) return {};
  const { product, seo } = found;
  const description = seo?.description ?? product.description?.slice(0, 160);
  const image = seo?.image_url ?? product.images[0];
  return {
    title: product.name,
    description,
    alternates: seo ? { canonical: seo.canonical_url } : undefined,
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: seo?.canonical_url,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getRelatedProducts(product),
    // Reviews are extra: the page still renders when they can't load.
    getProductReviews(product.id, { perPage: 5 }, { revalidate: 60 }).catch(() => undefined),
  ]);
  const rating = reviews?.summary?.average != null ? Number(reviews.summary.average) : product.rating;
  const ratingCount = reviews?.summary?.count ?? product.ratingCount ?? 0;
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
              {(rating !== undefined || !!product.soldCount) && (
                <p className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                  {rating !== undefined && (
                    <a href="#reviews-heading" className="flex items-center gap-1 hover:text-primary">
                      <StarIcon aria-hidden className="size-4 fill-star text-star" />
                      <span className="font-semibold text-on-surface">
                        <span className="sr-only">Rated </span>
                        {formatRating(rating)}
                      </span>
                      <span>
                        ({ratingCount} {ratingCount === 1 ? "review" : "reviews"})
                      </span>
                    </a>
                  )}
                  {rating !== undefined && !!product.soldCount && <span aria-hidden>•</span>}
                  {!!product.soldCount && <span>{formatCount(product.soldCount)} sold</span>}
                </p>
              )}
            </div>

            <AddToCart product={product} />
          </div>

          {product.store && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg bg-surface-container-lowest p-3 shadow-card md:p-4">
              <Link href={`/stores/${product.store.slug}`} className="group/store flex min-w-0 flex-1 items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary-fixed text-secondary">
                  <StoreIcon aria-hidden className="size-5" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate font-heading text-headline-sm group-hover/store:text-primary">{product.store.name}</span>
                    <StoreBadge store={product.storeTier} />
                  </span>
                  <span className="text-body-sm text-on-surface-variant">Visit the store</span>
                </span>
                <ChevronRightIcon aria-hidden className="size-5 text-outline" />
              </Link>
              <MessageStoreButton store={product.store} about={product.name} />
            </div>
          )}

          <DeliveryEstimate productId={product.id} />

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

      {reviews && (
        <div className="mt-3 md:mt-6">
          <ProductReviews productId={product.id} initial={reviews} />
        </div>
      )}

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
