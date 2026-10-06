import type { Metadata } from "next";
import { Suspense } from "react";
import { MockPayment } from "@/components/checkout/mock-payment";

export const metadata: Metadata = { title: "Payment" };

export default function PaymentPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 pt-16 sm:px-6">
      <h1 className="font-heading text-4xl font-extrabold tracking-tight">Payment</h1>
      <Suspense fallback={<div aria-busy className="h-64 animate-pulse rounded-3xl bg-muted" />}>
        <MockPayment />
      </Suspense>
    </div>
  );
}
