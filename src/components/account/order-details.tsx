"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RefundList, ReturnCard, ReturnForm, returnable } from "@/components/account/order-returns";
import { PackageTracking } from "@/components/account/package-tracking";
import { ReviewForm } from "@/components/account/review-form";
import { formatAddress } from "@/components/checkout/address-form";
import { ProductImage } from "@/components/product/product-image";
import { Button, buttonVariants } from "@/components/ui/button";
import { cancelPurchase, getMyReviews, getOrderReturns, getPurchase, retryPayment } from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";
import { variantName } from "@/lib/api/products";
import type { ApiOrderItem, ApiPurchase, ApiReturn, ApiReview } from "@/lib/api/schema";
import { rememberPendingPayment } from "@/lib/payments";
import { formatPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { useAuth, useAuthHydrated } from "@/store/auth";

export const orderStatusLabel: Record<string, string> = {
  pending: "Awaiting payment",
  placed: "Placed",
  accepted: "Being prepared",
  ready_to_ship: "Ready to ship",
  shipped: "On the way",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
};

export const paymentStatusLabel: Record<string, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
  due_on_delivery: "Pay on delivery",
  refunded: "Refunded",
  failed: "Payment failed",
};

export function formatDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleString("en-AE", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

/** Loads an order with the shopper's token; shows sign-in when there is none. */
export function useOrder(id: string | undefined) {
  const ready = useAuthHydrated();
  const token = useAuth((s) => s.token);
  const [order, setOrder] = useState<ApiPurchase>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!token || !id) return;
    getPurchase(token, id)
      .then(setOrder)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Couldn’t load this order."));
  }, [token, id]);

  return { ready, token, order, setOrder, error };
}

