// Response shapes of the KACHI shop API, as the Laravel API resources send them.
// Money is a decimal string ("158.00"); ids are ULIDs; image URLs are absolute or null.

export type Money = string;

export type ApiRef = { id: string; name: string; slug: string };

export type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  depth: number;
  position: number;
  breadcrumbs?: ApiRef[];
  children: ApiCategory[];
};

export type ApiVariant = {
  id: string;
  sku: string;
  options: Record<string, string>;
  price: Money;
  sale_price: Money | null;
  effective_price: Money;
  currency_code: string;
  image_id: string | null;
  stock: number;
};

export type ApiImage = {
  id: string;
  status: string;
  url: string | null;
  thumbnail_url: string | null;
  position: number;
  alt_text: string | null;
};

export type ApiProductCard = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  currency_code: string;
  price_range: { min: Money; max: Money } | null;
  in_stock: boolean;
  thumbnail_url: string | null;
  store: ApiRef;
};

export type ApiProduct = ApiProductCard & {
  description: string | null;
  published_at: string | null;
  category: (ApiRef & { breadcrumbs: ApiRef[] }) | null;
  brand: ApiRef | null;
  options: { id: string; name: string; position: number; values: { id: string; value: string }[] }[];
  variants: ApiVariant[];
  images: ApiImage[];
};

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: "active" | "inactive" | "suspended";
  email_verified: boolean;
  roles: string[];
  permissions: string[];
  created_at: string;
};

export type ApiAuthResult =
  | { user: ApiUser; token: string; expires_at: string }
  | { two_factor: true; challenge_token: string };

export type ApiCartItem = {
  id: string;
  quantity: number;
  is_selected: boolean;
  status: "available" | "unavailable" | "sold_out" | "insufficient_stock";
  product: { id: string; name: string; slug: string };
  variant: { id: string; sku: string; options: Record<string, string> };
  thumbnail_url: string | null;
  unit_price: Money;
  compare_at_price: Money | null;
  line_total: Money;
  stock: number;
  low_stock: boolean;
};

export type ApiCart = {
  stores: { store: ApiRef & { logo_url: string | null }; items: ApiCartItem[]; subtotal: Money }[];
  summary: {
    lines: number;
    selected_lines: number;
    stores: number;
    subtotal: Money;
    savings: Money;
    currency_code: string;
  };
};

export type Emirate =
  | "abu_dhabi"
  | "dubai"
  | "sharjah"
  | "ajman"
  | "umm_al_quwain"
  | "ras_al_khaimah"
  | "fujairah";

export type ApiAddress = {
  id: string;
  label: string | null;
  recipient_name: string;
  phone: string;
  emirate: Emirate;
  area: string;
  street: string;
  building: string;
  unit: string | null;
  landmark: string | null;
  is_default: boolean;
};

export type ApiShippingOption = { code: string; name: string; fee: Money; min_days: number; max_days: number };

export type ApiCheckoutPreview = {
  address: ApiAddress;
  packages: {
    key: string;
    fulfiller: string;
    store: ApiRef | null;
    items: ApiCartItem[];
    weight_grams: number;
    options: ApiShippingOption[];
    chosen: string;
  }[];
  voucher: { code: string; name: string; store: ApiRef | null; discount: Money } | null;
  items_total: Money;
  discount_total: Money;
  shipping_total: Money;
  grand_total: Money;
  currency_code: string;
  payment_methods: { code: ApiPaymentMethod; available: boolean; reason: string | null }[];
};

export type ApiPaymentMethod = "online" | "cash_on_delivery";

export type ApiOrderItem = {
  id: string;
  product: { id: string; name: string };
  variant: { id: string; sku: string; options: Record<string, string> };
  thumbnail_url: string | null;
  unit_price: Money;
  compare_at_price: Money | null;
  quantity: number;
  line_total: Money;
};

export type ApiVendorOrder = {
  id: string;
  number: string;
  status: "pending" | "placed" | "accepted" | "ready_to_ship" | "shipped" | "delivered" | "cancelled";
  store: ApiRef;
  items_total: Money;
  discount_total: Money;
  items: ApiOrderItem[];
  placed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
};

export type ApiPurchase = {
  id: string;
  number: string;
  status: "pending" | "placed" | "cancelled";
  payment_method: ApiPaymentMethod;
  payment_status: string;
  currency_code: string;
  items_total: Money;
  voucher_code: string | null;
  discount_total: Money;
  shipping_total: Money;
  grand_total: Money;
  shipping_address: Partial<ApiAddress> | null;
  contact_email: string | null;
  pay_by: string | null;
  payment: { id: string; status: string; redirect_url: string | null; failure_reason: string | null } | null;
  orders: ApiVendorOrder[];
  placed_at: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
};
