"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { getProduct } from "@/lib/api/products";
import { useCart } from "@/store/cart";
import type { Product } from "@/types";

/** "+" on product cards. Adds the only in-stock option, or opens the product to choose one. */
export function QuickAddButton({ product }: { product: Product }) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const [busy, setBusy] = useState(false);
  const href = `/products/${product.id}`;

  async function handleClick() {
    setBusy(true);
    try {
      // List cards carry no variants, so look them up first.
      const detail = product.variants.length > 0 ? product : await getProduct(product.id);
      const inStock = detail?.variants.filter((v) => v.stock > 0) ?? [];
      if (!detail || inStock.length !== 1) {
        router.push(href);
        return;
      }
      const variant = inStock[0];
      await addItem({
        productId: detail.id,
        variantId: variant.id,
        name: detail.name,
        variantName: variant.name,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        image: variant.image ?? detail.images[0],
      });
      toast.success("Added to cart", {
        description: detail.name,
        action: { label: "View cart", onClick: () => router.push("/cart") },
      });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn’t add that to your cart.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!product.inStock || busy}
      aria-label={`Add ${product.name} to cart`}
      className="relative z-10 grid size-7 shrink-0 place-items-center rounded-full bg-primary-container text-white shadow transition-transform outline-none hover:bg-primary focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-90 disabled:opacity-40"
    >
      <PlusIcon className="size-4" strokeWidth={2.5} />
    </button>
  );
}
