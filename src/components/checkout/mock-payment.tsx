"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CreditCardIcon } from "lucide-react";
import { toast } from "sonner";
import { useOrder } from "@/components/account/order-details";
import { Button, buttonVariants } from "@/components/ui/button";
import { completeMockPayment } from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";
import { pendingPurchaseFor } from "@/lib/payments";
import { formatPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

/**
 * Stand-in for the noqodi payment page while the backend runs its mock gateway
 * (NOQODI_DRIVER=mock). The real gateway hosts this page itself.
 */
export function MockPayment() {
  const router = useRouter();
  const reference = useSearchParams().get("reference") ?? "";
  const purchaseId = reference ? (pendingPurchaseFor(reference) ?? undefined) : undefined;
  const { ready, token, order, error } = useOrder(purchaseId);
  const [busy, setBusy] = useState(false);

  async function finish(outcome: "paid" | "failed") {
    if (!token || !order) return;
    setBusy(true);
    try {
      await completeMockPayment(token, order.id, outcome);
      if (outcome === "paid") router.replace(`/checkout/success?order=${order.id}`);
      else {
        toast.error("Payment declined", { description: "You can try again from your order." });
        router.replace(`/account/orders/${order.id}`);
      }
    } catch (e) {
      setBusy(false);
      toast.error(e instanceof ApiError ? e.message : "Payment didn’t go through. Try again.");
    }
  }

  if (!ready) return <div aria-busy className="h-64 animate-pulse rounded-lg bg-surface-container" />;

  if (!purchaseId || !token || error) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-muted-foreground">
          {error ?? "We couldn’t match this payment to an order in this browser."} Your order is saved — you can pay for
          it from your orders.
        </p>
        <Link href="/account" className={cn(buttonVariants(), "h-10 rounded-full px-5")}>
          Go to my orders
        </Link>
      </div>
    );
  }

  if (!order) return <div aria-busy className="h-64 animate-pulse rounded-lg bg-surface-container" />;

  return (
    <div className="flex flex-col gap-6 rounded-lg bg-surface-container-lowest shadow-card p-4 md:p-5">
      <div className="flex items-center gap-3">
        <CreditCardIcon aria-hidden className="size-8 text-primary" />
        <div>
          <p className="font-heading text-2xl font-bold tabular-nums">{formatPrice(order.grand_total)}</p>
          <p className="text-sm text-muted-foreground">Order {order.number}</p>
        </div>
      </div>
      <p className="rounded-md bg-surface-container-low p-4 text-sm text-muted-foreground">
        Test payment page. No card is charged — choose how the payment should end.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => finish("paid")} disabled={busy} className="h-11 rounded-full px-6 text-base">
          Pay now
        </Button>
        <Button variant="outline" onClick={() => finish("failed")} disabled={busy} className="h-11 rounded-full px-6">
          Simulate a declined card
        </Button>
      </div>
    </div>
  );
}
