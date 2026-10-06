"use client";

import { toast } from "sonner";
import { voucherCode } from "@/lib/data/home";

/** Copies the current voucher code. Swap for a "claim" API call later. */
export function ClaimVoucherButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  async function claim() {
    try {
      await navigator.clipboard.writeText(voucherCode);
      toast.success(`Voucher ${voucherCode} copied. Paste it at checkout.`);
    } catch {
      toast.info(`Your voucher code is ${voucherCode}. Enter it at checkout.`);
    }
  }

  return (
    <button type="button" onClick={claim} className={className}>
      {children}
    </button>
  );
}
