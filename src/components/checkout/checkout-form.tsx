"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogInIcon, MailIcon, ShoppingBagIcon } from "lucide-react";
import { toast } from "sonner";
import { OrderSummary } from "@/components/cart/order-summary";
import { AddressForm, formatAddress } from "@/components/checkout/address-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getAddresses, placeOrder, previewCheckout, resendVerification } from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";
import type { ApiAddress, ApiCheckoutPreview, ApiPaymentMethod } from "@/lib/api/schema";
import { rememberPendingPayment } from "@/lib/payments";
import { formatPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { useAuth, useAuthHydrated } from "@/store/auth";
import { useCart, useCartHydrated } from "@/store/cart";

const paymentCopy: Record<ApiPaymentMethod, { label: string; hint: string }> = {
  cash_on_delivery: { label: "Cash on delivery", hint: "Pay the courier when your order arrives" },
  online: { label: "Card or online payment", hint: "You’ll go to the secure payment page after placing the order" },
};

const newKey = () => crypto.randomUUID();

export function CheckoutForm() {
  const router = useRouter();
  const authReady = useAuthHydrated();
  const cartReady = useCartHydrated();
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);
  const items = useCart((s) => s.items);
  const refreshCart = useCart((s) => s.refresh);

  const [addresses, setAddresses] = useState<ApiAddress[] | null>(null);
  const [addressId, setAddressId] = useState<string>();
  const [addingAddress, setAddingAddress] = useState(false);
  const [shipping, setShipping] = useState<Record<string, string>>({});
  const [voucherInput, setVoucherInput] = useState("");
  const [voucher, setVoucher] = useState<string>();
  const [voucherError, setVoucherError] = useState<string>();
  const [preview, setPreview] = useState<ApiCheckoutPreview>();
  const [previewError, setPreviewError] = useState<string>();
  // The inputs the shown preview was priced for; differs while a new one loads.
  const [quotedFor, setQuotedFor] = useState<string>();
  const [payment, setPayment] = useState<ApiPaymentMethod>();
  const [placing, setPlacing] = useState(false);
  // One key per priced checkout, so a retried submit can't place the order twice.
  const idempotencyKey = useRef(newKey());

  useEffect(() => {
    if (!token) return;
    getAddresses(token)
      .then((list) => {
        setAddresses(list);
        setAddressId((current) => current ?? (list.find((a) => a.is_default) ?? list[0])?.id);
        setAddingAddress(list.length === 0);
      })
      .catch((error) => setPreviewError(error instanceof ApiError ? error.message : "Couldn’t load your addresses."));
  }, [token]);

  const quoteKey = JSON.stringify([addressId, shipping, voucher, items.map((i) => [i.variantId, i.quantity])]);
  const pricing = !!addressId && quotedFor !== quoteKey;

  useEffect(() => {
    if (!token || !addressId || items.length === 0) return;
    let stale = false;
    previewCheckout(token, { address_id: addressId, shipping, voucher_code: voucher })
      .then((result) => {
        if (stale) return;
        setPreview(result);
        setPreviewError(undefined);
        idempotencyKey.current = newKey();
        setPayment((current) => {
          const available = result.payment_methods.filter((m) => m.available).map((m) => m.code);
          return current && available.includes(current) ? current : available[0];
        });
      })
      .catch((error) => {
        if (stale) return;
        if (error instanceof ApiError && error.field("voucher_code")) {
          setVoucherError(error.field("voucher_code"));
          setVoucher(undefined);
          return;
        }
        setPreview(undefined);
        setPreviewError(error instanceof ApiError ? error.message : "Couldn’t price your order.");
      })
      .finally(() => !stale && setQuotedFor(quoteKey));
    return () => {
      stale = true;
    };
  }, [token, addressId, shipping, voucher, items, quoteKey]);

  async function handlePlaceOrder() {
    if (!token || !addressId || !preview || !payment) return;
    setPlacing(true);
    try {
      const order = await placeOrder(
        token,
        { address_id: addressId, shipping, voucher_code: voucher, payment_method: payment, expected_total: preview.grand_total },
        idempotencyKey.current,
      );
      await refreshCart().catch(() => undefined);
      const redirect = order.payment?.redirect_url;
      if (order.payment_method === "online" && redirect) {
        rememberPendingPayment(redirect, order.id);
        window.location.assign(redirect);
        return;
      }
      router.push(`/checkout/success?order=${order.id}`);
    } catch (error) {
      setPlacing(false);
      if (error instanceof ApiError && error.status === 409) {
        // Prices or stock changed since the preview: re-price and let the shopper confirm again.
        toast.error(error.message);
        setShipping((s) => ({ ...s }));
        return;
      }
      toast.error(error instanceof ApiError ? error.message : "Your order wasn’t placed. Try again.");
    }
  }

  if (!authReady || !cartReady) {
    return <Skeleton className="h-96 rounded-lg" />;
  }

  if (!token) {
    return (
      <Notice icon={LogInIcon} title="Sign in to check out" description="Your cart is saved — sign in to choose an address and pay.">
        <Link href="/login?next=/checkout" className={cn(buttonVariants(), "h-10 rounded-full px-5")}>
          Sign in
        </Link>
      </Notice>
    );
  }

  if (user && !user.email_verified) {
    return <VerifyEmailNotice token={token} email={user.email} />;
  }

  if (items.length === 0 && !placing) {
    return (
      <Notice icon={ShoppingBagIcon} title="There’s nothing to check out yet" description="Add something to your cart first.">
        <Link href="/products" className={cn(buttonVariants(), "h-10 rounded-full px-5")}>
          Start shopping
        </Link>
      </Notice>
    );
  }

  const selectedAddress = addresses?.find((a) => a.id === addressId);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_22rem] lg:gap-6">
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-4 rounded-lg bg-surface-container-lowest p-4 shadow-card md:p-5">
          <Step n={1}>Delivery address</Step>
          {addresses === null ? (
            <Skeleton className="h-24 rounded-lg" />
          ) : (
            <>
              {addresses.length > 0 && (
                <RadioGroup value={addressId} onValueChange={(v) => setAddressId(v as string)} className="gap-3">
                  {addresses.map((a) => (
                    <Label
                      key={a.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-surface-container-highest p-4 font-normal transition-colors hover:border-primary-container/50 has-data-checked:border-primary-container has-data-checked:bg-primary-fixed/40"
                    >
                      <RadioGroupItem value={a.id} className="mt-0.5" />
                      <span className="flex flex-col gap-0.5">
                        <span className="font-medium">
                          {a.recipient_name}
                          {a.label && <span className="ml-2 text-xs text-muted-foreground">{a.label}</span>}
                        </span>
                        <span className="text-sm text-muted-foreground">{formatAddress(a)}</span>
                        <span className="text-sm text-muted-foreground">{a.phone}</span>
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              )}
              {addingAddress ? (
                <AddressForm
                  token={token}
                  defaultName={user?.name}
                  makeDefault={addresses.length === 0}
                  onCancel={addresses.length > 0 ? () => setAddingAddress(false) : undefined}
                  onSaved={(address) => {
                    setAddresses((list) => [...(list ?? []), address]);
                    setAddressId(address.id);
                    setAddingAddress(false);
                  }}
                />
              ) : (
                addresses.length < 10 && (
                  <Button variant="outline" onClick={() => setAddingAddress(true)} className="h-10 self-start rounded-full px-5">
                    Add a new address
                  </Button>
                )
              )}
            </>
          )}
        </section>

        {preview && (
          <section className="flex flex-col gap-4 rounded-lg bg-surface-container-lowest p-4 shadow-card md:p-5">
            <Step n={2}>Delivery</Step>
            {preview.packages.map((pkg) => (
              <div key={pkg.key} className="flex flex-col gap-3 rounded-lg border border-surface-container-highest p-4">
                <p className="text-sm font-medium">{pkg.store?.name ?? "Kachiii fulfilment"}</p>
                <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                  {pkg.items.map((i) => (
                    <li key={i.id}>
                      {i.quantity} × {i.product.name}
                    </li>
                  ))}
                </ul>
                <RadioGroup
                  value={pkg.chosen}
                  onValueChange={(code) => setShipping((s) => ({ ...s, [pkg.key]: code as string }))}
                  className="gap-2"
                >
                  {pkg.options.map((o) => (
                    <Label key={o.code} className="flex cursor-pointer items-center gap-3 font-normal">
                      <RadioGroupItem value={o.code} />
                      <span className="flex-1 text-sm">
                        {o.name}{" "}
                        <span className="text-muted-foreground">
                          ({o.min_days === o.max_days ? o.min_days : `${o.min_days}–${o.max_days}`} {o.max_days === 1 ? "day" : "days"})
                        </span>
                      </span>
                      <span className="text-sm tabular-nums">{Number(o.fee) === 0 ? "Free" : formatPrice(o.fee)}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </section>
        )}

        {preview && (
          <section className="flex flex-col gap-4 rounded-lg bg-surface-container-lowest p-4 shadow-card md:p-5">
            <Step n={3}>Payment</Step>
            <RadioGroup value={payment} onValueChange={(v) => setPayment(v as ApiPaymentMethod)} className="gap-3">
              {preview.payment_methods.map((m) => (
                <Label
                  key={m.code}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border border-surface-container-highest p-4 font-normal transition-colors hover:border-primary-container/50 has-data-checked:border-primary-container has-data-checked:bg-primary-fixed/40",
                    !m.available && "cursor-not-allowed opacity-60",
                  )}
                >
                  <RadioGroupItem value={m.code} disabled={!m.available} className="mt-0.5" />
                  <span className="flex flex-col gap-0.5">
                    <span className="font-medium">{paymentCopy[m.code]?.label ?? m.code}</span>
                    <span className="text-sm text-muted-foreground">{m.reason ?? paymentCopy[m.code]?.hint}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </section>
        )}
      </div>

      <OrderSummary
        subtotal={preview ? Number(preview.items_total) : items.reduce((sum, i) => sum + i.price * i.quantity, 0)}
        shipping={preview ? Number(preview.shipping_total) : undefined}
        discount={preview ? Number(preview.discount_total) : 0}
        total={preview ? Number(preview.grand_total) : undefined}
        className="self-start lg:sticky lg:top-42"
      >
        <form
          className="flex flex-col gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            const code = voucherInput.trim().toUpperCase();
            setVoucherError(undefined);
            setVoucher(code || undefined);
          }}
        >
          <Label htmlFor="voucher" className="text-sm font-medium">
            Voucher code
          </Label>
          <div className="flex gap-2">
            <Input
              id="voucher"
              value={voucherInput}
              onChange={(e) => setVoucherInput(e.target.value)}
              placeholder="WELCOME10"
              className="h-10 bg-background uppercase"
            />
            <Button type="submit" variant="outline" disabled={!addressId} className="h-10 rounded-full px-4">
              Apply
            </Button>
          </div>
          {voucherError && <p className="text-sm text-destructive">{voucherError}</p>}
          {preview?.voucher && (
            <p className="text-sm text-success">
              {preview.voucher.code} applied: −{formatPrice(preview.voucher.discount)}
            </p>
          )}
        </form>

        {previewError && <p className="text-sm text-destructive">{previewError}</p>}
        <Button
          onClick={handlePlaceOrder}
          disabled={!preview || !payment || pricing || placing || !selectedAddress}
          className="h-11 rounded-full bg-linear-to-r from-primary to-primary-container font-heading text-headline-sm"
        >
          {placing ? "Placing order…" : pricing ? "Updating total…" : "Place order"}
        </Button>
      </OrderSummary>
    </div>
  );
}

const Notice = EmptyState;

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 font-heading text-headline-md">
      <span aria-hidden className="grid size-7 place-items-center rounded-full bg-primary-container text-label-md text-white">
        {n}
      </span>
      {children}
    </h2>
  );
}

function VerifyEmailNotice({ token, email }: { token: string; email: string }) {
  const [sending, setSending] = useState(false);

  async function resend() {
    setSending(true);
    try {
      await resendVerification(token);
      toast.success("Verification email sent", { description: `Check ${email}.` });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn’t send the email. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Notice
      icon={MailIcon}
      title="Verify your email to check out"
      description={`We sent a link to ${email}. Open it, then come back and refresh this page.`}
    >
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={resend} disabled={sending} className="h-10 rounded-full px-5">
          {sending ? "Sending…" : "Resend email"}
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()} className="h-10 rounded-full px-5">
          I’ve verified it
        </Button>
      </div>
    </Notice>
  );
}
