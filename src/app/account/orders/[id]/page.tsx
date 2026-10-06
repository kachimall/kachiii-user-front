import type { Metadata } from "next";
import Link from "next/link";
import { OrderDetails } from "@/components/account/order-details";

export const metadata: Metadata = { title: "Order details" };

// Linked from order emails, so the path must stay /account/orders/{id}.
export default async function OrderPage({ params }: PageProps<"/account/orders/[id]">) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 pb-16 sm:px-6">
      <Link href="/account" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
        ← My orders
      </Link>
      <h1 className="mt-4 mb-8 font-heading text-4xl font-extrabold tracking-tight">Order details</h1>
      <OrderDetails id={id} />
    </div>
  );
}
