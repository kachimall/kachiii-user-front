import { ShopPage, shopPageMetadata } from "@/components/content/shop-page";

// Staff edit these in the admin portal; changes show within five minutes.
export const revalidate = 300;

export const generateMetadata = () => shopPageMetadata("contact");

export default function ContactPage() {
  return <ShopPage pageKey="contact" />;
}
