import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product images are stored as URLs (CDN, Vercel Blob, Cloudinary, etc.).
    // Tighten this list to the client's actual image hosts before launch.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
