// Merchandising content for the home page (banners, promos, shortcuts).
// In production this would come from a CMS or the marketing API.

const img = (id: string) => `https://lh3.googleusercontent.com/aida-public/${id}`;

export const voucherCode = "KACHI88";

export const trendingSearches = [
  "Wireless Earbuds",
  "Summer Dresses",
  "Mechanical Keyboards",
  "Air Fryer 5L",
  "Korean Skincare",
  "Oversized Tees",
];

export const mainNav = [
  { label: "Flash Deals", href: "/" },
  { label: "Kachi Mall", href: "/products" },
  { label: "Super Brand Day", href: "/products" },
  { label: "Global Express", href: "/products" },
  { label: "Vouchers & Rewards", href: "/#vouchers" },
  { label: "Clearance 70% Off", href: "/products?sort=price-asc" },
];

export type HeroSlide = {
  id: string;
  badge: string;
  subBadge: string;
  title: string;
  body: string;
  highlight: string;
  cta: { label: string; href?: string; action?: "claim-voucher" };
  image: string;
  imageAlt: string;
};

export const heroSlides: HeroSlide[] = [
  {
    id: "mid-year",
    badge: "Mega Mid-Year Sale",
    subBadge: "Up to 80% off",
    title: "Flash Deals & Daily Vouchers",
    body: "Collect and stack store coupons + platform shipping passes up to",
    highlight: "$50 off today!",
    cta: { label: "Claim Vouchers", action: "claim-voucher" },
    image: img(
      "AB6AXuDPiwH-wcAp_3kqipYbjcxNNonrIIWG8nzsUGPJcOa8hmflt3a0hWVJIEWot9CwV2wTPdsCXhI9CuD3wZSKmyp-CSPigByvYKqUUp63mzeAJ11j2R26u4hgFbpBXB-k9PKQFaP9kvY4Row0RgVJnK_mjPci6n5o9E4bgy_mpFsYjdEWu6hgFfTyefPVaOICQXmTj7Vekk_OWvDQ1ojVrbA5Arpa223yGZMCoy2PYCAgy9YxJyBermVV",
    ),
    imageAlt: "Smartphones, headphones and golden voucher tickets",
  },
  {
    id: "super-brands",
    badge: "Super Brand Day",
    subBadge: "100% authentic",
    title: "Official Brands, Mall Prices",
    body: "Shop verified flagship stores with 15-day free returns and",
    highlight: "zero fake guarantee.",
    cta: { label: "Shop Kachi Mall", href: "/products" },
    image: img(
      "AB6AXuA1ZtBbLOlZK900XLV2XVu3uVtqvwqSMv0JVo_ziOYPexLnoWWfWtmBefMSyw9D_JtZl8YpIofAppfgve5pc_Tz9Frrn4A_Bj5xRquAb5s38gHPFGMOx6gIcsQUfCROS1sJVaPh8-uyoM8exyJC-3eyjGKKGwJ-YMxUZ0EWVSp3LTeqBYwnGj8ii2zNWmFz8t_WeBXrF1fM6xAz-8OJdjrm0aHB4LjcMGb7DD7GQqcyP7dyOfLHpmM_",
    ),
    imageAlt: "Headphones, tablets and smartwatches on store shelves",
  },
  {
    id: "global-express",
    badge: "Global Express",
    subBadge: "Free air shipping",
    title: "Imports from KR, JP & US",
    body: "Free flight shipping on orders over $25, delivered in",
    highlight: "3–5 days.",
    cta: { label: "Shop Global", href: "/products" },
    image: img(
      "AB6AXuBpKxZnRj6LG1P0GTcwmNKtKFFlPQSHUsIXKroM2Rpj2NZuJJuphwQ1JKo4OE2KHn2GwSPmggW6i4rDxwbVxNUT8ZWt-snjU1i_oTm2cy7NFRjfA67iLr902buppCesaSN9RqyurXrQFqiQ9GWSrt0XmTDV1J_WqtmTNuhN9t7tBhAJn1LVQVBanI00npgHENlRhIwuzE3J9vou4DqfA4drKRI7ZtDxnGi1-8cwh7j5vBGhjGUVev8W",
    ),
    imageAlt: "Cargo plane taking off with parcels",
  },
];

export const brandDeals = [
  { value: "-40%", brand: "SONY", tone: "text-primary" },
  { value: "Up to $30", brand: "APPLE", tone: "text-secondary" },
  { value: "B1G1", brand: "DYSON", tone: "text-tertiary" },
];

export const promoImages = {
  brands: heroSlides[1].image,
  global: heroSlides[2].image,
};
