import { redirect } from "next/navigation";

// The backend's sitemap and home banners link categories as /categories/{slug};
// the shop lists them on the product listing.
export default async function CategoryPage({ params }: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  redirect(`/products?category=${encodeURIComponent(slug)}`);
}
