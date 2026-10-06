import { formatPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

type Props = {
  subtotal: number;
  /** Delivery fee; unknown until an address is chosen at checkout. */
  shipping?: number;
  discount?: number;
  /** Server-priced total. Falls back to subtotal + shipping − discount. */
  total?: number;
  className?: string;
  children?: React.ReactNode;
};

export function OrderSummary({ subtotal, shipping, discount = 0, total, className, children }: Props) {
  const grandTotal = total ?? subtotal + (shipping ?? 0) - discount;

  return (
    <section aria-labelledby="summary-heading" className={cn("flex flex-col gap-4 rounded-3xl border bg-card p-6", className)}>
      <h2 id="summary-heading" className="font-heading text-xl font-bold">
        Order summary
      </h2>
      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Voucher</dt>
            <dd className="tabular-nums text-success">−{formatPrice(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Delivery</dt>
          <dd className="tabular-nums">
            {shipping === undefined ? "Calculated at checkout" : shipping === 0 ? "Free" : formatPrice(shipping)}
          </dd>
        </div>
        <div className="mt-2 flex justify-between border-t pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatPrice(grandTotal)}</dd>
        </div>
        <p className="text-xs text-muted-foreground">Prices include 5% VAT.</p>
      </dl>
      {children}
    </section>
  );
}
