"use client";

import { ImagePlusIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDate } from "@/components/account/order-details";
import { courierStatusLabel } from "@/components/account/package-tracking";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { escalateReturn, requestReturn, returnReasons, withdrawReturn } from "@/lib/api/account";
import { ApiError, apiFileUrl } from "@/lib/api/client";
import { variantName } from "@/lib/api/products";
import type { ApiRefund, ApiReturn, ApiReturnReason, ApiShipment, ApiVendorOrder } from "@/lib/api/schema";
import { formatPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const MAX_PHOTOS = 5;

const returnStatusLabel: Record<ApiReturn["status"], string> = {
  requested: "Waiting for the store",
  escalated: "KACHI is reviewing",
  approved: "Approved",
  rejected: "Rejected",
  received: "Items received back",
  withdrawn: "Withdrawn",
};

const refundStatusLabel: Record<ApiRefund["status"], string> = {
  pending: "Being processed",
  processing: "Being processed",
  succeeded: "Refunded",
  failed: "Delayed — our team is on it",
};

const reasonLabel = Object.fromEntries(returnReasons.map((r) => [r.value, r.label]));

/** Whether a package's items can still be sent back. */
export const returnable = (pkg: ApiShipment) =>
  pkg.status === "delivered" && pkg.return_by !== null && new Date(pkg.return_by) > new Date();

/** How many of each order line are still free to return: withdrawn requests give theirs back. */
function available(vendorOrder: ApiVendorOrder, returns: ApiReturn[]) {
  const held = new Map<string, number>();
  for (const r of returns) {
    if (r.status === "withdrawn") continue;
    for (const item of r.items) held.set(item.item_id, (held.get(item.item_id) ?? 0) + item.quantity);
  }
  return new Map(vendorOrder.items.map((i) => [i.id, i.quantity - (held.get(i.id) ?? 0)]));
}

/** Asks to send back items of one delivered package. */
export function ReturnForm({
  token,
  orderId,
  vendorOrder,
  pkg,
  returns,
  onDone,
  onCancel,
}: {
  token: string;
  orderId: string;
  vendorOrder: ApiVendorOrder;
  pkg: ApiShipment;
  returns: ApiReturn[];
  onDone: (created: ApiReturn) => void;
  onCancel: () => void;
}) {
  const left = available(vendorOrder, returns);
  const items = vendorOrder.items.filter((i) => i.package_id === pkg.id && (left.get(i.id) ?? 0) > 0);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [reason, setReason] = useState<ApiReturnReason>();
  const [details, setDetails] = useState("");
  // Each chosen photo with a preview URL, freed when it is removed.
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const chosen = Object.entries(quantities).filter(([, q]) => q > 0);

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Every item in this package is in a return already.</p>;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (chosen.length === 0) return setErrors({ items: "Choose at least one item to return." });
    if (!reason) return setErrors({ reason: "Tell us why you’re returning them." });
    if (reason === "other" && !details.trim()) return setErrors({ details: "Tell us what is wrong with the items." });

    setBusy(true);
    setErrors({});
    try {
      const created = await requestReturn(token, orderId, {
        items: chosen.map(([id, quantity]) => ({ id, quantity })),
        reason,
        details: details.trim() || undefined,
        photos: photos.map((p) => p.file),
      });
      toast.success(`Return ${created.number} requested. The store will answer soon.`);
      onDone(created);
    } catch (e) {
      if (e instanceof ApiError && Object.keys(e.errors).length > 0) {
        const photoError = Object.entries(e.errors).find(([k]) => k.startsWith("photos"))?.[1][0];
        setErrors({ items: e.field("items"), reason: e.field("reason"), details: e.field("details"), photos: photoError });
      } else {
        toast.error(e instanceof ApiError ? e.message : "That didn’t work. Try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-muted/30 p-4">
      <div>
        <p className="font-medium">Return items</p>
        {pkg.return_by && (
          <p className="text-sm text-muted-foreground">You can ask until {formatDate(pkg.return_by)}.</p>
        )}
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">What are you sending back?</legend>
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium">{item.product.name}</p>
              <p className="text-muted-foreground">
                {variantName(item.variant.options)} · up to {left.get(item.id)}
              </p>
            </div>
            <QuantityStepper
              label={`How many ${item.product.name} to return`}
              min={0}
              max={left.get(item.id)}
              value={quantities[item.id] ?? 0}
              onChange={(q) => setQuantities((s) => ({ ...s, [item.id]: q }))}
            />
          </div>
        ))}
        {errors.items && <p className="text-sm text-destructive">{errors.items}</p>}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="return-reason">Reason</Label>
        <select
          id="return-reason"
          value={reason ?? ""}
          onChange={(e) => setReason(e.target.value as ApiReturnReason)}
          aria-invalid={!!errors.reason}
          className="h-10 rounded-lg border border-input bg-card px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
        >
          <option value="" disabled>
            Choose a reason
          </option>
          {returnReasons.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        {errors.reason && <p className="text-sm text-destructive">{errors.reason}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="return-details">Details {reason !== "other" && <span className="text-muted-foreground">(optional)</span>}</Label>
        <Textarea
          id="return-details"
          maxLength={1000}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          aria-invalid={!!errors.details}
          placeholder="What’s wrong with the items?"
        />
        {errors.details && <p className="text-sm text-destructive">{errors.details}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">
          Photos <span className="font-normal text-muted-foreground">(up to {MAX_PHOTOS}, JPG, PNG or WebP, 5 MB each)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {photos.map((photo) => (
            <PhotoPreview
              key={photo.url}
              name={photo.file.name}
              src={photo.url}
              onRemove={() => {
                URL.revokeObjectURL(photo.url);
                setPhotos((p) => p.filter((q) => q !== photo));
              }}
            />
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className="grid size-20 cursor-pointer place-items-center rounded-xl border border-dashed text-muted-foreground hover:bg-muted focus-within:ring-3 focus-within:ring-ring/50">
              <ImagePlusIcon aria-hidden className="size-5" />
              <span className="sr-only">Add photos</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const added = Array.from(e.target.files ?? [])
                    .slice(0, MAX_PHOTOS - photos.length)
                    .map((file) => ({ file, url: URL.createObjectURL(file) }));
                  setPhotos((p) => [...p, ...added]);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>
        {errors.photos && <p className="text-sm text-destructive">{errors.photos}</p>}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={busy} className="h-10 rounded-full px-5">
          Request return
        </Button>
        <Button type="button" variant="outline" disabled={busy} onClick={onCancel} className="h-10 rounded-full px-5">
          Never mind
        </Button>
      </div>
    </form>
  );
}

function PhotoPreview({ name, src, onRemove }: { name: string; src: string; onRemove: () => void }) {
  return (
    <div className="relative size-20 overflow-hidden rounded-xl border bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
      <img src={src} alt={name} className="size-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-background/90 hover:bg-background"
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  );
}

/** A private return photo, loaded with the shopper's token. */
function ReturnPhoto({ path, token, alt }: { path: string; token: string; alt: string }) {
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();
    let url: string | undefined;
    apiFileUrl(path, token, controller.signal)
      .then((u) => setSrc((url = u)))
      .catch(() => {});
    return () => {
      controller.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [path, token]);

  return (
    <a href={src} target="_blank" rel="noreferrer" className="block size-16 overflow-hidden rounded-lg border bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element -- private image behind the token */}
      {src && <img src={src} alt={alt} className="size-full object-cover" />}
    </a>
  );
}

/** One return request: its items, each answer, the courier's pickup, and what the shopper can still do. */
export function ReturnCard({ ret, token, onChange }: { ret: ApiReturn; token: string; onChange: (updated: ApiReturn) => void }) {
  const [busy, setBusy] = useState(false);
  const [disputing, setDisputing] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  const canDispute = ret.status === "rejected" && ret.dispute_by !== null && new Date(ret.dispute_by) > new Date();
  // Until the courier collects the items; the API has the final say.
  const canWithdraw = ["requested", "escalated", "approved"].includes(ret.status) && !ret.pickup?.courier_status;
  const answer = ret.kachi_decision ?? ret.store_answer;

  async function act(action: () => Promise<ApiReturn>, done: string) {
    setBusy(true);
    try {
      onChange(await action());
      toast.success(done);
      setDisputing(false);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "That didn’t work. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border p-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">Return {ret.number}</p>
          <p className="text-muted-foreground">
            {reasonLabel[ret.reason] ?? ret.reason} · requested {formatDate(ret.created_at)}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            ret.status === "received" || ret.status === "approved"
              ? "bg-success/15 text-success"
              : ret.status === "rejected"
                ? "bg-destructive/10 text-destructive"
                : ret.status === "withdrawn"
                  ? "bg-muted text-muted-foreground"
                  : "bg-secondary-fixed text-secondary",
          )}
        >
          {returnStatusLabel[ret.status]}
        </span>
      </div>

      <ul className="flex flex-col gap-1">
        {ret.items.map((item) => (
          <li key={item.item_id} className="flex justify-between gap-3">
            <span>
              {item.quantity} × {item.product_name}
              {Object.keys(item.options).length > 0 && (
                <span className="text-muted-foreground"> · {variantName(item.options)}</span>
              )}
            </span>
            <span className="tabular-nums text-muted-foreground">{formatPrice(item.refund_amount)}</span>
          </li>
        ))}
      </ul>

      {ret.details && <p className="text-muted-foreground">“{ret.details}”</p>}

      {ret.photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ret.photos.map((path, i) => (
            <ReturnPhoto key={path} path={path} token={token} alt={`Photo ${i + 1} of return ${ret.number}`} />
          ))}
        </div>
      )}

      <dl className="flex flex-col gap-1">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Refund once the items are back</dt>
          <dd className="font-medium tabular-nums">{formatPrice(ret.refund_amount)}</dd>
        </div>
        {ret.status === "requested" && ret.reply_by && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">The store answers by</dt>
            <dd>{formatDate(ret.reply_by)}</dd>
          </div>
        )}
        {ret.pickup && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Courier pickup</dt>
            <dd>
              <span className="font-mono">{ret.pickup.waybill_number}</span>
              {ret.pickup.courier_status && ` · ${courierStatusLabel[ret.pickup.courier_status]}`}
            </dd>
          </div>
        )}
      </dl>

      {answer && (
        <p className={cn(answer.decision === "rejected" ? "text-destructive" : "text-success")}>
          {ret.kachi_decision ? "KACHI" : "The store"} {answer.decision} this return
          {answer.remarks && <span className="text-muted-foreground">: {answer.remarks}</span>}
        </p>
      )}

      {disputing && (
        <div className="flex flex-col gap-2">
          <Label htmlFor={`dispute-${ret.id}`}>Why should KACHI take another look? (optional)</Label>
          <Textarea
            id={`dispute-${ret.id}`}
            maxLength={500}
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            placeholder="e.g. The photos show the damage."
          />
        </div>
      )}

      {(canDispute || canWithdraw) && (
        <div className="flex flex-wrap gap-3">
          {canDispute &&
            (disputing ? (
              <Button
                disabled={busy}
                onClick={() => act(() => escalateReturn(token, ret.id, disputeReason.trim() || undefined), "Sent to KACHI for review")}
                className="h-9 rounded-full px-4"
              >
                Send to KACHI
              </Button>
            ) : (
              <Button disabled={busy} onClick={() => setDisputing(true)} className="h-9 rounded-full px-4">
                Ask KACHI to review
              </Button>
            ))}
          {canDispute && !disputing && ret.dispute_by && (
            <p className="self-center text-muted-foreground">until {formatDate(ret.dispute_by)}</p>
          )}
          {canWithdraw && (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => confirm("Keep the items and withdraw this return?") && act(() => withdrawReturn(token, ret.id), "Return withdrawn")}
              className="h-9 rounded-full px-4"
            >
              Withdraw return
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/** Money owed back to the shopper on this order. */
export function RefundList({ refunds }: { refunds: ApiRefund[] }) {
  return (
    <section className="rounded-3xl border bg-card p-6 text-sm">
      <h2 className="mb-2 font-heading text-lg font-bold">Refunds</h2>
      <ul className="flex flex-col divide-y">
        {refunds.map((refund) => (
          <li key={refund.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
            <div>
              <p>{refund.reason ?? "Refund"}</p>
              <p className="text-muted-foreground">
                {refundStatusLabel[refund.status]}
                {refund.refunded_at && ` · ${formatDate(refund.refunded_at)}`}
              </p>
            </div>
            <span className="font-medium tabular-nums">{formatPrice(refund.amount)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
