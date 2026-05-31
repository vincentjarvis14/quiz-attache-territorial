import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ancre la racine du workspace sur ce projet : évite que Turbopack
  // remonte sur le package-lock.json présent dans /Users/vincentbalu.
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
