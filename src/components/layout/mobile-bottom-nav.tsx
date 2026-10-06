"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Drawer } from "@base-ui/react/drawer";
import {
  CircleUserRoundIcon,
  HouseIcon,
  LayoutGridIcon,
  ShoppingBagIcon,
  XIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react";
import { isApiImage } from "@/lib/api/client";
import { formatCount } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { useAuth, useAuthHydrated } from "@/store/auth";
import { selectCount, useCart, useCartHydrated } from "@/store/cart";
import type { Category } from "@/types";

/** Pages with their own fixed bottom bar (product buy bar, checkout flow) skip the tab bar. */
function hiddenOn(pathname: string) {
  return pathname.startsWith("/checkout") || /^\/products\/[^/]+/.test(pathname);
}

const itemClass =
  "relative flex h-full flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold outline-none transition-colors focus-visible:bg-surface-container-low";

function NavIcon({ icon: Icon, active, badge }: { icon: LucideIcon; active: boolean; badge?: number }) {
  return (
    <span className="relative">
      <Icon aria-hidden className={cn("size-6", active && "fill-primary/15")} strokeWidth={active ? 2.25 : 1.75} />
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] leading-none font-bold text-white ring-2 ring-surface-container-lowest">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </span>
  );
}

function NavLink({
  href,
  label,
  icon,
  active,
  badge,
  ariaLabel,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  badge?: number;
  ariaLabel?: string;
}) {
  return (
    <li className="flex flex-1">
      <Link
        href={href}
        aria-label={ariaLabel}
        aria-current={active ? "page" : undefined}
        className={cn(itemClass, active ? "text-primary" : "text-on-surface-variant active:text-on-surface")}
      >
        {active && <span aria-hidden className="absolute top-0 h-0.5 w-8 rounded-b-full bg-primary" />}
        <NavIcon icon={icon} active={active} badge={badge} />
        {label}
      </Link>
    </li>
  );
}

/** Fixed tab bar for phones; hidden from md up, where the header carries navigation. */
export function MobileBottomNav({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const cartHydrated = useCartHydrated();
  const count = useCart(selectCount);
  const authHydrated = useAuthHydrated();
  const signedIn = useAuth((s) => !!s.user);

  if (hiddenOn(pathname)) return null;

  const cartCount = cartHydrated ? count : 0;
  const me = authHydrated && signedIn;
  const onAccount = ["/account", "/login", "/register", "/forgot-password", "/reset-password"].some((p) =>
    pathname.startsWith(p),
  );

  return (
    <nav
      aria-label="Bottom"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-container bg-surface-container-lowest/95 pb-[env(safe-area-inset-bottom)] shadow-float backdrop-blur-md md:hidden"
    >
      <ul className="flex h-(--bottom-nav-h) items-stretch">
        <NavLink href="/" label="Home" icon={HouseIcon} active={pathname === "/"} />
        <li className="flex flex-1">
          <CategoriesSheet categories={categories} active={pathname === "/products"} />
        </li>
        <li className="flex flex-1 items-start justify-center">
          <Link
            href="/#flash"
            aria-label="Flash deals"
            className="group -mt-4 flex flex-col items-center gap-0.5 text-[10px] font-bold text-primary outline-none"
          >
            <span className="grid size-12 place-items-center rounded-full bg-linear-to-tr from-primary to-primary-container text-white shadow-lg ring-4 ring-surface-container-lowest transition-transform group-active:scale-95 group-focus-visible:ring-ring/50">
              <ZapIcon aria-hidden className="size-6 fill-white" />
            </span>
            Deals
          </Link>
        </li>
        <NavLink
          href="/cart"
          label="Cart"
          icon={ShoppingBagIcon}
          active={pathname === "/cart"}
          badge={cartCount}
          ariaLabel={cartCount > 0 ? `Cart, ${cartCount} items` : undefined}
        />
        <NavLink href={me ? "/account" : "/login"} label={me ? "Me" : "Sign in"} icon={CircleUserRoundIcon} active={onAccount} />
      </ul>
    </nav>
  );
}

function CategoriesSheet({ categories, active }: { categories: Category[]; active: boolean }) {
  return (
    <Drawer.Root>
      <Drawer.Trigger
        className={cn(itemClass, active ? "text-primary" : "text-on-surface-variant active:text-on-surface")}
      >
        {active && <span aria-hidden className="absolute top-0 h-0.5 w-8 rounded-b-full bg-primary" />}
        <NavIcon icon={LayoutGridIcon} active={active} />
        Categories
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-black opacity-[calc(0.4*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
        <Drawer.Viewport className="fixed inset-0 z-50 flex items-end justify-center">
          <Drawer.Popup className="-mb-12 max-h-[calc(85dvh+3rem)] w-full overflow-y-auto overscroll-contain rounded-t-2xl bg-surface-container-lowest px-4 pt-2.5 pb-[calc(1rem+env(safe-area-inset-bottom,0px)+3rem)] text-on-surface shadow-float outline-none [transform:translateY(var(--drawer-swipe-movement-y))] transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:select-none data-starting-style:[transform:translateY(calc(100%-3rem+2px))] data-ending-style:[transform:translateY(calc(100%-3rem+2px))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] motion-reduce:transition-none">
            <div aria-hidden className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-surface-container-highest" />
            <Drawer.Content>
              <div className="mb-4 flex items-center justify-between">
                <Drawer.Title className="font-heading text-headline-md">Shop by category</Drawer.Title>
                <Drawer.Close
                  aria-label="Close"
                  className="grid size-9 place-items-center rounded-full bg-surface-container-low outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <XIcon className="size-5" />
                </Drawer.Close>
              </div>
              <Drawer.Close
                render={<Link href="/products" />}
                className="mb-4 flex items-center justify-between rounded-lg bg-linear-to-r from-secondary to-secondary-container px-4 py-3 text-white outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span>
                  <span className="block font-heading text-headline-sm">Browse everything</span>
                  <span className="block text-label-xs text-on-secondary-container">All categories, newest first</span>
                </span>
                <LayoutGridIcon aria-hidden className="size-6" />
              </Drawer.Close>
              {categories.length > 0 ? (
                <ul className="grid grid-cols-4 gap-x-2 gap-y-4">
                  {categories.map((c) => (
                    <li key={c.slug}>
                      <Drawer.Close
                        render={<Link href={`/products?category=${c.slug}`} />}
                        className="flex flex-col items-center gap-1 rounded-md text-center outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <span className="relative size-16 overflow-hidden rounded-full bg-surface-container-low shadow-inner">
                          <Image src={c.image} alt="" fill sizes="64px" unoptimized={isApiImage(c.image)} className="object-cover" />
                        </span>
                        <span className="line-clamp-2 text-label-md leading-tight">{c.name}</span>
                        {c.itemCount ? (
                          <span className="-mt-0.5 text-[10px] text-on-surface-variant">{formatCount(c.itemCount)}+</span>
                        ) : null}
                      </Drawer.Close>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-center text-body-md text-on-surface-variant">Categories are unavailable right now.</p>
              )}
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
