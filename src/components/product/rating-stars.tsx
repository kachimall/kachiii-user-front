import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Five stars filled to the rating (halves round to the nearest whole star). */
export function RatingStars({ rating, className }: { rating: number; className?: string }) {
  const filled = Math.round(rating);
  return (
    <span role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`} className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          aria-hidden
          className={cn("size-[1em]", star <= filled ? "fill-star text-star" : "fill-surface-container-high text-surface-container-high")}
        />
      ))}
    </span>
  );
}

/** "4.5" for an average that may come as "4.50". */
export const formatRating = (rating: number) => rating.toFixed(1);
