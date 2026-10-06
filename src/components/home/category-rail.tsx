"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { isApiImage } from "@/lib/api/client";
import { formatCount } from "@/lib/pricing";
import type { Category } from "@/types";

export function CategoryRail({ categories }: { categories: Category[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () =>
      setEdges({
        start: list.scrollLeft <= 1,
        end: list.scrollLeft + list.clientWidth >= list.scrollWidth - 1,
      });
    update();
    list.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(list);
    return () => {
      list.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  function scroll(direction: 1 | -1) {
    const list = listRef.current;
    if (!list) return;
    list.scrollBy({ left: direction * list.clientWidth * 0.8, behavior: "smooth" });
  }

  const arrowClass =
    "grid size-8 place-items-center rounded-full bg-surface-container-low transition-colors outline-none hover:bg-surface-container focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-40";

  return (
    <section aria-labelledby="categories-heading" className="rounded-lg bg-surface-container-lowest p-2.5 shadow-card">
      <div className="flex items-center justify-between pb-1.5">
        <h2 id="categories-heading" className="font-heading text-headline-md tracking-tight">
          Top Categories This Week
        </h2>
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Previous categories" onClick={() => scroll(-1)} disabled={edges.start} className={arrowClass}>
            <ChevronLeftIcon className="size-4.5" />
          </button>
          <button type="button" aria-label="Next categories" onClick={() => scroll(1)} disabled={edges.end} className={arrowClass}>
            <ChevronRightIcon className="size-4.5" />
          </button>
        </div>
      </div>
      <ul ref={listRef} className="flex snap-x gap-4 overflow-x-auto pt-1 scrollbar-none">
        {categories.map((c) => (
          <li key={c.slug} className="w-20 shrink-0 snap-start md:flex-1">
            <Link
              href={`/products?category=${c.slug}`}
              className="group flex flex-col items-center rounded-md text-center outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="relative mb-1 size-20 overflow-hidden rounded-full bg-surface-container-low p-2 shadow-inner transition-colors group-hover:bg-primary-fixed">
                <span className="relative block size-full overflow-hidden rounded-full">
                  <Image src={c.image} alt="" fill sizes="80px" unoptimized={isApiImage(c.image)} className="object-cover" />
                </span>
              </span>
              <span className="text-label-md font-medium transition-colors group-hover:text-primary">{c.name}</span>
              <span className="text-[10px] text-on-surface-variant">{c.itemCount ? `${formatCount(c.itemCount)}+ items` : "Shop now"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
