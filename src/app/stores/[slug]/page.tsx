import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CalendarIcon, MailIcon, PackageIcon, PhoneIcon, StarIcon, StoreIcon } from "lucide-react";
import { MessageStoreButton } from "@/components/messages/message-store-button";
import { ProductGrid } from "@/components/product/product-card";
import { formatRating } from "@/components/product/rating-stars";
import { SortSelect } from "@/components/product/sort-select";
import { EmptyState } from "@/components/ui/empty-state";
import { isApiImage } from "@/lib/api/client";
import { getProducts, getStore } from "@/lib/api/products";
import type { ProductSort } from "@/types";

const sorts: ProductSort[] = ["newest", "price-asc", "price-desc", "rating", "best-selling"];

export async function generateMetadata({ params }: PageProps<"/stores/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = await getStore(slug);
  if (!found) return {};
  const { store, seo } = found;
  const description = seo?.description ?? store.description?.slice(0, 160);
  const image = seo?.image_url ?? store.banner ?? store.logo;
  return {
    title: store.name,
    description,
    alternates: seo ? { canonical: seo.canonical_url } : undefined,
    openGraph: {
      type: "website",
      title: store.name,
      description,
      url: seo?.canonical_url,
      images: image ? [{ url: image, alt: store.name }] : undefined,
    },
  };
}

export default async function StorePage({ params, searchParams }: PageProps<"/stores/[slug]">) {
  const { slug } = await params;
  const sortParam = (await searchParams).sort;
  const sort = sorts.find((s) => s === sortParam) ?? "newest";

  const found = await getStore(slug);
  if (!found) notFound();
  const { store } = found;
  const products = await getProducts({ store: store.slug, sort });

  return (
    <div className="mx-auto max-w-7xl px-3 pt-3 md:px-6 md:pt-6">
      <header className="mb-4 overflow-hidden rounded-lg bg-surface-container-lowest shadow-card md:mb-6">
        <div className="relative h-28 bg-linear-to-br from-secondary to-secondary-container md:h-44">
          {store.banner && (
            <Image src={store.banner} alt="" fill priority sizes="(min-width: 1280px) 1232px, 100vw" unoptimized={isApiImage(store.banner)} className="object-cover" />
          )}
        </div>
        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-end md:justify-between md:p-6">
          <div className="-mt-12 flex items-end gap-3 md:-mt-16">
            <span className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary-fixed text-secondary ring-4 ring-surface-container-lowest md:size-24">
              {store.logo ? (
                <Image src={store.logo} alt="" fill sizes="96px" unoptimized={isApiImage(store.logo)} className="object-cover" />
              ) : (
                <StoreIcon aria-hidden className="size-9" />
              )}
            </span>
            <div className="min-w-0 pb-1">
              <h1 className="truncate font-heading text-headline-lg-mobile md:text-headline-lg">{store.name}</h1>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-body-sm text-on-surface-variant">
                {store.rating !== undefined && (
                  <span className="flex items-center gap-1">
                    <StarIcon aria-hidden className="size-4 fill-star text-star" />
                    <span className="font-semibold text-on-surface">{formatRating(store.rating)}</span>
                    ({store.ratingCount} {store.ratingCount === 1 ? "review" : "reviews"})
                  </span>
                )}
                {store.productCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <PackageIcon aria-hidden className="size-3.5" />
                    {store.productCount} {store.productCount === 1 ? "product" : "products"}
                  </span>
                )}
                {store.joinedAt && (
                  <span className="flex items-center gap-1">
                    <CalendarIcon aria-hidden className="size-3.5" />
                    Joined {new Date(store.joinedAt).toLocaleDateString("en-AE", { month: "short", year: "numeric" })}
                  </span>
                )}
              </p>
            </div>
          </div>
          <MessageStoreButton store={store} className="self-start md:self-auto" />
        </div>
        {(store.description || store.policies || store.contactEmail || store.contactPhone) && (
          <div className="grid gap-4 border-t border-surface-container p-4 text-body-sm md:grid-cols-[2fr_1fr] md:p-6">
            <div className="flex flex-col gap-3">
              {store.description && <p className="max-w-prose whitespace-pre-line text-on-surface-variant">{store.description}</p>}
              {store.policies && (
                <details className="group">
                  <summary className="cursor-pointer text-label-md text-secondary hover:underline">Store policies</summary>
                  <p className="mt-2 max-w-prose whitespace-pre-line text-on-surface-variant">{store.policies}</p>
                </details>
              )}
            </div>
            {(store.contactEmail || store.contactPhone) && (
              <ul className="flex flex-col gap-1.5 text-on-surface-variant">
                {store.contactEmail && (
                  <li className="flex items-center gap-1.5">
                    <MailIcon aria-hidden className="size-4" />
                    <a href={`mailto:${store.contactEmail}`} className="hover:text-primary">
                      {store.contactEmail}
                    </a>
                  </li>
                )}
                {store.contactPhone && (
                  <li className="flex items-center gap-1.5">
                    <PhoneIcon aria-hidden className="size-4" />
                    <a href={`tel:${store.contactPhone}`} className="hover:text-primary">
                      {store.contactPhone}
                    </a>
                  </li>
                )}
              </ul>
            )}
          </div>
        )}
      </header>

      <div className="mb-3 flex items-center justify-between gap-3 md:mb-4">
        <h2 className="font-heading text-headline-md">Products</h2>
        <Suspense>
          <SortSelect value={sort} />
        </Suspense>
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState icon={PackageIcon} title="No products yet" description="This store hasn’t listed anything for sale right now." />
      )}
    </div>
  );
}
