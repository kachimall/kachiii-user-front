import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-3 pt-3 md:px-6 md:pt-6">
      <h1 className="mb-3 font-heading text-headline-lg-mobile md:text-headline-lg md:mb-4">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
