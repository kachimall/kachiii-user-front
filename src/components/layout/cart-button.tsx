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
      className="relative rounded-lg p-1 outline-none transition-colors hover:bg-surface-container focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <ShoppingBagIcon className="size-6" />
      {shown > 0 && (
        <span className="absolute top-0 right-0 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-0.5 text-[9px] font-bold text-white">
          {shown > 99 ? "99+" : shown}
        </span>
      )}
    </Link>
  );
}
