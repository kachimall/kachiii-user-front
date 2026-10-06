"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRightIcon, LogInIcon, LogOutIcon, PackageIcon } from "lucide-react";
import { formatDate, orderStatusLabel } from "@/components/account/order-details";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/empty-state";
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

  if (!ready) return <Skeleton className="h-96 rounded-lg" />;

  if (!token) {
    return (
      <EmptyState icon={LogInIcon} title="Sign in to see your orders" description="Track deliveries, pay pending orders and request returns.">
        <Link href="/login?next=/account" className={cn(buttonVariants(), "h-10 rounded-full px-6")}>
          Sign in
        </Link>
        <Link href="/register" className={cn(buttonVariants({ variant: "outline" }), "h-10 rounded-full px-6")}>
          Create account
        </Link>
      </EmptyState>
    );
  }

  async function signOut() {
    await endSession();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[18rem_1fr] lg:gap-6">
      <aside className="flex flex-col gap-3 self-start rounded-lg bg-surface-container-lowest p-5 shadow-card">
        <div className="flex items-center gap-3">
          <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-linear-to-br from-primary to-primary-container font-heading text-headline-sm text-white uppercase">
            {user?.name?.trim().charAt(0) || "?"}
          </span>
          <div className="min-w-0">
            <p className="truncate font-heading text-headline-sm">{user?.name}</p>
            <p className="truncate text-body-sm text-on-surface-variant">{user?.email}</p>
            {user?.phone && <p className="text-body-sm text-on-surface-variant">{user.phone}</p>}
          </div>
        </div>
        {user && !user.email_verified && (
          <p className="rounded-md bg-primary-fixed p-3 text-body-sm text-on-primary-fixed-variant">
            Verify your email to place orders — check your inbox for the link.
          </p>
        )}
        <Button variant="outline" onClick={signOut} className="mt-2 h-10 rounded-full">
          <LogOutIcon aria-hidden className="size-4" />
          Sign out
        </Button>
      </aside>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-headline-md">My orders</h2>
        {error && <p className="text-destructive">{error}</p>}
        {!orders && !error && <Skeleton className="h-48 rounded-lg" />}
        {orders?.length === 0 && (
          <EmptyState icon={PackageIcon} title="No orders yet" description="When you place an order it shows up here.">
            <Link href="/products" className={cn(buttonVariants(), "h-10 rounded-full px-6")}>
              Start shopping
            </Link>
          </EmptyState>
        )}
        {orders && orders.length > 0 && (
          <ul className="flex flex-col divide-y divide-surface-container overflow-hidden rounded-lg bg-surface-container-lowest shadow-card">
            {orders.map((order) => (
              <li key={order.id}>
                <Link href={`/account/orders/${order.id}`} className="flex items-center gap-4 p-4 transition-colors hover:bg-surface-container-low md:p-5">
                  <div className="flex-1">
                    <p className="font-heading text-headline-sm">{order.number}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.placed_at ?? order.created_at)} ·{" "}
                      {order.orders.reduce((n, o) => n + o.items.reduce((m, i) => m + i.quantity, 0), 0)} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-price-card text-secondary tabular-nums">{formatPrice(order.grand_total)}</p>
                    <StatusPill status={order.status} />
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

const statusTone: Record<string, string> = {
  pending: "bg-tertiary-fixed text-on-tertiary-fixed",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-surface-container-high text-on-surface-variant",
  returned: "bg-surface-container-high text-on-surface-variant",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-label-xs", statusTone[status] ?? "bg-secondary-fixed text-secondary")}>
      {orderStatusLabel[status] ?? status}
    </span>
  );
}
