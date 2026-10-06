"use client";

import Link from "next/link";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { OrderSummary } from "@/components/cart/order-summary";
import { ProductImage } from "@/components/product/product-image";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { buttonVariants } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { formatPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth";
import { selectSubtotal, useCart, useCartHydrated } from "@/store/cart";
import type { CartItem } from "@/types";

const statusNote: Record<NonNullable<CartItem["status"]>, string | undefined> = {
  available: undefined,
  unavailable: "No longer available",
  sold_out: "Sold out",
  insufficient_stock: "Not enough stock for this quantity",
};

function report(error: unknown) {
  toast.error(error instanceof ApiError ? error.message : "Couldn’t update your cart. Try again.");
}

export function CartView() {
  const hydrated = useCartHydrated();
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectSubtotal);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const signedIn = useAuth((s) => !!s.token);

  if (!hydrated) {
    return <div aria-busy className="h-64 animate-pulse rounded-3xl bg-muted" />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-3xl border border-dashed bg-card p-10">
        <p className="font-heading text-2xl font-bold">Your cart is empty.</p>
        <p className="text-muted-foreground">Add a few things and they’ll wait here until you check out.</p>
        <Link href="/products" className={cn(buttonVariants(), "h-10 rounded-full px-5")}>
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
      <ul className="flex flex-col divide-y border-y">
        {items.map((item) => {
          const note = item.status && statusNote[item.status];
          return (
            <li key={item.variantId} className="flex gap-4 py-5">
              <Link href={`/products/${item.productId}`} className="w-24 shrink-0 sm:w-28">
                <ProductImage name={item.name} image={item.image} sizes="112px" className="rounded-2xl" />
              </Link>
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link href={`/products/${item.productId}`} className="font-medium hover:underline">
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{item.variantName}</p>
                    {note && <p className="text-sm text-destructive">{note}</p>}
                  </div>
                  <p className="tabular-nums text-sm">{formatPrice(item.price * item.quantity)}</p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <QuantityStepper
                    label={`Quantity for ${item.name}`}
                    value={item.quantity}
                    max={item.stock && item.stock > 0 ? Math.min(item.stock, 99) : undefined}
                    onChange={(q) => setQuantity(item.variantId, q).catch(report)}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.variantId).catch(report)}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <Trash2Icon aria-hidden className="size-4" />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <OrderSummary subtotal={subtotal} className="self-start lg:sticky lg:top-32">
        <Link
          href={signedIn ? "/checkout" : "/login?next=/checkout"}
          className={cn(buttonVariants(), "h-11 rounded-full text-base")}
        >
          {signedIn ? "Check out" : "Sign in to check out"}
        </Link>
        <Link href="/products" className="text-center text-sm text-muted-foreground hover:text-foreground hover:underline">
          Keep shopping
        </Link>
      </OrderSummary>
    </div>
  );
}
