import type { Metadata } from "next";
import { Suspense } from "react";
import { MockPayment } from "@/components/checkout/mock-payment";

export const metadata: Metadata = { title: "Payment" };

export default function PaymentPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-3 pt-4 md:pt-8">
      <h1 className="font-heading text-headline-lg-mobile md:text-headline-lg">Payment</h1>
      <Suspense fallback={<div aria-busy className="h-64 animate-pulse rounded-lg bg-surface-container" />}>
        <MockPayment />
      </Suspense>
    </div>
  );
}
