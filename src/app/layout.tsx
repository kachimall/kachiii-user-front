import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { SessionHydrator } from "@/components/layout/cart-button";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Toaster } from "@/components/ui/sonner";
import { getCategories } from "@/lib/api/products";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Kachi Mall — Flash deals, vouchers and official brands",
    template: "%s · Kachi Mall",
  },
  description:
    "Shop flash deals, daily vouchers and 100% authentic brands across electronics, beauty, fashion and home.",
};

export const viewport: Viewport = {
  // Lets the bottom tab bar sit under the home indicator and pad itself with safe-area insets.
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Feeds the mobile category sheet; a backend outage leaves it empty rather than failing the page.
  const categories = await getCategories().catch(() => []);

  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-surface pb-bottom-nav text-body-md text-on-surface md:pb-0">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-secondary px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <MobileBottomNav categories={categories} />
        <SessionHydrator />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
