import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { Skeleton } from "@/components/ui/empty-state";

export default function Loading() {
  return (
    <div aria-busy aria-label="Loading products" className="mx-auto max-w-7xl px-3 pt-3 md:px-6 md:pt-6">
      <Skeleton className="mb-3 h-8 w-48 md:mb-4" />
      <div className="-mx-3 mb-3 flex gap-2 overflow-hidden bg-surface-container-lowest px-3 py-2.5 md:mx-0 md:mb-5 md:rounded-lg md:shadow-card">
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-24 shrink-0 rounded-full" />
        ))}
      </div>
      <ProductGridSkeleton />
    </div>
  );
}
