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
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 pt-16 sm:px-6">
      <div className="flex flex-col items-start gap-4">
        <CircleCheckIcon aria-hidden className="size-12 text-success" strokeWidth={1.5} />
        <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">Order placed</h1>
        <p className="text-lg text-muted-foreground">
          We’ve emailed your confirmation. Each store ships its part of the order, and you can follow every package
          from your orders.
        </p>
        <Link href="/products" className={cn(buttonVariants(), "h-11 rounded-full px-6 text-base")}>
          Keep shopping
        </Link>
      </div>
      {orderId && <OrderDetails id={orderId} />}
    </div>
  );
}
