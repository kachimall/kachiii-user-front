// Response shapes of the KACHIII shop API, as the Laravel API resources send them.
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
  /** On a single category from the catalogue: its page's search-engine details. */
  seo?: ApiSeo;
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
  /** Its visible reviews; average is null until the first one. Absent where the query didn't select it. */
  rating?: ApiRating;
  /** Units sold, recounted every few minutes. */
  sold_count?: number;
  thumbnail_url: string | null;
  store: ApiRef;
};

/** Average stars (a decimal string, e.g. "4.50") and the number of reviews behind it. */
export type ApiRating = { average: string | null; count: number };

/** A page's own title, description, canonical address and preview image, for search engines. */
export type ApiSeo = {
  title: string;
  description: string;
  canonical_url: string;
  image_url: string | null;
};

export type ApiProduct = ApiProductCard & {
  description: string | null;
  published_at: string | null;
  category: (ApiRef & { breadcrumbs: ApiRef[] }) | null;
  brand: ApiRef | null;
  options: { id: string; name: string; position: number; values: { id: string; value: string }[] }[];
  variants: ApiVariant[];
  images: ApiImage[];
  seo?: ApiSeo & { price: Money | null; currency: string };
};

/** A store's public page (GET /stores/{slug}). */
export type ApiStore = ApiRef & {
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  /** Free text: returns, shipping and so on. */
  policies: string | null;
  joined_at: string | null;
  rating?: ApiRating;
  products_count?: number;
  seo?: ApiSeo;
};

/** A product review as visitors see it. The buyer's own list adds the product and moderation. */
export type ApiReview = {
  id: string;
  rating: number;
  comment: string | null;
  photo_urls: string[];
  /** "Sarah L." */
  author: string;
  /** What they bought, e.g. "Red / M". */
  variant: string | null;
  /** The store's one reply. */
  reply: { text: string; replied_at: string } | null;
  created_at: string;
  product?: { id: string; name: string };
  hidden?: boolean;
  hidden_reason?: string | null;
};

/** `meta.rating` of a product's reviews: average, count and how many gave each star. */
export type ApiReviewSummary = ApiRating & { stars: Record<"1" | "2" | "3" | "4" | "5", number> };

/** Names matching what the shopper is typing (GET /search/suggestions). */
export type ApiSuggestions = {
  products: ApiRef[];
  categories: ApiRef[];
  brands: ApiRef[];
  stores: ApiRef[];
};

/** A vendor ad: a product card, or a store card for an ad for a whole store. */
export type ApiSponsoredAd =
  | { id: string; type: "product"; product: ApiProductCard; store: null }
  | {
      id: string;
      type: "store";
      product: null;
      store: ApiRef & { logo_url: string | null; banner_url: string | null; rating: ApiRating };
    };

export type ApiAdPlacement = "home" | "category" | "search";

/** A static page (terms, privacy, returns-policy, contact); body is Markdown. */
export type ApiPage = { key: string; title: string; body: string; updated_at: string | null };

/** What checkout would offer to deliver one unit to an emirate. */
export type ApiDeliveryEstimate = {
  variant_id: string;
  emirate: Emirate;
  /** Days the store has to pack it; null when KACHIII's warehouse sends it at once. */
  ships_within_days: number | null;
  /** Cheapest first; empty where the courier does not deliver yet. */
  options: ApiShippingOption[];
  /** What a package's items must cost for its cheapest delivery to be free; null without such an offer. */
  free_delivery_min_total: Money | null;
};

export type ApiMessage = {
  id: string;
  sender: "buyer" | "store";
  /** "welcome" or "away" for a reply the store's settings sent by themselves. */
  auto_reply: string | null;
  body: string | null;
  /** API paths (no origin); load them with the shopper's token. */
  photos: string[];
  /** Hidden by KACHIII: only the reason shows. */
  hidden: boolean;
  hidden_reason: string | null;
  sent_at: string;
};

export type ApiConversation = {
  id: string;
  store: ApiRef & { logo_url: string | null };
  last_message: ApiMessage | null;
  unread_count?: number;
  last_message_at: string | null;
};

/** A live home banner (GET /banners): only what visitors see. */
export type ApiBanner = {
  id: string;
  alt_text: string;
  headline: string | null;
  subheadline: string | null;
  button_label: string | null;
  /** A shop path ("/categories/shoes") or an https:// address; null when the banner links nowhere. */
  link_url: string | null;
  desktop_image_url: string;
  /** Null when the banner has no mobile image of its own: show the desktop one. */
  mobile_image_url: string | null;
  /** Set only when the shop should count down to the banner's end. */
  countdown_ends_at: string | null;
};

