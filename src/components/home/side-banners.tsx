import { BannerLink, BannerPicture } from "@/components/home/banner-picture";
import { EndsAtCountdown } from "@/components/home/countdown";
import type { ApiBanner } from "@/lib/api/schema";
import { cn } from "@/lib/utils";

/** The column beside the slider holds two cards, like the built-in promo tiles. */
const MAX_SIDE_BANNERS = 2;

/**
 * The cards beside the home slider from the admin's banners (placement `home_side`),
 * in place of the built-in promo tiles. Under the slider on smaller screens they sit
 * side by side as a compact pair (3:2 on a phone, matching the mobile image; 3:1 from
 * `sm`, matching the desktop one) and stack in the column from `lg`.
 */
export function SideBanners({ banners }: { banners: ApiBanner[] }) {
  const shown = banners.slice(0, MAX_SIDE_BANNERS);
  const pair = shown.length > 1;

  return (
    <div className={cn("grid gap-2.5 md:gap-4 lg:col-span-4 lg:flex lg:flex-col", pair ? "grid-cols-2" : "grid-cols-1")}>
      {shown.map((banner) => (
        <BannerLink
          key={banner.id}
          banner={banner}
          className={cn(
            "group relative block overflow-hidden bg-surface-container shadow-card outline-none transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 lg:aspect-auto lg:min-h-40 lg:flex-1",
            pair ? "aspect-3/2 sm:aspect-3/1" : "aspect-5/2 sm:aspect-4/1",
          )}
        >
          <BannerPicture banner={banner} className="transition-transform duration-300 group-hover:scale-[1.02]" />
          {(banner.headline || banner.subheadline) && (
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-linear-to-t from-black/65 to-transparent p-2 pt-6 text-white sm:p-2.5 sm:pt-8">
              {banner.headline && (
                <h3 className="line-clamp-1 font-heading text-label-md font-bold sm:text-headline-sm">{banner.headline}</h3>
              )}
              {banner.subheadline && (
                <p className="line-clamp-1 hidden text-body-sm text-white/90 sm:block">{banner.subheadline}</p>
              )}
            </div>
          )}
          {banner.countdown_ends_at && (
            <span className="absolute top-1.5 right-1.5 rounded-full bg-black/45 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-md sm:top-2 sm:right-2 sm:px-2 sm:text-label-xs">
              <span className="hidden sm:inline">Ends in </span>
              <EndsAtCountdown endsAt={banner.countdown_ends_at} className="font-bold tabular-nums" />
            </span>
          )}
        </BannerLink>
      ))}
    </div>
  );
}
