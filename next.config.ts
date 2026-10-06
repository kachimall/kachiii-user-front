import type { NextConfig } from "next";

const api = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1");

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    // Banner and category art from the design handoff, plus product and category
    // photos from the backend's /storage (rendered unoptimized, see isApiImage).
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
    ],
  },
};

export default nextConfig;
