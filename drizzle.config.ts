import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// drizzle-kit ne charge aucun fichier .env automatiquement.
// On charge .env.local en priorité (URL Neon), puis .env en repli.
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
