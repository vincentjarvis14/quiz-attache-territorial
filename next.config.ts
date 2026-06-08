import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ancre la racine du workspace sur ce projet : évite que Turbopack
  // remonte sur le package-lock.json présent dans /Users/vincentbalu.
  turbopack: {
    root: __dirname,
  },
  // Transformers.js (recherche sémantique locale) embarque un binaire natif
  // (onnxruntime-node) : on l'exclut du bundle serveur. Côté client, il est
  // chargé dynamiquement et utilise automatiquement le runtime WASM/WebGPU.
  serverExternalPackages: ["@huggingface/transformers"],
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
