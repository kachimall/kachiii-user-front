import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <h1 className="mb-8 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">Cart</h1>
      <CartView />
    </div>
  );
}
