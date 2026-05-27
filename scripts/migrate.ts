import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { Client } from "pg";

async function main() {
  console.log("🚀 Applying migrations...");

  const migrationPath = path.join(process.cwd(), "drizzle/0000_overconfident_devos.sql");
  const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

  const client = new Client({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  // Split by statement-breakpoint
  const statements = migrationSQL
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    try {
      await client.query(statement);
      console.log(`✅ ${statement.slice(0, 60)}...`);
    } catch (error: any) {
      // Ignore "already exists" errors
      if (error?.code === "42710" || error?.message?.includes("already exists")) {
        console.log(`⏭️  Already exists: ${statement.slice(0, 60)}...`);
      } else {
        console.error(`❌ Error:`, error.message);
        throw error;
      }
    }
  }

  await client.end();
  console.log("\n🎉 Migration applied successfully!");
}

void main();