/** Each placement's live banners, in order: the main slider and the cards beside it on a wide screen. */
export type ApiBanners = {
  home_carousel: ApiBanner[];
  home_side: ApiBanner[];
};

/** A home page section (GET /home-sections): a titled row of product cards staff set up. */
export type ApiHomeSection = {
  id: string;
  title: string;
  kind: "newest" | "best_selling" | "top_rated" | "category" | "picked";
  /** Set only on a category section. */
  category: ApiRef | null;
  /** Never empty: the backend leaves out a section with nothing to show. */
  products: ApiProductCard[];
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
  package_id: string | null;
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
  status: "pending" | "placed" | "accepted" | "ready_to_ship" | "shipped" | "delivered" | "returned" | "cancelled";
  store: ApiRef;
  items_total: Money;
  discount_total: Money;
  items: ApiOrderItem[];
  placed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  returned_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
};

/** What the courier (Zajel) reports; not one-way: a failed attempt goes back out for delivery. */
export type ApiCourierStatus =
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivery_failed"
  | "delivered"
  | "returned";

export type ApiShipment = {
  id: string;
  fulfiller: "vendor" | "provider";
  status: "pending" | "processing" | "ready" | "shipped" | "delivered" | "returned" | "cancelled";
  /** The store's order whose items travel in it; null for the provider's package. */
  order_id: string | null;
  service: { code: string; name: string };
  fee: Money;
  min_days: number;
  max_days: number;
  shipped_at: string | null;
  delivered_at: string | null;
  /** Until when its items can be returned; null until delivered. */
  return_by: string | null;
  /** Brought back undelivered by the courier, and when the sender confirmed it is back. */
  returned_at: string | null;
  received_back_at: string | null;
  cancelled_at: string | null;
  waybill_number: string | null;
  courier_status: ApiCourierStatus | null;
  /** Null when the order was paid online. */
  cash_on_delivery: { amount: Money; status: "pending" | "collected" | "not_collected"; collected_at: string | null } | null;
  /** Courier updates, oldest first. */
  tracking?: { status: ApiCourierStatus; description: string | null; reason: string | null; occurred_at: string }[];
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
  packages: ApiShipment[];
  /** Money owed back to the shopper, and whether it has been paid back yet. */
  refunds?: ApiRefund[];
  placed_at: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
};

export type ApiRefund = {
  id: string;
  amount: Money;
  reason: string | null;
  /** "pending" and "processing" until paid back ("succeeded"); "failed" waits for staff. */
  status: "pending" | "processing" | "succeeded" | "failed";
  refunded_at: string | null;
  created_at: string;
};

export type ApiReturnReason = "damaged" | "defective" | "wrong_item" | "not_as_described" | "missing_parts" | "other";

/** "escalated": KACHIII decides. Every status but "withdrawn" holds its items. */
export type ApiReturnStatus = "requested" | "escalated" | "approved" | "rejected" | "received" | "withdrawn";

type ApiReturnAnswer = { decision: "approved" | "rejected"; remarks: string | null; decided_at: string };

export type ApiReturn = {
  id: string;
  number: string;
  status: ApiReturnStatus;
  order: { id: string; number: string };
  store_order: { id: string; number: string; store_name: string };
  /** The package the items came in. */
  package_id: string;
  reason: ApiReturnReason;
  details: string | null;
  /** API paths (no origin); load them with the shopper's token. */
  photos: string[];
  items: {
    item_id: string;
    product_name: string;
    sku: string;
    options: Record<string, string>;
    thumbnail_url: string | null;
    quantity: number;
    refund_amount: Money;
  }[];
  /** Paid back to the card when paid online; by KACHIII outside the platform for cash on delivery. */
  refund_amount: Money;
  /** The store answers by then, or KACHIII decides. */
  reply_by: string | null;
  store_answer: ApiReturnAnswer | null;
  escalated_at: string | null;
  dispute_reason: string | null;
  /** Until when the shopper may ask KACHIII to review the store's rejection; null when they cannot. */
  dispute_by: string | null;
  kachi_decision: ApiReturnAnswer | null;
  pickup: {
    waybill_number: string;
    booked_at: string | null;
    cancelled_at: string | null;
    courier_status: ApiCourierStatus | null;
    courier_status_at: string | null;
  } | null;
  received_at: string | null;
  restocked: boolean | null;
  withdrawn_at: string | null;
  created_at: string;
};
