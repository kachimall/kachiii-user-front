"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EyeOffIcon, MessageSquareQuoteIcon } from "lucide-react";
import { AccountGate } from "@/components/account/account-gate";
import { ReviewItem } from "@/components/product/product-reviews";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/empty-state";
import { getMyReviews } from "@/lib/api/account";
import { ApiError, type ApiMeta } from "@/lib/api/client";
import type { ApiReview } from "@/lib/api/schema";
import { cn } from "@/lib/utils";

export function MyReviews() {
  return (
    <AccountGate next="/account/reviews" title="Sign in to see your reviews">
      {(token) => <ReviewList token={token} />}
    </AccountGate>
  );
}

function ReviewList({ token }: { token: string }) {
  const [page, setPage] = useState(1);
  const [reviews, setReviews] = useState<ApiReview[]>();
  const [meta, setMeta] = useState<ApiMeta>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    getMyReviews(token, page, 10)
      .then((res) => {
        setReviews(res.data);
        setMeta(res.meta);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Couldn’t load your reviews."));
  }, [token, page]);

  if (error) return <p className="text-destructive">{error}</p>;
  if (!reviews) return <Skeleton className="h-64 rounded-lg" />;
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquareQuoteIcon}
        title="No reviews yet"
        description="Once an order is delivered, open it from My orders to review what you bought."
      >
        <Link href="/account" className={cn(buttonVariants(), "h-10 rounded-full px-6")}>
          My orders
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col divide-y divide-surface-container rounded-lg bg-surface-container-lowest px-4 shadow-card md:px-5">
        {reviews.map((review) => (
          <div key={review.id} className="flex flex-col gap-1 pt-4">
            {review.hidden && (
              <p className="mb-2 flex items-start gap-1.5 rounded-md bg-destructive/10 p-2.5 text-sm text-destructive">
                <EyeOffIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
                <span>
                  KACHIII hid this review from the product page
                  {review.hidden_reason && <span className="text-on-surface-variant">: {review.hidden_reason}</span>}
                </span>
              </p>
            )}
            {review.product && (
              <Link href={`/products/${review.product.id}`} className="text-label-md text-secondary hover:underline">
                {review.product.name}
              </Link>
            )}
            <ul>
              <ReviewItem review={{ ...review, author: "You" }} />
            </ul>
          </div>
        ))}
      </div>
      {meta && (meta.last_page ?? 1) > 1 && (
        <div className="flex items-center justify-between text-sm">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-full">
            Newer
          </Button>
          <span className="text-muted-foreground">
            Page {meta.current_page} of {meta.last_page}
          </span>
          <Button variant="outline" disabled={!meta.has_more} onClick={() => setPage((p) => p + 1)} className="rounded-full">
            Older
          </Button>
        </div>
      )}
    </div>
  );
}
