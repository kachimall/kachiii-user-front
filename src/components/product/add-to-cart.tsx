"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { HouseIcon, ShoppingBagIcon } from "lucide-react";
import { toast } from "sonner";
import { Price } from "@/components/product/price";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { formatPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { selectCount, useCart, useCartHydrated } from "@/store/cart";
import type { Product } from "@/types";

export function AddToCart({ product }: { product: Product }) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const cartHydrated = useCartHydrated();
  const cartCount = useCart(selectCount);
  const firstInStock = product.variants.find((v) => v.stock > 0) ?? product.variants.at(0);
  const [variantId, setVariantId] = useState(firstInStock?.id);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const picked = product.variants.find((v) => v.id === variantId) ?? firstInStock;
  const showPicker = product.variants.length > 1;

  if (!picked) {
    return <p className="text-sm text-muted-foreground">This product isn’t available right now.</p>;
  }

  const variant = picked;
  const soldOut = variant.stock === 0;
  const lowStock = variant.stock > 0 && variant.stock <= 5;

  async function handleAdd() {
    setAdding(true);
    try {
      await addItem(
        {
          productId: product.id,
          variantId: variant.id,
          name: product.name,
          variantName: variant.name,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          image: variant.image ?? product.images[0],
        },
        quantity,
      );
      toast.success(`Added ${quantity} × ${product.name} to cart`, {
        action: { label: "View cart", onClick: () => router.push("/cart") },
      });
      setQuantity(1);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn’t add that to your cart.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Price price={variant.price} compareAtPrice={variant.compareAtPrice} size="hero" />
      {showPicker ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">Option</legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const selected = v.id === variant.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setVariantId(v.id);
                    setQuantity(1);
                  }}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                    selected
                      ? "border-foreground bg-foreground text-background"
                      : "bg-card hover:border-foreground/40",
                    v.stock === 0 && "text-muted-foreground line-through",
                  )}
                >
                  {v.name}
                  {v.stock === 0 && <span className="sr-only"> (sold out)</span>}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : (
        <p className="text-sm text-muted-foreground">{variant.name}</p>
      )}

      <p className="flex items-center gap-2 text-sm">
        <span
          aria-hidden
          className={cn("size-2 rounded-full", soldOut ? "bg-destructive" : lowStock ? "bg-star" : "bg-success")}
        />
        {soldOut ? "Sold out" : lowStock ? `Only ${variant.stock} left` : "In stock"}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper
          label="Quantity"
          value={quantity}
          onChange={setQuantity}
          max={Math.max(1, variant.stock)}
        />
        <Button onClick={handleAdd} disabled={soldOut || adding} className="h-10 flex-1 rounded-full px-6 text-sm sm:flex-none">
          {soldOut ? "Sold out" : "Add to cart"}
        </Button>
      </div>

      {/* Phone buy bar; replaces the tab bar on product pages. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-container bg-surface-container-lowest/95 pb-[env(safe-area-inset-bottom)] shadow-float backdrop-blur-md md:hidden">
        <div className="flex h-(--bottom-nav-h) items-center gap-1 px-2">
          <Link
            href="/"
            className="flex w-12 flex-col items-center gap-0.5 text-[10px] font-semibold text-on-surface-variant outline-none focus-visible:text-primary"
          >
            <HouseIcon aria-hidden className="size-5.5" strokeWidth={1.75} />
            Home
          </Link>
          <Link
            href="/cart"
            aria-label={cartHydrated && cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
            className="relative flex w-12 flex-col items-center gap-0.5 text-[10px] font-semibold text-on-surface-variant outline-none focus-visible:text-primary"
          >
            <ShoppingBagIcon aria-hidden className="size-5.5" strokeWidth={1.75} />
            Cart
            {cartHydrated && cartCount > 0 && (
              <span className="absolute -top-1 right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] leading-none font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          <div className="ml-1 flex min-w-0 flex-1 flex-col items-end leading-none">
            <span className="truncate font-heading text-price-card text-secondary tabular-nums">
              {formatPrice(variant.price * quantity)}
            </span>
            {quantity > 1 && <span className="text-[10px] text-on-surface-variant">{quantity} × {formatPrice(variant.price)}</span>}
          </div>
          <Button
            onClick={handleAdd}
            disabled={soldOut || adding}
            className="ml-1.5 h-11 shrink-0 rounded-full bg-linear-to-r from-primary to-primary-container px-5 font-heading text-headline-sm text-white"
          >
            <ShoppingBagIcon aria-hidden className="size-4.5" />
            {soldOut ? "Sold out" : adding ? "Adding…" : "Add to cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
