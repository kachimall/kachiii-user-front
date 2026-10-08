import { BannerLink, BannerPicture } from "@/components/home/banner-picture";
import { EndsAtCountdown } from "@/components/home/countdown";
import type { ApiBanner } from "@/lib/api/schema";

/** The column beside the slider holds two cards, like the built-in promo tiles. */
const MAX_SIDE_BANNERS = 2;

/**
 * The cards beside the home slider from the admin's banners (placement `home_side`),
 * in place of the built-in promo tiles. Stacked under the slider on smaller screens.
 */
export function SideBanners({ banners }: { banners: ApiBanner[] }) {
  return (
    <div className="flex flex-col gap-4 lg:col-span-4">
      {banners.slice(0, MAX_SIDE_BANNERS).map((banner) => (
        <BannerLink
          key={banner.id}
          banner={banner}
          className="group relative block aspect-3/2 overflow-hidden bg-surface-container shadow-card outline-none transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 sm:aspect-3/1 lg:aspect-auto lg:min-h-40 lg:flex-1"
        >
          <BannerPicture banner={banner} className="transition-transform duration-300 group-hover:scale-[1.02]" />
          {(banner.headline || banner.subheadline) && (
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-linear-to-t from-black/65 to-transparent p-2.5 pt-8 text-white">
              {banner.headline && <h3 className="font-heading text-headline-sm">{banner.headline}</h3>}
              {banner.subheadline && <p className="line-clamp-1 text-body-sm text-white/90">{banner.subheadline}</p>}
            </div>
          )}
          {banner.countdown_ends_at && (
            <span className="absolute top-2 right-2 rounded-full bg-black/45 px-2 py-0.5 text-label-xs text-white backdrop-blur-md">
              Ends in{" "}
              <EndsAtCountdown endsAt={banner.countdown_ends_at} className="font-bold tabular-nums" />
            </span>
          )}
        </BannerLink>
      ))}
    </div>
  );
}
