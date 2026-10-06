import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheckIcon } from "lucide-react";
import { OrderDetails } from "@/components/account/order-details";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Order placed" };

export default async function OrderSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const { order } = await searchParams;
  const orderId = Array.isArray(order) ? order[0] : order;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-3 pt-4 md:px-6 md:pt-8">
      <div className="flex flex-col items-center gap-3 rounded-lg bg-surface-container-lowest shadow-card px-5 py-8 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-success/10">
          <CircleCheckIcon aria-hidden className="size-9 text-success" strokeWidth={1.75} />
        </span>
        <h1 className="font-heading text-headline-lg-mobile md:text-headline-lg">Order placed</h1>
        <p className="max-w-lg text-body-md text-on-surface-variant">
          We’ve emailed your confirmation. Each store ships its part of the order, and you can follow every package
          from your orders.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link href="/account" className={cn(buttonVariants({ variant: "outline" }), "h-10 rounded-full px-6")}>
            My orders
          </Link>
          <Link href="/products" className={cn(buttonVariants(), "h-10 rounded-full px-6")}>
            Keep shopping
          </Link>
        </div>
      </div>
      {orderId && <OrderDetails id={orderId} />}
    </div>
  );
}
