// Prices come from the backend in AED and already include 5% VAT.
const currency = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
});

export function formatPrice(amount: number | string): string {
  return currency.format(Number(amount));
}

/** "-32%" style discount label, or undefined when not on sale. */
export function discountLabel(price: number, compareAtPrice?: number): string | undefined {
  if (!compareAtPrice || compareAtPrice <= price) return undefined;
  return `-${Math.round((1 - price / compareAtPrice) * 100)}%`;
}

/** 12400 -> "12.4k" */
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}
