import { Skeleton } from "@/components/ui/empty-state";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-surface-container-lowest p-1.5 shadow-card">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="h-3.5 w-11/12" />
      <Skeleton className="h-3.5 w-2/3" />
      <div className="mt-1 flex items-center justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="size-7 rounded-full" />
      </div>
    </div>
  );
}

/** Placeholder matching `ProductGrid`'s columns. */
export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <ul aria-hidden className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <ProductCardSkeleton />
        </li>
      ))}
    </ul>
  );
}
