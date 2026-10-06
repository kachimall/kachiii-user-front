import { FlameIcon } from "lucide-react";
import { BannerCarousel } from "@/components/home/banner-carousel";
import { CategoryRail } from "@/components/home/category-rail";
import { ClaimVoucherButton } from "@/components/home/claim-voucher-button";
import { DiscoverFeed } from "@/components/home/discover-feed";
import { FlashSale } from "@/components/home/flash-sale";
import { FloatingActions } from "@/components/home/floating-actions";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { PromoTiles } from "@/components/home/promo-tiles";
import { QuickActions } from "@/components/home/quick-actions";
import { SideBanners } from "@/components/home/side-banners";
import { IdleShowcase, ShowcaseSlot } from "@/components/showcase/idle-showcase";
import { ShowcaseProvider } from "@/components/showcase/showcase-context";
import { getHomeBanners } from "@/lib/api/banners";
import { getCategories, getFlashSaleProducts, getRecommendedProducts } from "@/lib/api/products";
import { heroSlides, voucherCode } from "@/lib/data/home";
import { showcaseFaces } from "@/lib/data/showcase";

/**
 * Where the special-category showcase goes. `?showcase=1|2|3` previews the
 * client's placement options on their own; without it the page uses the
 * chosen option 3, with no idle pop-up.
 *   1 — in the hero, to the right of the flash deal text (replaces the banner image)
 *   2 — only on idle, zooming out of the hero banner image
 *   3 — replaces the whole flat flash-deal hero banner
 *
 * By default the cube is the hero banner and never pops up. With
 * `?showcase=2` the slider shows the admin's home banners (GET /banners) when
 * there are any, else the built-in promos. The cards beside the hero show the
 * admin's side banners when there are any.
 */
type Placement = "default" | "1" | "2" | "3";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { showcase } = await searchParams;
  const placement: Placement = showcase === "1" || showcase === "2" || showcase === "3" ? showcase : "default";

  const [flashSale, recommended, categories, banners] = await Promise.all([
    getFlashSaleProducts(),
    getRecommendedProducts(),
    getCategories(),
    getHomeBanners(),
  ]);
  const carousel = placement === "2" ? banners.home_carousel : [];

  return (
    <>
      <div
        id="vouchers"
        className="flex scroll-mt-40 flex-wrap items-center justify-center gap-x-2.5 gap-y-1 bg-primary-fixed px-3 py-1 text-center text-label-md text-on-primary-fixed-variant md:px-6"
      >
        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-label-xs text-white motion-safe:animate-pulse">
          <FlameIcon aria-hidden className="size-3" />
          LIVE
        </span>
        <span>
          <strong>MID-YEAR MEGA BLOWOUT:</strong> Extra 15% stackable mall voucher for the next 200 orders. Use code:{" "}
          <strong>{voucherCode}</strong>
        </span>
        <ClaimVoucherButton className="font-bold text-primary underline transition-colors hover:text-on-primary-fixed-variant">
          Collect Voucher
        </ClaimVoucherButton>
      </div>

      <ShowcaseProvider faces={showcaseFaces}>
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-3 py-2.5 md:px-6">
          <section aria-label="Featured promotions" className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {placement === "default" || placement === "3" ? (
              <ShowcaseSlot
                className="w-full lg:col-span-8 lg:aspect-auto lg:h-full lg:min-h-90"
                sizes="(min-width: 1280px) 820px, (min-width: 1024px) 66vw, 96vw"
              />
            ) : carousel.length > 0 ? (
              <BannerCarousel banners={carousel} />
            ) : (
              <HeroCarousel slides={heroSlides} media={placement === "2" ? "anchor" : "cube"} />
            )}
            {banners.home_side.length > 0 ? <SideBanners banners={banners.home_side} /> : <PromoTiles />}
          </section>
          <QuickActions />
          <FlashSale products={flashSale} />
          <CategoryRail categories={categories} />
          <DiscoverFeed products={recommended} />
        </div>
        {placement === "2" && <IdleShowcase />}
      </ShowcaseProvider>

      <FloatingActions />
    </>
  );
}