export function OrderDetails({ id }: { id: string }) {
  const { ready, token, order, setOrder, error } = useOrder(id);
  const [busy, setBusy] = useState(false);
  const [returns, setReturns] = useState<ApiReturn[]>([]);
  // The package whose return form is open.
  const [returning, setReturning] = useState<string>();
  // The shopper's reviews, to tell which items they reviewed already.
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  // Order lines reviewed on this page; the item whose review form is open.
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [reviewing, setReviewing] = useState<string>();

  useEffect(() => {
    if (!token) return;
    getOrderReturns(token, id)
      .then(setReturns)
      .catch(() => {});
    getMyReviews(token, 1, 100)
      .then((res) => setReviews(res.data))
      .catch(() => {});
  }, [token, id]);

  if (!ready) return <div aria-busy className="h-96 animate-pulse rounded-lg bg-surface-container" />;
  if (!token) {
    return (
      <Link href={`/login?next=/account/orders/${id}`} className={cn(buttonVariants(), "h-10 rounded-full px-5")}>
        Sign in to see this order
      </Link>
    );
  }
  if (error) return <p className="text-destructive">{error}</p>;
  if (!order) return <div aria-busy className="h-96 animate-pulse rounded-lg bg-surface-container" />;

  async function act(action: () => Promise<ApiPurchase>, done: string) {
    setBusy(true);
    try {
      const updated = await action();
      setOrder(updated);
      toast.success(done);
      return updated;
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "That didn’t work. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function pay() {
    const updated = await act(() => retryPayment(token!, order!.id), "Opening the payment page…");
    const redirect = updated?.payment?.redirect_url;
    if (updated && redirect) {
      rememberPendingPayment(redirect, updated.id);
      window.location.assign(redirect);
    }
  }

  const awaitingPayment = order.status === "pending" && order.payment_method === "online";
  const canCancel = order.status !== "cancelled" && order.orders.every((o) => ["pending", "placed"].includes(o.status));
  const address = order.shipping_address;
  const replaceReturn = (updated: ApiReturn) => setReturns((rs) => rs.map((r) => (r.id === updated.id ? updated : r)));
  const deliveredPackages = new Set((order.packages ?? []).filter((p) => p.status === "delivered").map((p) => p.id));

  /**
   * Reviews carry the product and option names but not the order line, so an earlier review
   * matches when it is of the same product and options and was written after this order.
   * The API refuses a second review of an item (409) either way.
   */
  const placedAt = Date.parse(order.placed_at ?? order.created_at);
  const isReviewed = (item: ApiOrderItem) =>
    reviewed.has(item.id) ||
    reviews.some(
      (r) =>
        r.product?.id === item.product.id &&
        (r.variant ?? "") === Object.values(item.variant.options).join(" / ") &&
        Date.parse(r.created_at) >= placedAt,
    );

  return (
    <div className="flex flex-col gap-8">
      <dl className="grid gap-4 rounded-lg bg-surface-container-lowest shadow-card p-4 md:p-5 text-sm sm:grid-cols-4">
        <Item label="Order number" value={order.number} />
        <Item label="Placed" value={formatDate(order.placed_at ?? order.created_at)} />
        <Item label="Status" value={orderStatusLabel[order.status] ?? order.status} />
        <Item label="Payment" value={paymentStatusLabel[order.payment_status] ?? order.payment_status} />
      </dl>

      {(awaitingPayment || canCancel) && (
        <div className="flex flex-wrap gap-3">
          {awaitingPayment && (
            <Button onClick={pay} disabled={busy} className="h-10 rounded-full px-5">
              Pay {formatPrice(order.grand_total)}
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => confirm("Cancel this order?") && act(() => cancelPurchase(token, order.id), "Order cancelled")}
              className="h-10 rounded-full px-5"
            >
              Cancel order
            </Button>
          )}
        </div>
      )}

      {order.orders.map((vendorOrder) => {
        // The packages this store's items travel in (usually one).
        const packageIds = new Set(vendorOrder.items.map((i) => i.package_id));
        const packages = (order.packages ?? []).filter((p) => packageIds.has(p.id) || p.order_id === vendorOrder.id);
        return (
          <section key={vendorOrder.id} className="flex flex-col gap-3 rounded-lg bg-surface-container-lowest shadow-card p-4 md:p-5">
            <header className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-heading text-lg font-bold">{vendorOrder.store.name}</h2>
              <span className="text-sm text-muted-foreground">
                {vendorOrder.number} · {orderStatusLabel[vendorOrder.status] ?? vendorOrder.status}
              </span>
            </header>
            {vendorOrder.cancel_reason && <p className="text-sm text-destructive">{vendorOrder.cancel_reason}</p>}
            <ul className="flex flex-col divide-y">
              {vendorOrder.items.map((item) => {
                const canReview =
                  vendorOrder.status !== "cancelled" && item.package_id !== null && deliveredPackages.has(item.package_id);
                const done = canReview && isReviewed(item);
                return (
                  <li key={item.id} className="flex flex-col gap-3 py-3">
                    <div className="flex items-center gap-4">
                      <Link href={`/products/${item.product.id}`} className="w-16 shrink-0">
                        <ProductImage name={item.product.name} image={item.thumbnail_url ?? undefined} sizes="64px" />
                      </Link>
                      <div className="flex-1 text-sm">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-muted-foreground">
                          {variantName(item.variant.options)} · {item.quantity} × {formatPrice(item.unit_price)}
                        </p>
                        {canReview &&
                          reviewing !== item.id &&
                          (done ? (
                            <p className="mt-1 text-xs text-success">Reviewed — thank you</p>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setReviewing(item.id)}
                              className="mt-1 text-xs font-medium text-primary hover:underline"
                            >
                              Write a review
                            </button>
                          ))}
                      </div>
                      <p className="text-sm tabular-nums">{formatPrice(item.line_total)}</p>
                    </div>
                    {reviewing === item.id && (
                      <ReviewForm
                        token={token}
                        orderId={order.id}
                        item={{
                          id: item.id,
                          name: item.product.name,
                          variant: Object.keys(item.variant.options).length > 0 ? variantName(item.variant.options) : undefined,
                        }}
                        onCancel={() => setReviewing(undefined)}
                        onDone={() => {
                          setReviewed((current) => new Set(current).add(item.id));
                          setReviewing(undefined);
                        }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
            {packages.map((pkg, i) => (
              <div key={pkg.id} className="flex flex-col gap-3">
                <PackageTracking pkg={pkg} title={packages.length > 1 ? `Package ${i + 1} of ${packages.length}` : "Delivery"} />
                {returning === pkg.id ? (
                  <ReturnForm
                    token={token}
                    orderId={order.id}
                    vendorOrder={vendorOrder}
                    pkg={pkg}
                    returns={returns}
                    onCancel={() => setReturning(undefined)}
                    onDone={(created) => {
                      setReturns((rs) => [created, ...rs]);
                      setReturning(undefined);
                    }}
                  />
                ) : (
                  vendorOrder.status !== "cancelled" &&
                  returnable(pkg) && (
                    <Button variant="outline" onClick={() => setReturning(pkg.id)} className="h-9 self-start rounded-full px-4">
                      Return items
                    </Button>
                  )
                )}
              </div>
            ))}
            {returns
              .filter((r) => r.store_order.id === vendorOrder.id)
              .map((r) => (
                <ReturnCard key={r.id} ret={r} token={token} onChange={replaceReturn} />
              ))}
          </section>
        );
      })}

      <div className="grid gap-6 sm:grid-cols-2">
        {address && (
          <section className="rounded-lg bg-surface-container-lowest shadow-card p-4 md:p-5 text-sm">
            <h2 className="mb-2 font-heading text-lg font-bold">Delivering to</h2>
            <p className="font-medium">{address.recipient_name}</p>
            {address.emirate && <p className="text-muted-foreground">{formatAddress(address as Parameters<typeof formatAddress>[0])}</p>}
            <p className="text-muted-foreground">{address.phone}</p>
          </section>
        )}
        <section className="rounded-lg bg-surface-container-lowest shadow-card p-4 md:p-5 text-sm">
          <h2 className="mb-2 font-heading text-lg font-bold">Total</h2>
          <dl className="flex flex-col gap-1.5">
            <Row label="Items" value={formatPrice(order.items_total)} />
            {Number(order.discount_total) > 0 && (
              <Row label={`Voucher ${order.voucher_code ?? ""}`} value={`−${formatPrice(order.discount_total)}`} />
            )}
            <Row label="Delivery" value={formatPrice(order.shipping_total)} />
            <div className="mt-1 border-t pt-2 font-semibold">
              <Row label="Total" value={formatPrice(order.grand_total)} />
            </div>
          </dl>
        </section>
      </div>

      {order.refunds && order.refunds.length > 0 && (
        <RefundList refunds={order.refunds} cashOnDelivery={order.payment_method === "cash_on_delivery"} />
      )}
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
