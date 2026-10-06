import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-3 pt-3 md:px-6 md:pt-6">
      <h1 className="mb-3 font-heading text-headline-lg-mobile md:text-headline-lg md:mb-4">Shopping cart</h1>
      <CartView />
    </div>
  );
}
