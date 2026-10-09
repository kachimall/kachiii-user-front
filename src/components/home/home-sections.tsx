import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import type { HomeSection } from "@/lib/api/products";

/** Where a section's "See all" goes: the catalogue in the same order, or its category. Picks have none. */
function seeAllHref(section: HomeSection): string | undefined {
  switch (section.kind) {
    case "newest":
      return "/products";
    case "best_selling":
      return "/products?sort=best-selling";
    case "top_rated":
      return "/products?sort=rating";
    case "category":
      return section.category ? `/categories/${section.category.slug}` : undefined;
    case "picked":
      return undefined;
  }
}

/** The rows staff set up in the back office, each a scrolling strip of product cards. */
export function HomeSections({ sections }: { sections: HomeSection[] }) {
  return sections.map((section) => {
    const href = seeAllHref(section);
    const headingId = `home-section-${section.id}`;

    return (
      <section
        key={section.id}
        aria-labelledby={headingId}
        className="rounded-lg bg-surface-container-lowest p-2.5 shadow-card"
      >
        <div className="flex items-center justify-between gap-2 pb-2.5">
          <h2 id={headingId} className="font-heading text-headline-sm tracking-tight uppercase sm:text-headline-md">
            {section.title}
          </h2>
          {href && (
            <Link
              href={href}
              className="flex shrink-0 items-center gap-0.5 text-label-md font-bold text-primary transition-colors hover:text-primary-container"
            >
              See all
              <ChevronRightIcon aria-hidden className="size-4" />
            </Link>
          )}
        </div>

        <ul className="-mx-2.5 flex snap-x gap-2 overflow-x-auto px-2.5 pb-1 scrollbar-none sm:gap-4">
          {section.products.map((p) => (
            <li key={p.id} className="w-36 shrink-0 snap-start sm:w-44 lg:w-[calc((100%-5*1rem)/6)]">
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </section>
    );
  });
}
