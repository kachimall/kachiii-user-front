import { formatPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

type Props = {
  price: number;
  compareAtPrice?: number;
  size?: "card" | "hero";
  className?: string;
};

export function Price({ price, compareAtPrice, size = "card", className }: Props) {
  const onSale = compareAtPrice !== undefined && compareAtPrice > price;

  return (
    <span className={cn("inline-flex items-baseline gap-1", className)}>
      <span
        className={cn(
          "font-heading tracking-tight text-secondary tabular-nums",
          size === "hero" ? "text-price-hero" : "text-price-card",
        )}
      >
        {onSale && <span className="sr-only">Sale price </span>}
        {formatPrice(price)}
      </span>
      {onSale && (
        <s className={cn("text-outline tabular-nums", size === "hero" ? "text-body-md" : "text-[10px]")}>
          <span className="sr-only">Was </span>
          {formatPrice(compareAtPrice)}
        </s>
      )}
    </span>
  );
}
