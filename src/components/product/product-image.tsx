import Image from "next/image";
import {
  CakeIcon,
  DumbbellIcon,
  PackageIcon,
  PuzzleIcon,
  ShirtIcon,
  ShoppingBasketIcon,
  SmartphoneIcon,
  SofaIcon,
  SparklesIcon,
  type LucideIcon,
} from "lucide-react";
import { isApiImage } from "@/lib/api/client";
import { cn } from "@/lib/utils";

// Placeholder icons for the backend's root categories.
const categoryIcon: Record<string, LucideIcon> = {
  electronics: SmartphoneIcon,
  fashion: ShirtIcon,
  "home-living": SofaIcon,
  "health-beauty": SparklesIcon,
  groceries: ShoppingBasketIcon,
  "dates-sweets": CakeIcon,
  "toys-kids-babies": PuzzleIcon,
  "sports-outdoors": DumbbellIcon,
};

type Props = {
  name: string;
  /** Root category slug, for the placeholder icon. */
  category?: string;
  image?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
};

/** Square product photo, or a neutral placeholder with the category icon. */
export function ProductImage({
  name,
  category,
  image,
  sizes = "(min-width: 1024px) 20vw, 50vw",
  priority,
  className,
  imageClassName,
}: Props) {
  const Icon = (category && categoryIcon[category]) || PackageIcon;

  return (
    <div className={cn("relative aspect-square overflow-hidden rounded-md bg-surface-container-low", className)}>
      {image ? (
        <Image
          src={image}
          alt={name}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={isApiImage(image)}
          className={cn("object-cover", imageClassName)}
        />
      ) : (
        <div role="img" aria-label={name} className="grid size-full place-items-center">
          <Icon aria-hidden strokeWidth={1.25} className="size-1/3 text-outline" />
        </div>
      )}
    </div>
  );
}
