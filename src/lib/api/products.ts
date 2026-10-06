import { ApiError, api } from "@/lib/api/client";
import type { ApiCategory, ApiProduct, ApiProductCard, ApiVariant } from "@/lib/api/schema";
import { categoryArt, fallbackCategoryArt } from "@/lib/data/category-art";
import type { Category, Product, ProductQuery, ProductSort, ProductVariant } from "@/types";

// Catalog reads from the shop API. Server components cache them for a minute;
// in the browser `revalidate` is ignored.
const CATALOG_TTL = 60;

const apiSort: Record<ProductSort, string> = {
  newest: "newest",
  "price-asc": "price_asc",
  "price-desc": "price_desc",
};

const num = (value: string | null | undefined) => (value == null ? undefined : Number(value));

function toCategory(c: ApiCategory): Category {
  return { id: c.id, slug: c.slug, name: c.name, image: c.image_url ?? categoryArt[c.slug] ?? fallbackCategoryArt };
}

function toCard(p: ApiProductCard): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: num(p.price_range?.min) ?? 0,
    currency: p.currency_code,
    images: p.thumbnail_url ? [p.thumbnail_url] : [],
    variants: [],
    inStock: p.in_stock,
    store: { name: p.store.name, slug: p.store.slug },
    perks: [],
  };
}

export function variantName(options: Record<string, string>): string {
  return Object.values(options).join(" / ") || "Standard";
}

function toVariant(v: ApiVariant, images: ApiProduct["images"]): ProductVariant {
  const price = Number(v.effective_price);
  const base = Number(v.price);
  const image = images.find((i) => i.id === v.image_id);
  return {
    id: v.id,
    name: variantName(v.options),
    price,
    compareAtPrice: base > price ? base : undefined,
    stock: v.stock,
    image: image?.url ?? image?.thumbnail_url ?? undefined,
  };
}

function toProduct(p: ApiProduct): Product {
  const variants = p.variants.map((v) => toVariant(v, p.images));
  const cheapest = variants.reduce<ProductVariant | undefined>(
    (best, v) => (!best || v.price < best.price ? v : best),
    undefined,
  );
  const images = p.images.flatMap((i) => (i.url ?? i.thumbnail_url ? [(i.url ?? i.thumbnail_url)!] : []));

  return {
    ...toCard(p),
    description: p.description ?? undefined,
    price: cheapest?.price ?? num(p.price_range?.min) ?? 0,
    compareAtPrice: cheapest?.compareAtPrice,
    category: p.category ? { slug: p.category.slug, name: p.category.name } : undefined,
    breadcrumbs: p.category?.breadcrumbs.map((b) => ({ slug: b.slug, name: b.name })),
    images: images.length > 0 ? images : p.thumbnail_url ? [p.thumbnail_url] : [],
    variants,
  };
}

async function orUndefined<T>(request: Promise<T>): Promise<T | undefined> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
}

/** Top-level categories. */
export async function getCategories(): Promise<Category[]> {
  const tree = await api<ApiCategory[]>("/categories", { revalidate: 300 });
  return tree.map(toCategory);
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  const category = await orUndefined(api<ApiCategory>(`/categories/${encodeURIComponent(slug)}`, { revalidate: 300 }));
  return category && toCategory(category);
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  const { category, q, sort = "newest", minPrice, maxPrice, limit = 60 } = query;
  const filters = { category, min_price: minPrice, max_price: maxPrice, per_page: limit };

  const cards = q
    ? await api<ApiProductCard[]>("/products/search", {
        // Searches rank by relevance unless the shopper picks a price sort.
        query: { ...filters, q, sort: sort === "newest" ? undefined : apiSort[sort] },
        revalidate: CATALOG_TTL,
      })
    : await api<ApiProductCard[]>("/products", {
        query: { ...filters, sort: apiSort[sort] },
        revalidate: CATALOG_TTL,
      });

  return cards.map(toCard);
}

/** Home page deals rail. The backend has no flash-sale feed yet, so this shows the lowest prices. */
export async function getFlashSaleProducts(): Promise<Product[]> {
  return getProducts({ sort: "price-asc", limit: 6 });
}

export async function getRecommendedProducts(): Promise<Product[]> {
  return getProducts({ sort: "newest", limit: 30 });
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const product = await orUndefined(api<ApiProduct>(`/products/${encodeURIComponent(id)}`, { revalidate: CATALOG_TTL }));
  return product && toProduct(product);
}

export async function getRelatedProducts(product: Product, limit = 5): Promise<Product[]> {
  if (!product.category) return [];
  const products = await getProducts({ category: product.category.slug, limit: limit + 1 });
  return products.filter((p) => p.id !== product.id).slice(0, limit);
}
