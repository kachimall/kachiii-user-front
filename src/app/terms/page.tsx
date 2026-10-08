import { ShopPage, shopPageMetadata } from "@/components/content/shop-page";

// Staff edit these in the admin portal; changes show within five minutes.
export const revalidate = 300;

export const generateMetadata = () => shopPageMetadata("terms");

export default function TermsPage() {
  return <ShopPage pageKey="terms" />;
}
