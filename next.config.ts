import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Désactiver Turbopack pour utiliser le compilateur par défaut
  // (Turbopack a un bug avec les directives @tailwind dans globals.css)
};

export default nextConfig;
