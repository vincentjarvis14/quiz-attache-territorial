import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const main = async () => {
  try {
    console.log("🌱 Seeding themes and sous-themes...");

    // Nettoyage
    await db.delete(schema.userSousThemeProgress);
    await db.delete(schema.userAnswers);
    await db.delete(schema.quizSessions);
    await db.delete(schema.challengeProgress);
    await db.delete(schema.challengeOptions);
    await db.delete(schema.challenges);
    await db.delete(schema.lessons);
    await db.delete(schema.sousThemes);
    await db.delete(schema.themes);

    // ─── Thème 1 : Environnement Territorial ─────────────────────
    const envTerritorial = await db
      .insert(schema.themes)
      .values({
        title: "Environnement Territorial",
        description: "Organisation administrative et territoriale de l'État",
        imageSrc: "/env-territorial.svg",
        order: 1,
        matiere: "environnement_territorial",
      })
      .returning();

    const envSousThemes = [
      {
        title: "Grands principes de l'organisation de l'État",
        description: "Les principes fondamentaux de l'organisation étatique",
        pdfFileName: "01-grands-principes-organisation-etat.pdf",
        order: 1,
      },
      {
        title: "Organisation administrative de l'État",
        description: "L'administration centrale et déconcentrée",
        pdfFileName: "02-organisation-administrative-etat.pdf",
        order: 2,
      },
      {
        title: "Grandes étapes de la décentralisation",
        description: "Les lois de décentralisation de 1982 à nos jours",
        pdfFileName: "03-grandes-etapes-decentralisation.pdf",
        order: 3,
      },
      {
        title: "Organisation juridictionnelle",
        description: "Les ordres judiciaire et administratif",
        pdfFileName: "04-organisation-juridictionnelle.pdf",
        order: 4,
      },
      {
        title: "Principes des collectivités territoriales",
        description: "Les collectivités territoriales et leur fonctionnement",
        pdfFileName: "05-principes-collectivites-territoriales.pdf",
        order: 5,
      },
    ];

    for (const st of envSousThemes) {
      await db.insert(schema.sousThemes).values({
        ...st,
        themeId: envTerritorial[0].id,
        pdfPath: `Source RAG/environnement-territorial/${st.pdfFileName}`,
      });
    }

    // ─── Thème 2 : Urbanisme ─────────────────────────────────────
    const urbanisme = await db
      .insert(schema.themes)
      .values({
        title: "Urbanisme",
        description: "Droit de l'urbanisme et aménagement du territoire",
        imageSrc: "/urbanisme.svg",
        order: 2,
        matiere: "urbanisme",
      })
      .returning();

    const urbSousThemes = [
      {
        title: "Règlement National d'Urbanisme (RNU)",
        description: "Les règles nationales d'urbanisme",
        pdfFileName: "96-reglement-national-urbanisme.pdf",
        order: 1,
      },
      {
        title: "Carte communale",
        description: "La carte communale et son régime",
        pdfFileName: "97-carte-communale.pdf",
        order: 2,
      },
      {
        title: "Plan Local d'Urbanisme (PLU)",
        description: "Le PLU, contenu et procédure d'élaboration",
        pdfFileName: "98-plan-local-urbanisme.pdf",
        order: 3,
      },
      {
        title: "Schéma de Cohérence Territoriale (SCoT)",
        description: "Le SCoT et son rôle dans la planification",
        pdfFileName: "99-schema-coherence-territoriale.pdf",
        order: 4,
      },
      {
        title: "Loi Littoral",
        description: "La protection et l'aménagement du littoral",
        pdfFileName: "100-loi-littoral.pdf",
        order: 5,
      },
      {
        title: "Loi Montagne",
        description: "La protection et l'aménagement de la montagne",
        pdfFileName: "101-loi-montagne.pdf",
        order: 6,
      },
      {
        title: "Certificat d'urbanisme",
        description: "Le certificat d'urbanisme et ses types",
        pdfFileName: "102-certificat-urbanisme.pdf",
        order: 7,
      },
      {
        title: "Règles communes aux autorisations",
        description: "Les règles communes aux autorisations d'urbanisme",
        pdfFileName: "103-regles-communes-autorisations.pdf",
        order: 8,
      },
      {
        title: "Déclaration préalable",
        description: "Le régime de la déclaration préalable",
        pdfFileName: "104-declaration-prealable.pdf",
        order: 9,
      },
      {
        title: "Permis de construire",
        description: "Le permis de construire et son instruction",
        pdfFileName: "105-permis-construire.pdf",
        order: 10,
      },
      {
        title: "Permis d'aménager et de démolir",
        description: "Les permis d'aménager et de démolir",
        pdfFileName: "106-permis-amenager-demolir.pdf",
        order: 11,
      },
      {
        title: "Opérations d'aménagement",
        description: "Les opérations d'aménagement (ZAC, lotissements...)",
        pdfFileName: "107-operations-amenagement.pdf",
        order: 12,
      },
      {
        title: "Contentieux de l'urbanisme",
        description: "Le contentieux des autorisations d'urbanisme",
        pdfFileName: "108-contentieux-urbanisme.pdf",
        order: 13,
      },
    ];

    for (const st of urbSousThemes) {
      await db.insert(schema.sousThemes).values({
        ...st,
        themeId: urbanisme[0].id,
        pdfPath: `Source RAG/urbanisme/${st.pdfFileName}`,
      });
    }

    console.log("✅ Themes and sous-themes seeded successfully!");
    console.log(`   - Environnement Territorial: ${envSousThemes.length} sous-thèmes`);
    console.log(`   - Urbanisme: ${urbSousThemes.length} sous-thèmes`);
    console.log(`   - Total: ${envSousThemes.length + urbSousThemes.length} sous-thèmes`);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to seed database");
  }
};

void main();
