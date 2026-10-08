import type { NextConfig } from "next";

const api = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1");
// The live server keeps public images on Cloudflare R2, served from its own domain.
const media = process.env.NEXT_PUBLIC_MEDIA_URL ? new URL(process.env.NEXT_PUBLIC_MEDIA_URL) : undefined;

const nextConfig: NextConfig = {
  // The dev server only trusts localhost by default; without this, opening the app via
  // 127.0.0.1 or the LAN IP blocks dev assets, so the page never hydrates and sits on its loader.
  allowedDevOrigins: ["127.0.0.1", "192.168.*.*"],
  turbopack: {
    root: __dirname,
  },
  // Search engines read robots.txt and the sitemaps at the shop's root; the backend writes them
  // (keeping a test server out of search, listing every product, category, store and page).
  async rewrites() {
    const backend = api.href.replace(/\/$/, "");
    return [
      { source: "/robots.txt", destination: `${backend}/robots.txt` },
      { source: "/sitemap.xml", destination: `${backend}/sitemap.xml` },
      { source: "/sitemap-pages.xml", destination: `${backend}/sitemap-pages.xml` },
      { source: "/sitemap-products-:page(\\d+).xml", destination: `${backend}/sitemap-products-:page.xml` },
    ];
  },
  images: {
    // Banner and category art from the design handoff, plus product, category and banner
    // photos from the backend's /storage or the R2 media domain (rendered unoptimized, see isApiImage).
    // 90 is used for the showcase faces: smooth gradients band and look blocky at the default 75.
    qualities: [75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/aida-public/**" },
      {
        protocol: api.protocol.replace(":", "") as "http" | "https",
        hostname: api.hostname,
        port: api.port,
        pathname: "/storage/**",
      },
      ...(media
        ? [
            {
              protocol: media.protocol.replace(":", "") as "http" | "https",
              hostname: media.hostname,
              port: media.port,
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
