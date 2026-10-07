import Link from "next/link";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CircleHelpIcon,
  LanguagesIcon,
  MenuIcon,
  SearchIcon,
  ShieldCheckIcon,
  StoreIcon,
  TrendingUpIcon,
  TruckIcon,
} from "lucide-react";
import { CartButton } from "@/components/layout/cart-button";
import { Logo } from "@/components/layout/logo";
import { MainNav } from "@/components/layout/main-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { getCategories } from "@/lib/api/products";
import { trendingSearches } from "@/lib/data/home";

const SELLER_URL = process.env.NEXT_PUBLIC_SELLER_URL ?? "http://localhost:3002";

const utilityLink = "flex items-center gap-1 transition-colors hover:text-on-secondary-container";

// Fixed row heights at lg (32 + 76 + 44 = 152px) let sticky elements below
// the header use `lg:top-38`.
export async function SiteHeader() {
  // The header renders on every page, so a backend outage mustn't take it down.
  const categories = await getCategories().catch(() => []);

  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
      <div className="hidden bg-secondary text-white md:block">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-6 text-label-xs">
          <ul className="flex items-center gap-5">
            <li className="flex items-center gap-1">
              <TruckIcon aria-hidden className="size-3.5" />
              Free shipping across the mall
            </li>
            <li className="hidden items-center gap-1 lg:flex">
              <ShieldCheckIcon aria-hidden className="size-3.5" />
              100% authentic brands
            </li>
          </ul>
          <ul className="flex items-center gap-4">
            <li>
              <a href={SELLER_URL} className={utilityLink}>
                <StoreIcon aria-hidden className="size-3.5" />
                Sell on Kachiii
              </a>
            </li>
            <li aria-hidden className="h-3 w-px bg-white/30" />
            <li>
              <Link href="#" className={utilityLink}>
                <CircleHelpIcon aria-hidden className="size-3.5" />
                Help &amp; Support
              </Link>
            </li>
            <li aria-hidden className="h-3 w-px bg-white/30" />
            <li className="flex items-center gap-1">
              <LanguagesIcon aria-hidden className="size-3.5" />
              English · AED
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-2.5 px-3 py-2 md:gap-6 md:px-6 md:py-2.5 lg:h-19 lg:gap-10">
        <Link
          href="/"
          aria-label="Kachiii Mall home"
          className="shrink-0 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Logo collapse />
        </Link>

        <div className="min-w-0 flex-1">
          <form
            action="/products"
            role="search"
            className="flex h-10 items-center rounded-lg border border-surface-container-highest bg-surface-container-lowest transition-[border-color,box-shadow] hover:border-outline-variant focus-within:border-primary-container/60 focus-within:shadow-[0_0_0_3px_rgb(228_0_108/0.1)] md:h-11"
          >
            <label className="relative hidden h-full shrink-0 items-center sm:flex">
              <span className="sr-only">Category</span>
              <select
                name="category"
                defaultValue=""
                className="h-full max-w-40 cursor-pointer appearance-none truncate rounded-l-md bg-surface-container-low py-1 pr-7 pl-3 text-label-md text-on-surface outline-none transition-colors hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon aria-hidden className="pointer-events-none absolute right-2 size-4 text-on-surface-variant" />
            </label>
            <label htmlFor="site-search" className="sr-only">
              Search products
            </label>
            <input
              id="site-search"
              name="q"
              type="search"
              autoComplete="off"
              placeholder="Search products, brands and stores…"
              className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-body-md placeholder:text-outline focus:outline-none sm:px-3"
            />
            <button
              type="submit"
              aria-label="Search"
              className="m-0.5 flex h-[calc(100%-4px)] items-center justify-center gap-1.5 rounded-md bg-primary-container px-3.5 font-heading text-headline-sm text-white transition-colors outline-none hover:bg-primary focus-visible:ring-3 focus-visible:ring-ring/50 sm:px-5"
            >
              <SearchIcon aria-hidden className="size-4.5" />
              <span className="hidden lg:inline">Search</span>
            </button>
          </form>
          <div className="mt-1 hidden h-4 items-center gap-2 overflow-hidden lg:flex">
            <span className="flex shrink-0 items-center gap-1 text-label-xs text-primary">
              <TrendingUpIcon aria-hidden className="size-3.5" />
              Trending
            </span>
            <ul className="flex items-center gap-3 overflow-hidden" aria-label="Trending searches">
              {trendingSearches.map((term) => (
                <li key={term}>
                  <Link
                    href={`/products?q=${encodeURIComponent(term)}`}
                    className="text-label-xs font-normal whitespace-nowrap text-on-surface-variant transition-colors hover:text-primary"
                  >
                    {term}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Phones get cart and account from the bottom tab bar. */}
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <CartButton />
          <span aria-hidden className="h-8 w-px bg-surface-container-high" />
          <UserMenu />
        </div>
      </div>

      <div className="border-t border-surface-container-low">
        <div className="mx-auto flex h-10 max-w-7xl items-center gap-4 px-3 md:h-11 md:px-6">
          {categories.length > 0 ? (
            <div className="group/cats relative hidden shrink-0 md:block">
              <Link
                href="/products"
                aria-haspopup="true"
                className="flex h-9 items-center gap-1.5 rounded-lg bg-secondary px-4 text-label-md text-white transition-colors outline-none hover:bg-secondary-container focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <MenuIcon aria-hidden className="size-4.5" />
                All Categories
                <ChevronDownIcon
                  aria-hidden
                  className="size-4 transition-transform group-focus-within/cats:rotate-180 group-hover/cats:rotate-180"
                />
              </Link>
              {/* Opens on hover and on keyboard focus, so it needs no script. */}
              <div className="invisible absolute top-full left-0 z-50 pt-1.5 opacity-0 transition-[opacity,visibility] duration-150 group-focus-within/cats:visible group-focus-within/cats:opacity-100 group-hover/cats:visible group-hover/cats:opacity-100">
                <ul className="w-64 overflow-hidden rounded-lg bg-surface-container-lowest py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-surface-container">
                  {categories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/products?category=${c.slug}`}
                        className="flex items-center justify-between gap-2 px-4 py-2 text-body-md transition-colors outline-none hover:bg-primary-fixed/50 hover:text-primary focus-visible:bg-primary-fixed/50 focus-visible:text-primary"
                      >
                        {c.name}
                        <ChevronRightIcon aria-hidden className="size-4 text-outline" />
                      </Link>
                    </li>
                  ))}
                  <li className="mt-1 border-t border-surface-container pt-1">
                    <Link
                      href="/products"
                      className="block px-4 py-2 text-label-md text-secondary outline-none hover:underline focus-visible:underline"
                    >
                      Shop all products
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <Link
              href="/products"
              className="hidden h-9 shrink-0 items-center gap-1.5 rounded-lg bg-secondary px-4 text-label-md text-white transition-colors hover:bg-secondary-container md:flex"
            >
              <MenuIcon aria-hidden className="size-4.5" />
              All Categories
            </Link>
          )}
          <MainNav />
        </div>
      </div>
    </header>
  );
}
