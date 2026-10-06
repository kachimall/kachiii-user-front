"use client";

import Link from "next/link";
import { ShoppingBagIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { OrderSummary } from "@/components/cart/order-summary";
import { ProductImage } from "@/components/product/product-image";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/empty-state";
import { ApiError } from "@/lib/api/client";
import { formatPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth";
import { selectCount, selectSubtotal, useCart, useCartHydrated } from "@/store/cart";
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
  const addItem = useCart((s) => s.addItem);
  const signedIn = useAuth((s) => !!s.token);
  const itemCount = useCart(selectCount);
  const checkoutHref = signedIn ? "/checkout" : "/login?next=/checkout";
  const savings = items.reduce(
    (sum, i) => sum + (i.compareAtPrice && i.compareAtPrice > i.price ? (i.compareAtPrice - i.price) * i.quantity : 0),
    0,
  );

  async function remove(item: CartItem) {
    try {
      await removeItem(item.variantId);
      const { productId, variantId, name, variantName, price, compareAtPrice, image, quantity } = item;
      toast("Removed from cart", {
        description: name,
        action: {
          label: "Undo",
          onClick: () => addItem({ productId, variantId, name, variantName, price, compareAtPrice, image }, quantity).catch(report),
        },
      });
    } catch (error) {
      report(error);
    }
  }

  if (!hydrated) {
    return (
      <div aria-busy className="flex flex-col gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex gap-3 rounded-lg bg-surface-container-lowest p-3 shadow-card">
            <Skeleton className="size-20 shrink-0 sm:size-24" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="mt-auto h-8 w-28 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBagIcon}
        title="Your cart is empty"
        description="Add a few things and they’ll wait here until you check out."
      >
        <Link href="/products" className={cn(buttonVariants(), "h-10 rounded-full px-6")}>
          Start shopping
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-4 pb-20 lg:grid-cols-[1fr_22rem] lg:gap-6 lg:pb-0">
      <ul className="flex flex-col divide-y divide-surface-container self-start rounded-lg bg-surface-container-lowest px-3 shadow-card sm:px-5">
        {items.map((item) => {
          const note = item.status && statusNote[item.status];
          return (
            <li key={item.variantId} className="flex gap-3 py-4 sm:gap-4 sm:py-5">
              <Link href={`/products/${item.productId}`} className="w-20 shrink-0 sm:w-28">
                <ProductImage name={item.name} image={item.image} sizes="112px" />
              </Link>
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex justify-between gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <Link href={`/products/${item.productId}`} className="line-clamp-2 font-heading text-headline-sm hover:text-primary">
                      {item.name}
                    </Link>
                    {item.variantName !== "Standard" && (
                      <p className="mt-1 inline-block rounded-sm bg-surface-container-low px-1.5 py-0.5 text-body-sm text-on-surface-variant">
                        {item.variantName}
                      </p>
                    )}
                    {note && <p className="mt-1 text-body-sm font-semibold text-destructive">{note}</p>}
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <p className="font-heading text-price-card text-secondary tabular-nums">{formatPrice(item.price * item.quantity)}</p>
                    {item.compareAtPrice && item.compareAtPrice > item.price && (
                      <s className="text-body-sm text-outline tabular-nums">{formatPrice(item.compareAtPrice * item.quantity)}</s>
                    )}
                    {item.quantity > 1 && (
                      <p className="text-body-sm text-on-surface-variant tabular-nums">{formatPrice(item.price)} each</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                  <QuantityStepper
                    label={`Quantity for ${item.name}`}
                    value={item.quantity}
                    max={item.stock && item.stock > 0 ? Math.min(item.stock, 99) : undefined}
                    onChange={(q) => setQuantity(item.variantId, q).catch(report)}
                  />
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    aria-label={`Remove ${item.name}`}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-body-md text-on-surface-variant outline-none transition-colors hover:bg-primary-fixed hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <Trash2Icon aria-hidden className="size-4" />
                    <span aria-hidden className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <OrderSummary subtotal={subtotal} savings={savings} className="self-start lg:sticky lg:top-42">
        <Link
          href={checkoutHref}
          className={cn(buttonVariants(), "h-11 rounded-full bg-linear-to-r from-primary to-primary-container font-heading text-headline-sm")}
        >
          {signedIn ? "Check out" : "Sign in to check out"}
        </Link>
        <Link href="/products" className="text-center text-body-md text-on-surface-variant hover:text-primary hover:underline">
          Keep shopping
        </Link>
      </OrderSummary>

      {/* Phone checkout bar, docked above the tab bar. */}
      <div className="fixed inset-x-0 bottom-above-nav z-30 border-t border-surface-container bg-surface-container-lowest/95 px-3 py-2 md:bottom-0 md:pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-float backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="leading-tight">
            <p className="text-label-xs font-normal text-on-surface-variant">
              Subtotal · {itemCount} {itemCount === 1 ? "item" : "items"}
              {savings > 0 && <span className="ml-1 font-bold text-primary">· Save {formatPrice(savings)}</span>}
            </p>
            <p className="font-heading text-price-hero text-secondary tabular-nums">{formatPrice(subtotal)}</p>
          </div>
          <Link
            href={checkoutHref}
            className={cn(buttonVariants(), "h-11 rounded-full bg-linear-to-r from-primary to-primary-container px-6 font-heading text-headline-sm")}
          >
            {signedIn ? "Check out" : "Sign in to check out"}
          </Link>
        </div>
      </div>
    </div>
  );
}
