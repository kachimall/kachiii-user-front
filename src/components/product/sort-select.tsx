"use client";

import { ArrowUpDownIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ProductSort } from "@/types";

const options: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export function SortSelect({ value }: { value: ProductSort }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(next: string) {
    const params = new URLSearchParams(searchParams);
    if (next === "newest") params.delete("sort");
    else params.set("sort", next);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <label className="flex shrink-0 items-center justify-end gap-2 text-label-md">
      <span className="flex items-center gap-1 text-on-surface-variant">
        <ArrowUpDownIcon aria-hidden className="size-3.5" />
        Sort by
      </span>
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="h-8 cursor-pointer rounded-full border border-surface-container-highest bg-surface-container-lowest px-3 text-label-md outline-none transition-colors hover:border-primary-container/50 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
