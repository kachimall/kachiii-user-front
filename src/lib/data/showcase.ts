import type { ApiBanner } from "@/lib/api/schema";

// Faces of the rotating special-category showcase on the home page. The admin's home
// carousel banners fill it when there are any; the built-in faces below (in the order of
// the client's reference deck, with placeholder images) stand in when there are none.

export type ShowcaseFace = {
  id: string;
  /** The big word on the face (a banner's headline). The pictures carry no text of their own. */
  word: string;
  tagline: string;
  /** A banner's button label, shown as a button when the face links somewhere. */
  button?: string | null;
  image: string;
  /** A banner's phone artwork, shown on narrow screens instead of `image`. */
  mobileImage?: string | null;
  /** What the picture shows, when the face has no word to name it. */
  alt?: string;
  /** Null: the face links nowhere. */
  href: string | null;
  /** When set, the face counts down to this time (a banner's end). */
  endsAt?: string | null;
};

/** The face's name, for screen readers and the dots. */
export const faceLabel = (face: ShowcaseFace) => face.word || face.alt || "Promotion";

/** A home carousel banner as a cube face: its headline, subheadline and button, written over its picture. */
export function bannerFace(banner: ApiBanner): ShowcaseFace {
  return {
    id: banner.id,
    word: banner.headline ?? "",
    tagline: banner.subheadline ?? "",
    button: banner.link_url ? banner.button_label : null,
    image: banner.desktop_image_url,
    mobileImage: banner.mobile_image_url,
    alt: banner.alt_text,
    href: banner.link_url,
    endsAt: banner.countdown_ends_at,
  };
}

export const showcaseFaces: ShowcaseFace[] = [
  { id: "style", word: "Style", tagline: "Fashion picks for the week", image: "/showcase/style.jpg", href: "/products?category=fashion" },
  { id: "tech", word: "Tech", tagline: "Gadgets, audio & smart home", image: "/showcase/tech.jpg", href: "/products?category=electronics" },
  { id: "glow", word: "Glow", tagline: "Skincare & beauty must-haves", image: "/showcase/glow.jpg", href: "/products?category=beauty" },
  { id: "spark", word: "Spark", tagline: "Toys, games & hobbies", image: "/showcase/spark.jpg", href: "/products?category=toys-hobbies" },
  { id: "paw", word: "Paw", tagline: "Everything for your pets", image: "/showcase/paw.jpg", href: "/products?category=pets" },
  { id: "auto", word: "Auto", tagline: "Car care & accessories", image: "/showcase/auto.jpg", href: "/products?category=automotive" },
  { id: "go", word: "Go", tagline: "Travel gear & luggage", image: "/showcase/go.jpg", href: "/products?category=travel" },
  { id: "active", word: "Active", tagline: "Sports & fitness", image: "/showcase/active.jpg", href: "/products?category=sports" },
];

/** How long each face stays before turning, and how long the turn takes. */
export const SHOWCASE_DWELL_MS = 3000;
export const SHOWCASE_TURN_MS = 900;

/** Inactivity before the showcase zooms in over the page. Temporarily 3 s for client review (planned: 20 s). */
export const SHOWCASE_IDLE_MS = 3000;
