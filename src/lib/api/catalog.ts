import { ApiError, api, apiRequest } from "@/lib/api/client";
import type {
  ApiAdPlacement,
  ApiDeliveryEstimate,
  ApiPage,
  ApiReview,
  ApiReviewSummary,
  ApiSponsoredAd,
  ApiSuggestions,
  Emirate,
} from "@/lib/api/schema";

// Public catalogue reads that sit beside the product listing: reviews, delivery estimates,
// search suggestions, vendor ads and the shop's static pages.

export type ReviewPage = { reviews: ApiReview[]; summary?: ApiReviewSummary; hasMore: boolean; page: number };

export type ReviewFilter = { rating?: number; withPhotos?: boolean };

/** One page of a product's visible reviews, newest first, with its star breakdown. */
export async function getProductReviews(
  productId: string,
  { page = 1, perPage = 5, rating, withPhotos }: ReviewFilter & { page?: number; perPage?: number } = {},
  init: { revalidate?: number; signal?: AbortSignal } = {},
): Promise<ReviewPage> {
  const res = await apiRequest<ApiReview[]>(`/products/${encodeURIComponent(productId)}/reviews`, {
    query: { page, per_page: perPage, rating, with_photos: withPhotos ? 1 : undefined },
    ...init,
  });
  return {
    reviews: res.data,
    summary: res.meta.rating as ApiReviewSummary | undefined,
    hasMore: res.meta.has_more ?? false,
    page: res.meta.current_page ?? page,
  };
}

/** What checkout would charge and take to deliver the variant (its first by default) to an emirate. */
export function getDeliveryEstimate(productId: string, emirate?: Emirate, variantId?: string, signal?: AbortSignal) {
  return api<ApiDeliveryEstimate>(`/products/${encodeURIComponent(productId)}/delivery`, {
    query: { emirate, variant_id: variantId },
    signal,
  });
}

/** Names for the search box; the API wants at least 2 characters. */
export function getSearchSuggestions(q: string, signal?: AbortSignal) {
  return api<ApiSuggestions>("/search/suggestions", { query: { q }, signal });
}

/**
 * The vendor ads for a page. Each call counts a view for the caller's address, so this runs in
 * the browser rather than on the server. A failure just means no ads.
 */
export async function getSponsored(
  placement: ApiAdPlacement,
  context: { category?: string; q?: string } = {},
  signal?: AbortSignal,
): Promise<ApiSponsoredAd[]> {
  try {
    return await api<ApiSponsoredAd[]>("/sponsored", { query: { placement, ...context }, signal });
  } catch {
    return [];
  }
}

/** Counts a tap on an ad; survives the navigation the tap starts. */
export function countSponsoredClick(adId: string) {
  api<null>(`/sponsored/${adId}/click`, { method: "POST", keepalive: true }).catch(() => undefined);
}

/** The static pages, by their address. */
export const shopPages = {
  terms: "Terms and Conditions",
  privacy: "Privacy Policy",
  "returns-policy": "Returns Policy",
  contact: "Contact Us",
} as const;

export type ShopPageKey = keyof typeof shopPages;

/** A published static page, or undefined while staff haven't published it. */
export async function getShopPage(key: ShopPageKey): Promise<ApiPage | undefined> {
  try {
    return await api<ApiPage>(`/pages/${key}`, { revalidate: 300 });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
}
