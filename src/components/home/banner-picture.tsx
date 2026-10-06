import Link from "next/link";
import type { ApiBanner } from "@/lib/api/schema";
import { cn } from "@/lib/utils";

// Shared pieces of the API's home banners (hero slider and side cards).

/** Below Tailwind's `sm`, where the mobile image (when the banner has one) takes over. */
const MOBILE_QUERY = "(max-width: 639px)";

type PictureProps = {
  banner: ApiBanner;
  /** The first slide loads at once; the rest wait until shown. */
  eager?: boolean;
  className?: string;
};

/**
 * The banner's desktop image, or its mobile one on a phone. A plain <picture>: the
 * images are already sized WebP from the API (or R2), so they skip the optimizer
 * like every other API image (see isApiImage), and only the matching one downloads.
 * Fills its parent, which must be positioned.
 */
export function BannerPicture({ banner, eager, className }: PictureProps) {
  return (
    <picture>
      {banner.mobile_image_url && <source media={MOBILE_QUERY} srcSet={banner.mobile_image_url} />}
      <img
        src={banner.desktop_image_url}
        alt={banner.alt_text}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        decoding="async"
        className={cn("absolute inset-0 size-full object-cover", className)}
      />
    </picture>
  );
}

type LinkProps = {
  banner: ApiBanner;
  className?: string;
  children: React.ReactNode;
};

/**
 * Wraps a banner in its link: a shop path through the router, an https:// address as a
 * plain link (the backend accepts nothing else). Without a link it is a plain box.
 */
export function BannerLink({ banner, className, children }: LinkProps) {
  const href = banner.link_url;
  if (!href) return <div className={className}>{children}</div>;
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} rel="noopener" className={className}>
      {children}
    </a>
  );
}
