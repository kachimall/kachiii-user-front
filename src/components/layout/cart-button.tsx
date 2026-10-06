"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ShoppingBagIcon } from "lucide-react";
import { resumeSession } from "@/lib/session";
import { useAuth } from "@/store/auth";
import { selectCount, useCart, useCartHydrated } from "@/store/cart";

/** Loads the saved session and cart from localStorage once, after the first render. */
export function SessionHydrator() {
  useEffect(() => {
    void Promise.all([useAuth.persist.rehydrate(), useCart.persist.rehydrate()]).then(resumeSession);
  }, []);
  return null;
}

export function CartButton() {
  const hydrated = useCartHydrated();
  const count = useCart(selectCount);
  const shown = hydrated ? count : 0;

  return (
    <Link
      href="/cart"
      aria-label={shown > 0 ? `Cart, ${shown} items` : "Cart"}
      className="flex items-center gap-2 rounded-lg px-2 py-1 outline-none transition-colors hover:bg-surface-container-low focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="relative">
        <ShoppingBagIcon aria-hidden className="size-6" strokeWidth={1.75} />
        {shown > 0 && (
          <span className="absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-white ring-2 ring-surface-container-lowest">
            {shown > 99 ? "99+" : shown}
          </span>
        )}
      </span>
      <span aria-hidden className="hidden flex-col text-left lg:flex">
        <span className="text-label-md">Cart</span>
        <span className="text-label-xs font-normal text-on-surface-variant">
          {shown} {shown === 1 ? "item" : "items"}
        </span>
      </span>
    </Link>
  );
}
