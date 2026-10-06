"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { ProductImage } from "@/components/product/product-image";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  category?: string;
  images: string[];
  /** Overlaid on the main photo, e.g. store and discount badges. */
  children?: React.ReactNode;
};

/** Main product photo with thumbnails and previous/next arrows to flip through the rest. */
export function ProductGallery({ name, category, images, children }: Props) {
  const photos = images.slice(0, 8);
  const [index, setIndex] = useState(0);
  const count = photos.length;
  const step = (delta: number) => setIndex((i) => (i + delta + count) % count);

  return (
    <div className="flex flex-col gap-2">
      <div className="group relative rounded-lg bg-surface-container-lowest p-2 shadow-card">
        <ProductImage
          name={count > 1 ? `${name}, photo ${index + 1} of ${count}` : name}
          category={category}
          image={photos[index]}
          sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw"
          priority={index === 0}
        />
        {children}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute top-1/2 left-4 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-surface-container-lowest/90 text-on-surface shadow-md outline-none transition-opacity hover:bg-surface-container-lowest focus-visible:ring-3 focus-visible:ring-ring/50 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
            >
              <ChevronLeftIcon aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute top-1/2 right-4 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-surface-container-lowest/90 text-on-surface shadow-md outline-none transition-opacity hover:bg-surface-container-lowest focus-visible:ring-3 focus-visible:ring-ring/50 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
            >
              <ChevronRightIcon aria-hidden className="size-5" />
            </button>
            <span className="absolute right-4 bottom-4 rounded-full bg-on-surface/70 px-2 py-0.5 text-label-xs text-white tabular-nums">
              {index + 1}/{count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="flex gap-2 overflow-x-auto scrollbar-none" aria-label="Product photos">
          {photos.map((src, i) => (
            <li key={src} className="w-16 shrink-0 sm:w-20">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "block w-full rounded-md bg-surface-container-lowest p-0.5 shadow-card outline-none ring-2 transition focus-visible:ring-ring/60",
                  i === index ? "ring-primary-container" : "ring-transparent hover:ring-outline-variant",
                )}
              >
                <ProductImage name="" image={src} sizes="80px" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
