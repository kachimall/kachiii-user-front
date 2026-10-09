import { BannerCarousel } from "@/components/home/banner-carousel";
import { CategoryRail } from "@/components/home/category-rail";
import { DiscoverFeed } from "@/components/home/discover-feed";
import { FlashSale } from "@/components/home/flash-sale";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { HomeSections } from "@/components/home/home-sections";
import { PromoTiles } from "@/components/home/promo-tiles";
import { SideBanners } from "@/components/home/side-banners";
import { SponsoredAds } from "@/components/product/sponsored-ads";
import { IdleShowcase, ShowcaseSlot } from "@/components/showcase/idle-showcase";
import { ShowcaseProvider } from "@/components/showcase/showcase-context";
import { getHomeBanners } from "@/lib/api/banners";
import { getCategories, getFlashSaleProducts, getHomeSections, getRecommendedProducts } from "@/lib/api/products";
import { heroSlides } from "@/lib/data/home";
import { bannerFace, showcaseFaces } from "@/lib/data/showcase";

/**
 * Where the special-category showcase goes. `?showcase=1|2|3` previews the
 * client's placement options on their own; without it the page uses the
 * chosen option 3, with no idle pop-up.
 *   1 — in the hero, to the right of the flash deal text (replaces the banner image)
 *   2 — only on idle, zooming out of the hero banner image
 *   3 — replaces the whole flat flash-deal hero banner
 *
 * By default the cube is the hero banner and never pops up; its faces are the
 * admin's home carousel banners (GET /banners) when there are any, else the
 * built-in ones. With `?showcase=2` the slider shows the admin's banners too,
 * else the built-in promos. The cards beside the hero show the
 * admin's side banners when there are any. The rows under the categories are
 * the admin's home sections (GET /home-sections), none when staff set up none.
 *
 * The voucher strip and the shortcut row (quick-actions.tsx) are hidden until the
 * backend has campaigns for them; their components are kept.
 */
type Placement = "default" | "1" | "2" | "3";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { showcase } = await searchParams;
  const placement: Placement = showcase === "1" || showcase === "2" || showcase === "3" ? showcase : "default";

  const [flashSale, recommended, categories, banners, sections] = await Promise.all([
    getFlashSaleProducts(),
    getRecommendedProducts(),
    getCategories(),
    getHomeBanners(),
    getHomeSections(),
  ]);
  const carousel = placement === "2" ? banners.home_carousel : [];
  // The cube turns through the admin's home carousel banners, or the built-in faces without any.
  const faces = banners.home_carousel.length > 0 ? banners.home_carousel.map(bannerFace) : showcaseFaces;

  return (
    <>
      <ShowcaseProvider faces={faces}>
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-3 md:gap-6 md:px-6 md:py-4">
          <section aria-label="Featured promotions" className="grid grid-cols-1 gap-2.5 md:gap-4 lg:grid-cols-12">
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
          <FlashSale products={flashSale} />
          <CategoryRail categories={categories} />
          <HomeSections sections={sections} />
          <SponsoredAds placement="home" title="Sponsored picks" />
          <DiscoverFeed products={recommended} />
        </div>
        {placement === "2" && <IdleShowcase />}
      </ShowcaseProvider>
    </>
  );
}
