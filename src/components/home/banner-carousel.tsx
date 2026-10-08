"use client";

import { useEffect, useState } from "react";
import { ArrowRightIcon, TimerIcon } from "lucide-react";
import { BannerLink, BannerPicture } from "@/components/home/banner-picture";
import { EndsAtCountdown } from "@/components/home/countdown";
import { ShowcaseSlot } from "@/components/showcase/idle-showcase";
import type { ApiBanner } from "@/lib/api/schema";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 6000;

/**
 * The home slider from the admin's banners (placement `home_carousel`): each slide is
 * the banner's artwork, with its optional headline, subheadline and button over it.
 * The idle showcase zooms out of it, as it does from the built-in hero's image.
 */
export function BannerCarousel({ banners }: { banners: ApiBanner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const banner = banners[index] ?? banners[0];

  useEffect(() => {
    if (paused || banners.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % banners.length), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [index, paused, banners.length]);

  const hasText = Boolean(banner.headline || banner.subheadline || (banner.button_label && banner.link_url));

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Promotions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="relative overflow-hidden rounded-lg bg-surface-container shadow-md lg:col-span-8"
    >
      {/* Phones show the mobile artwork (at least 600×400), wider screens the desktop one (at least 1200×400). */}
      <ShowcaseSlot className="relative aspect-3/2 sm:aspect-3/1 lg:aspect-auto lg:h-full lg:min-h-90">
        <BannerLink
          key={banner.id}
          banner={banner}
          className="group absolute inset-0 block outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
        >
          <BannerPicture banner={banner} eager={index === 0} />
          {hasText && (
            <div
              aria-live="polite"
              className="absolute inset-0 flex flex-col justify-center gap-1.5 bg-linear-to-r from-black/60 via-black/25 to-transparent p-4 pb-10 text-white sm:max-w-[70%] sm:p-6 sm:pb-12"
            >
              {banner.headline && (
                <h1 className="font-heading text-headline-xl-mobile tracking-tight sm:text-headline-xl">{banner.headline}</h1>
              )}
              {banner.subheadline && <p className="max-w-md text-body-md text-white/90">{banner.subheadline}</p>}
              {banner.button_label && banner.link_url && (
                <span className="mt-1 flex w-fit items-center gap-1 rounded-lg bg-primary px-6 py-2.5 font-heading text-headline-sm text-white shadow-md transition group-hover:bg-primary-container group-active:scale-95">
                  {banner.button_label}
                  <ArrowRightIcon aria-hidden className="size-4.5" />
                </span>
              )}
            </div>
          )}
        </BannerLink>
      </ShowcaseSlot>

      {banner.countdown_ends_at && (
        <div className="pointer-events-none absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/55 py-1 pr-2.5 pl-2 text-label-xs text-white shadow-md ring-1 ring-white/15 backdrop-blur-md">
          <TimerIcon aria-hidden className="size-3.5 text-tertiary-fixed" />
          <span className="font-medium tracking-wider text-white/75 uppercase">Ends in</span>
          <EndsAtCountdown endsAt={banner.countdown_ends_at} className="font-heading font-bold tabular-nums" />
        </div>
      )}

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-4 z-10 flex items-center gap-1 sm:left-6">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show promotion ${i + 1}: ${b.headline ?? b.alt_text}`}
              aria-current={i === index}
              className={cn(
                "h-2 rounded-full bg-white shadow-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-white",
                i === index ? "w-8" : "w-2 bg-white/50 hover:bg-white/80",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
