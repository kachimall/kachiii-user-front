import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-3 pt-4 sm:px-6 sm:pt-10">
      <h1 className="mb-4 font-heading text-headline-lg-mobile tracking-tight sm:mb-8 sm:text-5xl sm:font-extrabold">Cart</h1>
      <CartView />
    </div>
  );
}
