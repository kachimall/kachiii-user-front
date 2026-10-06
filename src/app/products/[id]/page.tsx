import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StoreIcon, TruckIcon } from "lucide-react";
import { AddToCart } from "@/components/product/add-to-cart";
import { ProductGrid } from "@/components/product/product-card";
import { ProductImage } from "@/components/product/product-image";
import { getProduct, getRelatedProducts } from "@/lib/api/products";

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

  return (
    <div className="mx-auto max-w-6xl px-3 pt-3 sm:px-6 sm:pt-8">
      <nav aria-label="Breadcrumb" className="mb-3 text-body-sm text-muted-foreground sm:mb-8 sm:text-sm">
        <ol className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none sm:flex-wrap">
          <li>
            <Link href="/products" className="hover:text-foreground hover:underline">
              Shop
            </Link>
          </li>
          {crumbs.map((c) => (
            <li key={c.slug} className="flex items-center gap-2">
              <span aria-hidden>/</span>
              <Link href={`/products?category=${c.slug}`} className="hover:text-foreground hover:underline">
                {c.name}
              </Link>
            </li>
          ))}
          <li aria-hidden>/</li>
          <li aria-current="page" className="max-w-48 truncate text-foreground sm:max-w-none">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-5 md:grid-cols-2 md:gap-16">
        <div className="flex flex-col gap-2 self-start">
          <div className="rounded-lg bg-surface-container-lowest p-2 shadow-card">
            <ProductImage
              name={product.name}
              category={crumbs[0]?.slug}
              image={product.images[0]}
              sizes="(min-width: 768px) 50vw, 100vw"
              priority
            />
          </div>
          {product.images.length > 1 && (
            <ul className="grid grid-cols-5 gap-2">
              {product.images.slice(1, 6).map((src, i) => (
                <li key={src} className="rounded-md bg-surface-container-lowest p-1 shadow-card">
                  <ProductImage name={`${product.name}, photo ${i + 2}`} image={src} sizes="120px" />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-5 rounded-lg bg-surface-container-lowest p-4 shadow-card md:gap-6 md:bg-transparent md:p-0 md:shadow-none">
          <div className="flex flex-col items-start gap-2">
            {product.store && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <StoreIcon aria-hidden className="size-4" />
                {product.store.name}
              </p>
            )}
            <h1 className="font-heading text-headline-lg-mobile tracking-tight sm:text-headline-lg">{product.name}</h1>
          </div>
          {product.description && (
            <p className="max-w-prose text-body-lg leading-relaxed text-muted-foreground sm:text-lg">{product.description}</p>
          )}
          <AddToCart product={product} />
          <p className="flex items-start gap-3 rounded-lg border bg-surface-container-low p-3 text-body-sm sm:rounded-2xl sm:bg-card sm:p-4 sm:text-sm">
            <TruckIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span>Delivery across the UAE. Fees and dates are shown at checkout once you pick an address.</span>
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-10 sm:mt-24">
          <h2 className="mb-4 font-heading text-headline-lg-mobile tracking-tight sm:mb-8 sm:text-3xl sm:font-extrabold">More {product.category?.name.toLowerCase()}</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
