import { formatPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

type Props = {
  subtotal: number;
  /** Delivery fee; unknown until an address is chosen at checkout. */
  shipping?: number;
  discount?: number;
  /** Markdown versus compare-at prices, shown as a highlight. */
  savings?: number;
  /** Server-priced total. Falls back to subtotal + shipping − discount. */
  total?: number;
  className?: string;
  children?: React.ReactNode;
};

export function OrderSummary({ subtotal, shipping, discount = 0, savings = 0, total, className, children }: Props) {
  const grandTotal = total ?? subtotal + (shipping ?? 0) - discount;

  return (
    <section aria-labelledby="summary-heading" className={cn("flex flex-col gap-4 rounded-lg bg-surface-container-lowest p-5 shadow-card", className)}>
      <h2 id="summary-heading" className="font-heading text-headline-md">
        Order summary
      </h2>
      <dl className="flex flex-col gap-2 text-body-md">
        <div className="flex justify-between">
          <dt className="text-on-surface-variant">Subtotal</dt>
          <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">Voucher</dt>
            <dd className="tabular-nums text-success">−{formatPrice(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-on-surface-variant">Delivery</dt>
          <dd className="tabular-nums">
            {shipping === undefined ? "Calculated at checkout" : shipping === 0 ? "Free" : formatPrice(shipping)}
          </dd>
        </div>
        <div className="mt-2 flex items-baseline justify-between border-t border-surface-container pt-3">
          <dt className="font-heading text-headline-sm">Total</dt>
          <dd className="font-heading text-price-hero text-secondary tabular-nums">{formatPrice(grandTotal)}</dd>
        </div>
        {savings > 0 && (
          <p className="rounded-md bg-primary-fixed px-2.5 py-1.5 text-label-md text-primary">
            You’re saving {formatPrice(savings)} on this order
          </p>
        )}
        <p className="text-body-sm text-on-surface-variant">Prices include 5% VAT.</p>
      </dl>
      {children}
    </section>
  );
}
