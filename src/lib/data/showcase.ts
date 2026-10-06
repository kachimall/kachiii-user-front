// Faces of the rotating special-category showcase on the home page, in the
// order of the client's reference deck. Images are temporary placeholders.

export type ShowcaseFace = {
  id: string;
  word: string;
  tagline: string;
  image: string;
  href: string;
};

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
