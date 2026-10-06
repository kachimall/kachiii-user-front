"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRightIcon, LogOutIcon } from "lucide-react";
import { formatDate, orderStatusLabel } from "@/components/account/order-details";
import { Button, buttonVariants } from "@/components/ui/button";
import { getPurchases } from "@/lib/api/account";
import { ApiError, type ApiMeta } from "@/lib/api/client";
import type { ApiPurchase } from "@/lib/api/schema";
import { formatPrice } from "@/lib/pricing";
import { endSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { useAuth, useAuthHydrated } from "@/store/auth";

export function AccountOverview() {
  const router = useRouter();
  const ready = useAuthHydrated();
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<ApiPurchase[]>();
  const [meta, setMeta] = useState<ApiMeta>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!token) return;
    getPurchases(token, page)
      .then((res) => {
        setOrders(res.data);
        setMeta(res.meta);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Couldn’t load your orders."));
  }, [token, page]);

  if (!ready) return <div aria-busy className="h-96 animate-pulse rounded-3xl bg-muted" />;

  if (!token) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-3xl border border-dashed bg-card p-10">
        <p className="font-heading text-2xl font-bold">Sign in to see your orders.</p>
        <Link href="/login?next=/account" className={cn(buttonVariants(), "h-10 rounded-full px-5")}>
          Sign in
        </Link>
      </div>
    );
  }

  async function signOut() {
    await endSession();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[18rem_1fr]">
      <aside className="flex flex-col gap-3 self-start rounded-3xl border bg-card p-6">
        <p className="font-heading text-xl font-bold">{user?.name}</p>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        {user?.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
        {user && !user.email_verified && (
          <p className="rounded-xl bg-primary-fixed p-3 text-sm text-on-primary-fixed-variant">
            Verify your email to place orders — check your inbox for the link.
          </p>
        )}
        <Button variant="outline" onClick={signOut} className="mt-2 h-10 rounded-full">
          <LogOutIcon aria-hidden className="size-4" />
          Sign out
        </Button>
      </aside>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl font-bold">My orders</h2>
        {error && <p className="text-destructive">{error}</p>}
        {!orders && !error && <div aria-busy className="h-48 animate-pulse rounded-3xl bg-muted" />}
        {orders?.length === 0 && (
          <div className="flex flex-col items-start gap-3 rounded-3xl border border-dashed bg-card p-8">
            <p className="text-muted-foreground">No orders yet.</p>
            <Link href="/products" className={cn(buttonVariants(), "h-10 rounded-full px-5")}>
              Start shopping
            </Link>
          </div>
        )}
        {orders && orders.length > 0 && (
          <ul className="flex flex-col divide-y rounded-3xl border bg-card">
            {orders.map((order) => (
              <li key={order.id}>
                <Link href={`/account/orders/${order.id}`} className="flex items-center gap-4 p-5 hover:bg-muted/50">
                  <div className="flex-1">
                    <p className="font-medium">{order.number}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.placed_at ?? order.created_at)} ·{" "}
                      {order.orders.reduce((n, o) => n + o.items.reduce((m, i) => m + i.quantity, 0), 0)} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="tabular-nums font-medium">{formatPrice(order.grand_total)}</p>
                    <p className="text-sm text-muted-foreground">{orderStatusLabel[order.status] ?? order.status}</p>
                  </div>
                  <ChevronRightIcon aria-hidden className="size-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        {meta && (meta.last_page ?? 1) > 1 && (
          <div className="flex items-center justify-between text-sm">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-full">
              Newer
            </Button>
            <span className="text-muted-foreground">
              Page {meta.current_page} of {meta.last_page}
            </span>
            <Button variant="outline" disabled={!meta.has_more} onClick={() => setPage((p) => p + 1)} className="rounded-full">
              Older
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
