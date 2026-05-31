import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { cleanToBlocks } from "@/lib/clean-section";

/**
 * backfill-content-clean.ts — Recalcule content_clean pour toutes les sections
 * à partir du texte brut, via cleanToBlocks() (qui détecte désormais les blocs
 * "reference" pour les articles de loi).
 *
 * Usage : npx tsx scripts/backfill-content-clean.ts
 */
async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = (await sql`
    SELECT id, title, content FROM sections
  `) as { id: string; title: string; content: string }[];

  console.log(`${rows.length} sections à recalculer…`);
  let refCount = 0;
  for (const row of rows) {
    const blocks = cleanToBlocks(row.content, { title: row.title });
    if (blocks.some((b) => b.type === "reference")) refCount++;
    await sql`
      UPDATE sections SET content_clean = ${JSON.stringify(blocks)}
      WHERE id = ${row.id}
    `;
  }
  console.log(`Terminé. ${refCount} sections contiennent au moins une référence légale.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
