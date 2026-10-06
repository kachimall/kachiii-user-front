import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductGrid } from "@/components/product/product-card";
import { SortSelect } from "@/components/product/sort-select";
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
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">{heading}</h1>
        <p className="text-muted-foreground">
          {products.length} {products.length === 1 ? "item" : "items"}
        </p>
      </header>

      <div className="mb-10 flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">
        <nav aria-label="Filter by category">
          <ul className="flex flex-wrap gap-2">
            {[{ slug: undefined, name: "All" }, ...categories].map((c) => {
              const active = c.slug === filters.category;
              return (
                <li key={c.name}>
                  <Link
                    href={hrefFor(c.slug)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-block rounded-full border px-4 py-1.5 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                      active ? "border-foreground bg-foreground text-background" : "bg-card hover:border-foreground/40",
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
        <div className="flex flex-col items-start gap-3 rounded-3xl border border-dashed bg-card p-10">
          <p className="font-heading text-2xl font-bold">Nothing matches that search.</p>
          <p className="text-muted-foreground">Try a shorter word, or browse every product instead.</p>
          <Link href="/products" className="font-medium text-primary hover:underline">
            Show all products
          </Link>
        </div>
      )}
    </div>
  );
}
