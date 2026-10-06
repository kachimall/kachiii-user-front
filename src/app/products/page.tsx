import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchXIcon, XIcon } from "lucide-react";
import { ProductGrid } from "@/components/product/product-card";
import { SortSelect } from "@/components/product/sort-select";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCategories, getCategory, getProducts } from "@/lib/api/products";
import { cn } from "@/lib/utils";
import type { ProductSort } from "@/types";

const sorts: ProductSort[] = ["newest", "price-asc", "price-desc"];

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function readFilters(searchParams: PageProps<"/products">["searchParams"]) {
  const params = await searchParams;
  const category = first(params.category)?.trim() || undefined;
  const sort = first(params.sort) as ProductSort | undefined;
  const q = first(params.q)?.trim() || undefined;

  return {
    category,
    sort: sort && sorts.includes(sort) ? sort : "newest",
    q,
  };
}

export async function generateMetadata({ searchParams }: PageProps<"/products">): Promise<Metadata> {
  const { category, q } = await readFilters(searchParams);
  if (q) return { title: `Search: ${q}` };
  if (category) return { title: (await getCategory(category))?.name };
  return { title: "Shop all" };
}

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const filters = await readFilters(searchParams);
  const [products, categories, activeCategory] = await Promise.all([
    getProducts(filters),
    getCategories(),
    filters.category ? getCategory(filters.category) : undefined,
  ]);

  const heading = filters.q
    ? `Results for “${filters.q}”`
    : (activeCategory?.name ?? "Shop all");

  function hrefFor(category?: string) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (filters.q) params.set("q", filters.q);
    if (filters.sort !== "newest") params.set("sort", filters.sort);
    const query = params.toString();
    return query ? `/products?${query}` : "/products";
  }

  return (
    <div className="mx-auto max-w-7xl px-3 pt-3 md:px-6 md:pt-6">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 md:mb-4">
        <div className="flex min-w-0 items-baseline gap-2.5">
          <h1 className="min-w-0 truncate font-heading text-headline-lg-mobile md:text-headline-lg">{heading}</h1>
          <p className="shrink-0 text-body-sm text-on-surface-variant md:text-body-md">
            {products.length} {products.length === 1 ? "item" : "items"}
          </p>
        </div>
        {filters.q && (
          <Link
            href={activeCategory ? `/products?category=${activeCategory.slug}` : "/products"}
            className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2.5 py-1 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
          >
            <XIcon aria-hidden className="size-3.5" />
            Clear search
          </Link>
        )}
      </header>

      <div className="-mx-3 mb-3 flex flex-col gap-2.5 border-b border-surface-container bg-surface-container-lowest px-3 py-2.5 md:mx-0 md:mb-5 md:flex-row md:items-center md:justify-between md:rounded-lg md:border-0 md:bg-surface-container-lowest md:px-3 md:shadow-card">
        <nav aria-label="Filter by category" className="min-w-0">
          <ul className="-mx-3 flex gap-2 overflow-x-auto px-3 scrollbar-none md:mx-0 md:flex-wrap md:px-0">
            {[{ slug: undefined, name: "All" }, ...categories].map((c) => {
              const active = c.slug === filters.category;
              return (
                <li key={c.name} className="shrink-0">
                  <Link
                    href={hrefFor(c.slug)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-block rounded-full border px-3.5 py-1.5 text-label-md outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                      active
                        ? "border-primary-container bg-primary-container text-white shadow-sm"
                        : "border-surface-container-highest bg-surface-container-lowest text-on-surface-variant hover:border-primary-container/50 hover:text-primary",
                    )}
                  >
                    {c.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <Suspense>
          <SortSelect value={filters.sort} />
        </Suspense>
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState
          icon={SearchXIcon}
          title={filters.q ? `No results for “${filters.q}”` : "Nothing here yet"}
          description={
            filters.q
              ? "Check the spelling, try a shorter word, or search in all categories."
              : "This category has no products right now. Have a look around the rest of the mall."
          }
        >
          {filters.category && filters.q && (
            <Link href={`/products?q=${encodeURIComponent(filters.q)}`} className={cn(buttonVariants({ variant: "outline" }), "h-10 rounded-full px-5")}>
              Search all categories
            </Link>
          )}
          <Link href="/products" className={cn(buttonVariants(), "h-10 rounded-full px-5")}>
            Show all products
          </Link>
        </EmptyState>
      )}
    </div>
  );
}
