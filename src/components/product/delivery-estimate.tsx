"use client";

import { useEffect, useState } from "react";
import { MapPinIcon, PackageCheckIcon, TruckIcon } from "lucide-react";
import { emirates } from "@/lib/api/account";
import { getDeliveryEstimate } from "@/lib/api/catalog";
import { ApiError } from "@/lib/api/client";
import type { ApiDeliveryEstimate, Emirate } from "@/lib/api/schema";
import { formatPrice } from "@/lib/pricing";

const STORAGE_KEY = "kachiii-delivery-emirate";

function savedEmirate(): Emirate | undefined {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return emirates.some((e) => e.value === value) ? (value as Emirate) : undefined;
  } catch {
    return undefined;
  }
}

const days = (min: number, max: number) => (min === max ? `${min} ${min === 1 ? "day" : "days"}` : `${min}–${max} days`);

/** What delivery to an emirate costs and takes, as checkout would quote it for one unit. */
export function DeliveryEstimate({ productId }: { productId: string }) {
  // The backend estimates for Dubai unless told otherwise; the shopper's last pick is remembered.
  const [emirate, setEmirate] = useState<Emirate | undefined>();
  const [estimate, setEstimate] = useState<ApiDeliveryEstimate>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();
    getDeliveryEstimate(productId, emirate ?? savedEmirate(), undefined, controller.signal)
      .then((result) => {
        setEstimate(result);
        setError(undefined);
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        setError(e instanceof ApiError && e.status !== 0 ? e.message : "Couldn’t estimate delivery right now.");
      });
    return () => controller.abort();
  }, [productId, emirate]);

  function choose(value: Emirate) {
    setEmirate(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Not remembered; the pick still applies on this page.
    }
  }

  const current = emirate ?? estimate?.emirate;
  const cheapest = estimate?.options[0];

  return (
    <section aria-labelledby="delivery-heading" className="flex flex-col gap-3 rounded-lg bg-surface-container-lowest p-4 shadow-card md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="delivery-heading" className="flex items-center gap-1.5 font-heading text-headline-sm">
          <TruckIcon aria-hidden className="size-4.5 text-primary" />
          Delivery
        </h2>
        <label className="flex items-center gap-1.5 text-label-md text-on-surface-variant">
          <MapPinIcon aria-hidden className="size-3.5" />
          <span className="sr-only">Deliver to</span>
          <select
            value={current ?? ""}
            onChange={(e) => choose(e.target.value as Emirate)}
            disabled={!estimate && !error}
            className="h-8 cursor-pointer rounded-full border border-surface-container-highest bg-surface-container-lowest px-3 text-label-md text-on-surface outline-none transition-colors hover:border-primary-container/50 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {!current && <option value="">Choose emirate</option>}
            {emirates.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <p className="text-body-sm text-on-surface-variant">{error}</p>
      ) : !estimate ? (
        <div aria-hidden className="h-12 animate-pulse rounded-md bg-surface-container" />
      ) : estimate.options.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant">
          We don’t deliver this to {emirates.find((e) => e.value === estimate.emirate)?.label ?? "this emirate"} yet.
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-1.5 text-body-sm">
            {estimate.options.map((option) => (
              <li key={option.code} className="flex items-baseline justify-between gap-3">
                <span>
                  <span className="font-medium">{option.name}</span>{" "}
                  <span className="text-on-surface-variant">· {days(option.min_days, option.max_days)} once shipped</span>
                </span>
                <span className="shrink-0 font-medium tabular-nums">
                  {Number(option.fee) === 0 ? <span className="text-success">Free</span> : formatPrice(option.fee)}
                </span>
              </li>
            ))}
          </ul>
          <ul className="flex flex-col gap-1 text-label-xs font-normal text-on-surface-variant">
            {estimate.ships_within_days !== null ? (
              <li className="flex items-center gap-1.5">
                <PackageCheckIcon aria-hidden className="size-3.5" />
                The store ships within {estimate.ships_within_days} {estimate.ships_within_days === 1 ? "day" : "days"}.
              </li>
            ) : (
              <li className="flex items-center gap-1.5">
                <PackageCheckIcon aria-hidden className="size-3.5" />
                Ships straight from the Kachiii warehouse.
              </li>
            )}
            {estimate.free_delivery_min_total && cheapest && Number(cheapest.fee) > 0 && (
              <li>Free {cheapest.name.toLowerCase()} delivery on a store’s items over {formatPrice(estimate.free_delivery_min_total)}.</li>
            )}
          </ul>
        </>
      )}
    </section>
  );
}
