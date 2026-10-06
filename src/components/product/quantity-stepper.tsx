"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
  className?: string;
};

export function QuantityStepper({ value, onChange, min = 1, max = 99, label, className }: Props) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex h-10 items-center rounded-full border border-surface-container-highest bg-surface-container-lowest", className)}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="grid size-10 place-items-center rounded-full outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-40"
      >
        <MinusIcon className="size-4" />
      </button>
      <span aria-live="polite" className="w-8 text-center text-sm tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="grid size-10 place-items-center rounded-full outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-40"
      >
        <PlusIcon className="size-4" />
      </button>
    </div>
  );
}
