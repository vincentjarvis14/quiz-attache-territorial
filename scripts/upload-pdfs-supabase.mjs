/**
 * Crée le bucket public "cours-pdfs" et uploade les 17 PDFs de Source RAG/.
 * Nommage : {slug}.pdf où slug = nom du fichier = source_pdf en base.
 *
 * Prérequis : SUPABASE_SECRET_KEY dans .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { glob } from "node:fs/promises";
import { basename } from "node:path";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const BUCKET = "cours-pdfs";

if (!SUPABASE_URL || !SECRET_KEY) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SECRET_KEY manquant");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SECRET_KEY, {
  auth: { persistSession: false },
});

async function main() {
  // 1. Créer le bucket public (idempotent)
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);

  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      allowedMimeTypes: ["application/pdf"],
      fileSizeLimit: 52428800, // 50 Mo
    });
    if (error) {
      console.error("❌ Création bucket:", error.message);
      process.exit(1);
    }
    console.log(`✓ Bucket "${BUCKET}" créé (public)`);
  } else {
    console.log(`✓ Bucket "${BUCKET}" existe déjà`);
  }

  // 2. Lister les PDFs
  const pdfs = [];
  for await (const entry of glob("Source RAG/**/*.pdf")) {
    pdfs.push(entry);
  }
  pdfs.sort();
  console.log(`\n${pdfs.length} PDFs à uploader.\n`);

  // 3. Upload
  let ok = 0, fail = 0;
  for (const path of pdfs) {
    const slug = basename(path, ".pdf");
    const fileName = `${slug}.pdf`;
    const buffer = readFileSync(path);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) {
      console.error(`❌ ${slug}: ${error.message}`);
      fail++;
    } else {
      ok++;
      console.log(`✓ ${slug}`);
    }
  }

  console.log(`\n✓ Terminé : ${ok} uploadés, ${fail} échecs.`);

  // 4. Afficher l'URL publique d'exemple
  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl("98-plan-local-urbanisme.pdf");
  console.log(`\nURL publique type :\n  ${data.publicUrl}`);
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
