"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BadgeCheckIcon, TicketIcon, TimerIcon, ZapIcon } from "lucide-react";
import { ClaimVoucherButton } from "@/components/home/claim-voucher-button";
import { InlineCountdown } from "@/components/home/countdown";
import { ShowcaseSlot } from "@/components/showcase/idle-showcase";
import type { HeroSlide } from "@/lib/data/home";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 6000;

type Props = {
  slides: HeroSlide[];
  /** "cube": showcase replaces the banner image. "anchor": flat image, used as the idle showcase's anchor. */
  media?: "cube" | "anchor";
};

export function HeroCarousel({ slides, media = "cube" }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = slides[index];

  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [index, paused, slides.length]);

  const ctaClass =
    "flex items-center gap-1 rounded-lg bg-primary px-6 py-2.5 font-heading text-headline-sm text-white shadow-md transition hover:bg-primary-container active:scale-95";

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Promotions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="relative flex min-h-80 flex-col justify-between overflow-hidden rounded-lg bg-linear-to-r from-secondary via-secondary-container to-primary p-4 text-white shadow-md sm:p-6 lg:col-span-8 lg:min-h-90"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 size-80 rounded-full bg-primary-container/30 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-12 size-64 rounded-full bg-secondary/40 blur-xl"
      />

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex flex-wrap items-center gap-1">
          <span className="flex items-center gap-1 rounded-md bg-primary-container px-2.5 py-1 font-heading text-headline-sm tracking-wider uppercase shadow-sm">
            <BadgeCheckIcon aria-hidden className="size-4.5" />
            {slide.badge}
          </span>
          <span className="rounded-md bg-white/20 px-1.5 py-1 text-label-md uppercase backdrop-blur-md">
            {slide.subBadge}
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-label-md shadow-inner backdrop-blur-md">
          <TimerIcon aria-hidden className="size-4 text-tertiary-fixed" />
          <span>Ends in:</span>
          <InlineCountdown className="font-heading font-bold tracking-wider tabular-nums" />
        </div>
      </div>

      <div aria-live="polite" className="relative z-10 my-2.5 grid items-center gap-2.5 sm:grid-cols-12">
        <div className="flex flex-col gap-1.5 sm:col-span-7">
          <h1 className="font-heading text-headline-xl-mobile tracking-tight sm:text-headline-xl">{slide.title}</h1>
          <p className="max-w-md text-body-md text-on-secondary-container">
            {slide.body} <strong>{slide.highlight}</strong>
          </p>
          <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
            {slide.cta.action === "claim-voucher" ? (
              <ClaimVoucherButton className={ctaClass}>
                <TicketIcon aria-hidden className="size-5" />
                {slide.cta.label}
              </ClaimVoucherButton>
            ) : (
              <Link href={slide.cta.href ?? "/products"} className={ctaClass}>
                {slide.cta.label}
              </Link>
            )}
            <span className="flex items-center gap-1 text-label-xs text-on-secondary-container">
              <ZapIcon aria-hidden className="size-3.5" />
              Instant auto-apply
            </span>
          </div>
        </div>
        {media === "cube" ? (
          // Special-category showcase replaces the flat banner image.
          <ShowcaseSlot
            className="w-full sm:col-span-5"
            sizes="(min-width: 1024px) 340px, (min-width: 640px) 40vw, 92vw"
          />
        ) : (
          <HeroImage slide={slide} priority={index === 0} />
        )}
      </div>

      <div className="relative z-10 flex items-center justify-between pt-1">
        <div className="flex items-center gap-1">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show promotion ${i + 1}: ${s.title}`}
              aria-current={i === index}
              className={cn(
                "h-2 rounded-full bg-white transition-all outline-none focus-visible:ring-2 focus-visible:ring-white",
                i === index ? "w-8" : "w-2 bg-white/40 hover:bg-white/80",
              )}
            />
          ))}
        </div>
        <span className="hidden text-label-xs tracking-wider text-on-secondary-container uppercase sm:inline">
          Verified official mall partners
        </span>
      </div>
    </section>
  );
}

function HeroImage({ slide, priority }: { slide: HeroSlide; priority: boolean }) {
  return (
    <ShowcaseSlot className="relative hidden h-44 overflow-hidden rounded-lg shadow-lg sm:col-span-5 sm:block">
      <Image
        key={slide.id}
        src={slide.image}
        alt={slide.imageAlt}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 25vw, 40vw"
        className="object-cover"
      />
    </ShowcaseSlot>
  );
}
