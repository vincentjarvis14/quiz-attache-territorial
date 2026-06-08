import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    // On ne teste que le code TypeScript de l'app active.
    include: ["{lib,app,actions,db}/**/*.{test,spec}.{ts,tsx}"],
    // Exclut l'ancienne app vanilla (scripts legacy) et les artefacts de build.
    exclude: ["node_modules/**", "_legacy/**", ".next/**", "dist/**"],
    // URL factice : permet d'importer lib/rag.ts (qui instancie Neon au chargement)
    // sans jamais ouvrir de connexion — on ne teste que de la logique pure.
    env: { DATABASE_URL: "postgres://user:pass@localhost:5432/test" },
  },
})
