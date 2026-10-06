import { Skeleton } from "@/components/ui/empty-state";

export default function Loading() {
  return (
    <div aria-busy aria-label="Loading product" className="mx-auto max-w-7xl px-3 pt-3 md:px-6 md:pt-6">
      <Skeleton className="mb-3 h-4 w-64 md:mb-5" />
      <div className="grid gap-4 md:grid-cols-2 md:gap-10">
        <div className="flex flex-col gap-2">
          <div className="rounded-lg bg-surface-container-lowest p-2 shadow-card">
            <Skeleton className="aspect-square w-full" />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-lg bg-surface-container-lowest p-4 shadow-card md:p-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-16 w-full" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-20 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-11 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
