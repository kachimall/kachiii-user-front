"use client";

import { useState } from "react";
import { ImagePlusIcon, StarIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createReview, MAX_REVIEW_PHOTOS } from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";
import type { ApiReview } from "@/lib/api/schema";
import { cn } from "@/lib/utils";

const ratingWords = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

/** Five tappable stars. */
function StarPicker({ value, onChange, invalid }: { value: number; onChange: (rating: number) => void; invalid?: boolean }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div role="radiogroup" aria-label="Your rating" aria-invalid={invalid} className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} ${star === 1 ? "star" : "stars"} — ${ratingWords[star]}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          className="rounded-sm p-0.5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <StarIcon className={cn("size-7 transition-colors", star <= shown ? "fill-star text-star" : "fill-transparent text-outline-variant")} />
        </button>
      ))}
      {shown > 0 && <span className="ml-2 text-sm text-muted-foreground">{ratingWords[shown]}</span>}
    </div>
  );
}

/** Reviews one delivered item: stars, an optional comment and up to 3 photos. */
export function ReviewForm({
  token,
  orderId,
  item,
  onDone,
  onCancel,
}: {
  token: string;
  orderId: string;
  item: { id: string; name: string; variant?: string };
  onDone: (review: ApiReview) => void;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (rating === 0) return setErrors({ rating: "Choose from 1 to 5 stars." });

    setBusy(true);
    setErrors({});
    try {
      const review = await createReview(token, orderId, {
        itemId: item.id,
        rating,
        comment: comment.trim() || undefined,
        photos: photos.map((p) => p.file),
      });
      photos.forEach((p) => URL.revokeObjectURL(p.url));
      toast.success("Thanks! Your review is posted.");
      onDone(review);
    } catch (e) {
      if (e instanceof ApiError && Object.keys(e.errors).length > 0) {
        const photoError = Object.entries(e.errors).find(([k]) => k.startsWith("photos"))?.[1][0];
        setErrors({ rating: e.field("rating"), comment: e.field("comment"), photos: photoError, item: e.field("item_id") });
      } else {
        // 409: not delivered yet, or reviewed already.
        toast.error(e instanceof ApiError ? e.message : "That didn’t work. Try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-lg border border-secondary/20 bg-secondary-fixed/30 p-4">
      <div>
        <p className="font-medium">Review {item.name}</p>
        {item.variant && <p className="text-sm text-muted-foreground">{item.variant}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <StarPicker value={rating} onChange={setRating} invalid={!!errors.rating} />
        {errors.rating && <p className="text-sm text-destructive">{errors.rating}</p>}
        {errors.item && <p className="text-sm text-destructive">{errors.item}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`review-${item.id}`}>
          Your review <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id={`review-${item.id}`}
          maxLength={2000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          aria-invalid={!!errors.comment}
          placeholder="What did you like or dislike? How was the quality and fit?"
        />
        {errors.comment && <p className="text-sm text-destructive">{errors.comment}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">
          Photos <span className="font-normal text-muted-foreground">(up to {MAX_REVIEW_PHOTOS}, JPG, PNG or WebP, 5 MB each — shown to everyone)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {photos.map((photo) => (
            <div key={photo.url} className="relative size-20 overflow-hidden rounded-xl border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
              <img src={photo.url} alt={photo.file.name} className="size-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(photo.url);
                  setPhotos((p) => p.filter((q) => q !== photo));
                }}
                aria-label={`Remove ${photo.file.name}`}
                className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-background/90 hover:bg-background"
              >
                <XIcon className="size-3.5" />
              </button>
            </div>
          ))}
          {photos.length < MAX_REVIEW_PHOTOS && (
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
                    .slice(0, MAX_REVIEW_PHOTOS - photos.length)
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
          {busy ? "Posting…" : "Post review"}
        </Button>
        <Button type="button" variant="outline" disabled={busy} onClick={onCancel} className="h-10 rounded-full px-5">
          Cancel
        </Button>
      </div>
    </form>
  );
}
