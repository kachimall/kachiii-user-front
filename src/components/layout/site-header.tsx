import Link from "next/link";
import {
  ChevronDownIcon,
  CircleHelpIcon,
  GlobeIcon,
  LanguagesIcon,
  MenuIcon,
  SearchIcon,
  TruckIcon,
} from "lucide-react";
import { CartButton } from "@/components/layout/cart-button";
import { Logo } from "@/components/layout/logo";
import { MainNav } from "@/components/layout/main-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { getCategories } from "@/lib/api/products";
import { trendingSearches } from "@/lib/data/home";

// Fixed row heights at lg (32 + 76 + 44 = 152px) let sticky elements below
// the header use `lg:top-38`.
export async function SiteHeader() {
  // The header renders on every page, so a backend outage mustn't take it down.
  const categories = await getCategories().catch(() => []);

  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="hidden bg-secondary text-white md:block">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-6 text-label-xs">
          <ul className="flex items-center gap-4">
            <li className="flex items-center gap-1">
              Follow us
              <GlobeIcon aria-hidden className="size-3.5" />
            </li>
          </ul>
          <ul className="flex items-center gap-4">
            <li>
              <Link href="#" className="flex items-center gap-1 hover:text-on-secondary-container">
                <CircleHelpIcon aria-hidden className="size-3.5" />
                Help &amp; Support
              </Link>
            </li>
            <li aria-hidden className="opacity-40">|</li>
            <li className="flex items-center gap-1">
              <LanguagesIcon aria-hidden className="size-3.5" />
              English / AED
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-3 py-2.5 md:flex-nowrap md:px-6 lg:h-19">
        <Link href="/" aria-label="Kachi Mall home" className="shrink-0 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <Logo />
        </Link>

        <div className="order-last w-full md:order-0 md:max-w-2xl md:flex-1">
          <form action="/products" role="search" className="flex items-center rounded-lg bg-surface-container-low p-0.5 shadow-inner">
            <label className="relative hidden shrink-0 items-center sm:flex">
              <span className="sr-only">Category</span>
              <select
                name="category"
                defaultValue=""
                className="appearance-none bg-transparent py-1 pr-6 pl-2.5 text-label-md text-on-surface-variant outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon aria-hidden className="pointer-events-none absolute right-1 size-4 text-on-surface-variant" />
            </label>
            <span aria-hidden className="hidden h-5 w-px bg-surface-container-highest sm:block" />
            <label htmlFor="site-search" className="sr-only">
              Search products
            </label>
            <input
              id="site-search"
              name="q"
              type="search"
              placeholder="Search Kachi Mall, Tech, Beauty & Fashion…"
              className="h-8 min-w-0 flex-1 bg-transparent px-2.5 text-body-sm placeholder:text-outline focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex items-center justify-center rounded-lg bg-primary-container px-6 py-1.5 text-white transition-colors outline-none hover:bg-primary focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <SearchIcon className="size-5" />
            </button>
          </form>
          <ul className="mt-1 hidden h-4 items-center gap-2.5 overflow-hidden lg:flex" aria-label="Trending searches">
            {trendingSearches.map((term) => (
              <li key={term}>
                <Link
                  href={`/products?q=${encodeURIComponent(term)}`}
                  className="text-label-xs whitespace-nowrap text-on-surface-variant transition-colors hover:text-primary"
                >
                  {term}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex shrink-0 items-center gap-3 md:gap-6">
          <CartButton />
          <UserMenu />
        </div>
      </div>

      <div className="border-t border-surface-container-low md:border-0">
        <div className="mx-auto flex h-11 max-w-7xl items-center justify-between gap-6 px-3 md:px-6">
          <Link
            href="/products"
            className="hidden h-9 shrink-0 items-center gap-1.5 rounded-lg bg-secondary px-4 text-label-md text-white transition-opacity hover:opacity-95 md:flex"
          >
            <MenuIcon aria-hidden className="size-4.5" />
            All Categories
          </Link>
          <MainNav />
          <span className="hidden shrink-0 items-center gap-1 text-label-xs text-primary lg:flex">
            <TruckIcon aria-hidden className="size-4" />
            Free Shipping Across Mall
          </span>
        </div>
      </div>
    </header>
  );
}
