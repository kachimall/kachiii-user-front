import { api } from "@/lib/api/client";
import type { ApiBanner, ApiBanners } from "@/lib/api/schema";

// Home banners from the shop API. The backend caches them for a minute and checks
// each banner's schedule on every request, so the page keeps them no longer.
const BANNERS_TTL = 60;

// A live banner always has its desktop image; this only guards against a malformed answer.
const shown = (banners: ApiBanner[] | undefined) => (banners ?? []).filter((b) => b.desktop_image_url);

const none: ApiBanners = { home_carousel: [], home_side: [] };

/**
 * The live home banners, by placement. Never throws: an error (or a backend without
 * banners yet) gives empty placements, and the home page keeps its built-in promos.
 */
export async function getHomeBanners(): Promise<ApiBanners> {
  try {
    const banners = await api<Partial<ApiBanners>>("/banners", { revalidate: BANNERS_TTL });
    return { home_carousel: shown(banners.home_carousel), home_side: shown(banners.home_side) };
  } catch {
    return none;
  }
}
