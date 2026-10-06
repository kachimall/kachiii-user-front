// Storefront view models. `src/lib/api` maps the backend's resources into these,
// so components never depend on the raw API shapes.

export type Category = {
  id: string;
  slug: string;
  name: string;
  image: string;
  /** Number of listed products, when known. */
  itemCount?: number;
};

export type ProductVariant = {
  id: string;
  /** "Navy / M", or "Standard" for products without options. */
  name: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  image?: string;
};

/** Store tier shown as a badge on product cards. */
export type StoreTier = "mall" | "preferred";

export type ProductPerk = { label: string; tone: "primary" | "secondary" | "tertiary" | "neutral" };

export type Product = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  /** Lowest price across variants, in `currency`. */
  price: number;
  compareAtPrice?: number;
  currency: string;
  category?: { slug: string; name: string };
  /** Root-to-leaf category path; present on product detail. */
  breadcrumbs?: { slug: string; name: string }[];
  images: string[];
  /** Empty on list cards; the detail endpoint fills it. */
  variants: ProductVariant[];
  inStock: boolean;
  store?: { name: string; slug: string };
  storeTier?: StoreTier;
  rating?: number;
  soldCount?: number;
  /** Short promo chips, e.g. "Free Shipping". `tone` picks the chip color. */
  perks: ProductPerk[];
  globalDirect?: boolean;
  /** Present when the product is in the current flash sale. */
  flashSale?: { soldPercent: number };
};

export type ProductSort = "newest" | "price-asc" | "price-desc";

export type ProductQuery = {
  category?: string;
  q?: string;
  sort?: ProductSort;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
};

export type CartItem = {
  /** Server cart line id; absent while the cart only lives in this browser. */
  lineId?: string;
  productId: string;
  variantId: string;
  name: string;
  variantName: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  quantity: number;
  /** Availability reported by the server cart. */
  status?: "available" | "unavailable" | "sold_out" | "insufficient_stock";
  stock?: number;
};
