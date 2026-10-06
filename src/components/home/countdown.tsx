"use client";

import { useFlashSaleRemaining, useTimeLeft } from "@/lib/flash-sale";

/** "02h : 43m : 24s" — used in the hero banner. */
export function InlineCountdown({ className }: { className?: string }) {
  const parts = useFlashSaleRemaining();
  const [h, m, s] = parts ?? ["--", "--", "--"];

  return (
    <time className={className} aria-label={parts ? `${h} hours ${m} minutes ${s} seconds left` : undefined}>
      {h}h : {m}m : {s}s
    </time>
  );
}

/** "2d 04h : 43m : 24s" until a fixed time (a home banner's end). */
export function EndsAtCountdown({ endsAt, className }: { endsAt: string; className?: string }) {
  const left = useTimeLeft(endsAt);
  const [h, m, s] = left?.parts ?? ["--", "--", "--"];
  const days = left && left.days > 0 ? left.days : 0;

  return (
    <time
      dateTime={endsAt}
      className={className}
      aria-label={left ? `${days > 0 ? `${days} days ` : ""}${h} hours ${m} minutes ${s} seconds left` : undefined}
    >
      {days > 0 && `${days}d `}
      {h}h : {m}m : {s}s
    </time>
  );
}

/** Three boxed digits — used in the flash sale header. */
export function BoxCountdown() {
  const parts = useFlashSaleRemaining();
  const [h, m, s] = parts ?? ["--", "--", "--"];

  return (
    <span
      role="timer"
      aria-label={parts ? `Ends in ${h} hours ${m} minutes ${s} seconds` : "Ends soon"}
      className="flex items-center gap-1 text-label-md"
    >
      {[h, m, s].map((part, i) => (
        <span key={i} aria-hidden className="flex items-center gap-1">
          {i > 0 && <span className="font-bold text-secondary">:</span>}
          <span className="rounded-sm bg-secondary px-2 py-0.5 font-bold tabular-nums text-white">{part}</span>
        </span>
      ))}
    </span>
  );
}
