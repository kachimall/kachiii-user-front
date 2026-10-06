import { useSyncExternalStore } from "react";

const SLOT_HOURS = 3;

/** Flash sales run in 3-hour slots: 00:00, 03:00, 06:00… local time. */
export function flashSaleEndsAt(nowMs: number): number {
  const end = new Date(nowMs);
  const hour = end.getHours();
  end.setHours(hour - (hour % SLOT_HOURS) + SLOT_HOURS, 0, 0, 0);
  return end.getTime();
}

function subscribe(onTick: () => void) {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}

const nowInSeconds = () => Math.floor(Date.now() / 1000);

/** Current time in whole seconds, ticking every second. `null` during SSR. */
export function useNowSeconds(): number | null {
  return useSyncExternalStore(subscribe, nowInSeconds, () => null);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Time left in the current flash sale slot as zero-padded [hh, mm, ss]. */
export function useFlashSaleRemaining(): [string, string, string] | null {
  const now = useNowSeconds();
  if (now === null) return null;
  const left = Math.max(0, Math.floor((flashSaleEndsAt(now * 1000) - now * 1000) / 1000));
  return [pad(Math.floor(left / 3600)), pad(Math.floor((left % 3600) / 60)), pad(left % 60)];
}

/** Time left until `endsAt` (an ISO time) as whole days and zero-padded [hh, mm, ss]. `null` during SSR. */
export function useTimeLeft(endsAt: string): { days: number; parts: [string, string, string] } | null {
  const now = useNowSeconds();
  if (now === null) return null;
  const left = Math.max(0, Math.floor(Date.parse(endsAt) / 1000) - now);
  return {
    days: Math.floor(left / 86400),
    parts: [pad(Math.floor((left % 86400) / 3600)), pad(Math.floor((left % 3600) / 60)), pad(left % 60)],
  };
}
