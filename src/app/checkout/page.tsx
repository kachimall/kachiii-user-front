import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <h1 className="mb-8 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
