"use client";

import { useRef, useState } from "react";
import { CameraIcon, MessageSquareQuoteIcon, StoreIcon } from "lucide-react";
import { formatRating, RatingStars } from "@/components/product/rating-stars";
import { Button } from "@/components/ui/button";
import { getProductReviews, type ReviewFilter, type ReviewPage } from "@/lib/api/catalog";
import type { ApiReview } from "@/lib/api/schema";
import { cn } from "@/lib/utils";

const PER_PAGE = 5;

const formatDay = (iso: string) => new Date(iso).toLocaleDateString("en-AE", { dateStyle: "medium" });

/** The product's reviews: the star breakdown (each bar filters), photos only, and more on demand. */
export function ProductReviews({ productId, initial }: { productId: string; initial: ReviewPage }) {
  const [filter, setFilter] = useState<ReviewFilter>({});
  const [reviews, setReviews] = useState<ApiReview[]>(initial.reviews);
  const [page, setPage] = useState(initial.page);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const request = useRef<AbortController | undefined>(undefined);

  const summary = initial.summary;
  const count = summary?.count ?? 0;
  const average = summary?.average != null ? Number(summary.average) : undefined;

  async function load(next: ReviewFilter, nextPage: number) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError(undefined);
    try {
      const res = await getProductReviews(productId, { ...next, page: nextPage, perPage: PER_PAGE }, { signal: controller.signal });
      setReviews((current) => (nextPage === 1 ? res.reviews : [...current, ...res.reviews]));
      setPage(res.page);
      setHasMore(res.hasMore);
    } catch {
      if (!controller.signal.aborted) setError("Couldn’t load reviews. Try again.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  function applyFilter(next: ReviewFilter) {
    setFilter(next);
    load(next, 1);
  }

  return (
    <section aria-labelledby="reviews-heading" className="rounded-lg bg-surface-container-lowest p-4 shadow-card md:p-6">
      <h2 id="reviews-heading" className="mb-3 font-heading text-headline-sm">
        Ratings &amp; reviews {count > 0 && <span className="font-normal text-on-surface-variant">({count})</span>}
      </h2>

      {count === 0 ? (
        <div className="flex items-center gap-3 rounded-md bg-surface-container-low p-4 text-body-sm text-on-surface-variant">
          <MessageSquareQuoteIcon aria-hidden className="size-5 shrink-0 text-outline" />
          No reviews yet. Shoppers who buy this can review it once it’s delivered.
        </div>
      ) : (
        <>
          <div className="mb-4 grid gap-4 sm:grid-cols-[auto_1fr] sm:gap-8">
            {average !== undefined && (
              <div className="flex flex-col items-center justify-center gap-1 sm:px-4">
                <p className="font-heading text-[2.5rem] leading-none">{formatRating(average)}</p>
                <RatingStars rating={average} className="text-lg" />
                <p className="text-body-sm text-on-surface-variant">
                  {count} {count === 1 ? "review" : "reviews"}
                </p>
              </div>
            )}
            {summary && (
              <ul className="flex flex-col gap-1" aria-label="Filter by stars">
                {([5, 4, 3, 2, 1] as const).map((star) => {
                  const n = summary.stars[String(star) as keyof typeof summary.stars] ?? 0;
                  const active = filter.rating === star;
                  return (
                    <li key={star}>
                      <button
                        type="button"
                        disabled={n === 0}
                        aria-pressed={active}
                        onClick={() => applyFilter({ ...filter, rating: active ? undefined : star })}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-1.5 py-0.5 text-label-md outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
                          active ? "bg-primary-fixed text-primary" : "hover:bg-surface-container-low",
                        )}
                      >
                        <span className="w-10 shrink-0 text-left tabular-nums">{star} star</span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-high">
                          <span className="block h-full rounded-full bg-star" style={{ width: `${count ? (n / count) * 100 : 0}%` }} />
                        </span>
                        <span className="w-8 shrink-0 text-right text-on-surface-variant tabular-nums">{n}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            <FilterChip active={!filter.rating && !filter.withPhotos} onClick={() => applyFilter({})}>
              All
            </FilterChip>
            <FilterChip active={!!filter.withPhotos} onClick={() => applyFilter({ ...filter, withPhotos: !filter.withPhotos })}>
              <CameraIcon aria-hidden className="size-3.5" />
              With photos
            </FilterChip>
            {filter.rating && (
              <FilterChip active onClick={() => applyFilter({ ...filter, rating: undefined })}>
                {filter.rating} star ✕
              </FilterChip>
            )}
          </div>

          <ul aria-busy={loading} className={cn("flex flex-col divide-y divide-surface-container", loading && reviews.length > 0 && "opacity-60")}>
            {reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </ul>
          {!loading && reviews.length === 0 && (
            <p className="py-4 text-body-sm text-on-surface-variant">No reviews match. Try another filter.</p>
          )}
          {error && <p className="py-2 text-sm text-destructive">{error}</p>}
          {hasMore && (
            <Button variant="outline" disabled={loading} onClick={() => load(filter, page + 1)} className="mt-3 h-9 rounded-full px-5">
              {loading ? "Loading…" : "Show more reviews"}
            </Button>
          )}
        </>
      )}
    </section>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-label-md outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "border-primary-container bg-primary-fixed text-primary"
          : "border-surface-container-highest text-on-surface-variant hover:border-primary-container/50 hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}

export function ReviewItem({ review, showProduct = false }: { review: ApiReview; showProduct?: boolean }) {
  return (
    <li className="flex flex-col gap-2 py-4 first:pt-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-body-sm">
        <RatingStars rating={review.rating} className="text-sm" />
        <span className="font-medium text-on-surface">{showProduct && review.product ? review.product.name : review.author}</span>
        <span className="text-on-surface-variant">· {formatDay(review.created_at)}</span>
      </div>
      {review.variant && <p className="text-label-xs font-normal text-on-surface-variant">Bought: {review.variant}</p>}
      {review.comment && <p className="text-body-md whitespace-pre-line">{review.comment}</p>}
      {review.photo_urls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {review.photo_urls.map((url, i) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="block size-20 overflow-hidden rounded-md border border-surface-container bg-surface-container-low"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- already-resized WebP from the backend */}
              <img src={url} alt={`Photo ${i + 1} from ${review.author}`} loading="lazy" className="size-full object-cover" />
            </a>
          ))}
        </div>
      )}
      {review.reply && (
        <div className="rounded-md bg-surface-container-low p-3 text-body-sm">
          <p className="mb-1 flex items-center gap-1.5 text-label-md text-secondary">
            <StoreIcon aria-hidden className="size-3.5" />
            Store’s reply · <span className="font-normal text-on-surface-variant">{formatDay(review.reply.replied_at)}</span>
          </p>
          <p className="whitespace-pre-line text-on-surface-variant">{review.reply.text}</p>
        </div>
      )}
    </li>
  );
}
