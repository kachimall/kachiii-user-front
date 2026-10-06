import { CircleCheckIcon, CircleDotIcon, PackageIcon, TriangleAlertIcon, TruckIcon, Undo2Icon } from "lucide-react";
import type { ApiCourierStatus, ApiShipment } from "@/lib/api/schema";
import { formatPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export const courierStatusLabel: Record<ApiCourierStatus, string> = {
  picked_up: "Picked up by the courier",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivery_failed: "Delivery attempt failed",
  delivered: "Delivered",
  returned: "Returned to the sender",
};

const packageStatusLabel: Record<ApiShipment["status"], string> = {
  pending: "Waiting for the store",
  processing: "Being packed",
  ready: "Packed, waiting for pickup",
  shipped: "On its way",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
};

const codLabel = { pending: "to pay on delivery", collected: "paid on delivery", not_collected: "not collected" };

const stepIcon = (status: ApiCourierStatus) =>
  status === "delivered"
    ? CircleCheckIcon
    : status === "returned"
      ? Undo2Icon
      : status === "delivery_failed"
        ? TriangleAlertIcon
        : status === "out_for_delivery" || status === "in_transit"
          ? TruckIcon
          : CircleDotIcon;

const time = (iso: string) => new Date(iso).toLocaleString("en-AE", { dateStyle: "medium", timeStyle: "short" });

/** One package: its delivery service, the courier's tracking number and every update so far. */
export function PackageTracking({ pkg, title }: { pkg: ApiShipment; title: string }) {
  const steps = [...(pkg.tracking ?? [])].reverse();
  const days = pkg.min_days === pkg.max_days ? `${pkg.min_days}` : `${pkg.min_days}–${pkg.max_days}`;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-surface-container-highest p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <PackageIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">
              {pkg.service.name} · {days} days
            </p>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            pkg.status === "delivered"
              ? "bg-success/15 text-success"
              : pkg.status === "returned" || pkg.status === "cancelled"
                ? "bg-destructive/10 text-destructive"
                : "bg-secondary-fixed text-secondary",
          )}
        >
          {pkg.courier_status ? courierStatusLabel[pkg.courier_status] : packageStatusLabel[pkg.status]}
        </span>
      </div>

      {(pkg.waybill_number || pkg.cash_on_delivery) && (
        <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {pkg.waybill_number && (
            <div className="flex gap-1.5">
              <dt className="text-muted-foreground">Tracking number</dt>
              <dd className="font-mono">{pkg.waybill_number}</dd>
            </div>
          )}
          {pkg.cash_on_delivery && (
            <div className="flex gap-1.5">
              <dt className="text-muted-foreground">Cash on delivery</dt>
              <dd className="tabular-nums">
                {formatPrice(pkg.cash_on_delivery.amount)} {codLabel[pkg.cash_on_delivery.status]}
              </dd>
            </div>
          )}
        </dl>
      )}

      {steps.length > 0 && (
        <ol className="flex flex-col gap-3 border-l pl-4">
          {steps.map((step, i) => {
            const Icon = stepIcon(step.status);
            return (
              <li key={`${step.status}-${step.occurred_at}`} className="relative text-sm">
                <Icon
                  aria-hidden
                  className={cn(
                    "absolute top-0.5 -left-[1.55rem] size-4 bg-card",
                    i === 0 ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <p className={cn(i === 0 && "font-medium")}>
                  {step.description ?? courierStatusLabel[step.status]}
                  {step.reason && <span className="text-muted-foreground"> ({step.reason})</span>}
                </p>
                <p className="text-xs text-muted-foreground">{time(step.occurred_at)}</p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
