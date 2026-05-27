import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, inArray } from "drizzle-orm";
import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import * as schema from "@/db/schema";

const deepseek = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY!,
  timeout: 120000, // 2 minutes timeout par appel
  maxRetries: 3,
});

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const QUESTIONS_PER_SOUS_THEME = 23;
const LESSONS_PER_SOUS_THEME = 3;

async function extractTextFromPDF(pdfPath: string): Promise<string> {
  try {
    const pdfParse = require("pdf-parse");
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`❌ Erreur lecture PDF ${pdfPath}:`, error);
    return "";
  }
}

function chunkText(text: string, maxChunkSize: number = 3000): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    if (currentChunk.length + para.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += "\n\n" + para;
    }
  }
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

async function generateQuestionsForChunk(
  chunk: string,
  sousThemeTitle: string,
  themeTitle: string,
  count: number
): Promise<Array<{
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  sourceChunk: string;
  difficulty: number;
}>> {
  const prompt = `Tu es un expert en droit public et en urbanisme, spécialiste des concours de la fonction publique territoriale (Attaché Territorial). Tu génères des questions QCM de niveau EXPERT pour une juriste confirmée qui prépare le concours.

Contexte : Thème "${themeTitle}" — Sous-thème "${sousThemeTitle}"

Document source :
${chunk.slice(0, 2500)}

Génère ${count} questions QCM TRÈS DIFFICILES avec :
- 4 propositions (A, B, C, D)
- UNE SEULE bonne réponse
- Des questions PIÉGEUSES qui testent des nuances fines du droit
- Des cas pratiques, des exceptions, des jurisprudences
- Un niveau expert (pas des questions basiques)

Format de réponse (JSON uniquement, pas de texte avant/après) :
{
  "questions": [
    {
      "question": "Texte de la question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explication détaillée de pourquoi c'est la bonne réponse, avec référence au texte source",
      "difficulty": 3
    }
  ]
}

RÈGLES IMPORTANTES :
- correctAnswer est l'INDEX (0, 1, 2 ou 3) de la bonne réponse dans le tableau options
- difficulty : 1=facile, 2=moyen, 3=difficile (mets surtout 2 et 3)
- Les questions doivent être précises, techniques, niveau concours
- Piège sur les délais, les exceptions, les seuils, les compétences`;

  try {
    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "Tu génères des QCM experts en droit public au format JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Pas de réponse de DeepSeek");

    const parsed = JSON.parse(content);
    return (parsed.questions || []).map((q: any) => ({
      ...q,
      sourceChunk: chunk.slice(0, 500),
    }));
  } catch (error) {
    console.error(`❌ Erreur génération pour "${sousThemeTitle}":`, error);
    return [];
  }
}

async function main() {
  console.log("🤖 Reprise de la génération des questions...\n");

  // Récupérer tous les sous-thèmes
  const allSousThemes = await db
    .select()
    .from(schema.sousThemes)
    .innerJoin(schema.themes, eq(schema.sousThemes.themeId, schema.themes.id));

  // Récupérer les sous-thèmes déjà traités (qui ont des leçons)
  const existingLessons = await db.select().from(schema.lessons);
  const processedSousThemeIds = new Set(existingLessons.map(l => l.sousThemeId));

  console.log(`📊 Sous-thèmes déjà traités : ${processedSousThemeIds.size}/${allSousThemes.length}`);

  let totalGenerated = 0;

  for (const { sous_themes: st, themes: theme } of allSousThemes) {
    // Skip si déjà traité
    if (processedSousThemeIds.has(st.id)) {
      console.log(`⏭️  Déjà traité : ${theme.title} → ${st.title}`);
      continue;
    }

    console.log(`\n📖 ${theme.title} → ${st.title}`);

    // Lire le PDF
    const pdfFullPath = path.join(process.cwd(), st.pdfPath || "");
    if (!fs.existsSync(pdfFullPath)) {
      console.warn(`⚠️  PDF non trouvé: ${pdfFullPath}`);
      continue;
    }

    console.log(`   📄 Extraction du PDF...`);
    const pdfText = await extractTextFromPDF(pdfFullPath);
    if (!pdfText) {
      console.warn(`⚠️  Texte vide pour ${pdfFullPath}`);
      continue;
    }

    // Découper en chunks
    const chunks = chunkText(pdfText);
    console.log(`   📦 ${chunks.length} chunks extraits`);

    // Créer les leçons pour ce sous-thème
    const lessonNames = [
      `Fondamentaux - ${st.title}`,
      `Approfondissement - ${st.title}`,
      `Maîtrise - ${st.title}`,
    ];

    const createdLessons = [];
    for (let l = 0; l < LESSONS_PER_SOUS_THEME; l++) {
      const [lesson] = await db
        .insert(schema.lessons)
        .values({
          title: lessonNames[l],
          sousThemeId: st.id,
          order: l + 1,
        })
        .returning();
      createdLessons.push(lesson);
    }

    // Générer les questions par lots
    const questionsPerChunk = Math.ceil(QUESTIONS_PER_SOUS_THEME / chunks.length);
    let questionsForThisTheme: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
      sourceChunk: string;
      difficulty: number;
    }> = [];

    for (let i = 0; i < chunks.length && questionsForThisTheme.length < QUESTIONS_PER_SOUS_THEME; i++) {
      const remaining = QUESTIONS_PER_SOUS_THEME - questionsForThisTheme.length;
      const count = Math.min(questionsPerChunk, remaining);
      
      console.log(`   🔄 Génération lot ${i + 1}/${chunks.length} (${count} questions)...`);
      const generated = await generateQuestionsForChunk(
        chunks[i],
        st.title,
        theme.title,
        count
      );
      
      questionsForThisTheme.push(...generated);
      console.log(`   ✅ ${generated.length} questions générées`);
      
      // Pause pour éviter de rate-limiter DeepSeek
      if (i < chunks.length - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    // Limiter au nombre demandé
    questionsForThisTheme = questionsForThisTheme.slice(0, QUESTIONS_PER_SOUS_THEME);

    // Répartir les questions entre les leçons
    const questionsPerLesson = Math.ceil(questionsForThisTheme.length / LESSONS_PER_SOUS_THEME);

    // Insérer en base
    console.log(`   💾 Sauvegarde de ${questionsForThisTheme.length} questions...`);
    for (let i = 0; i < questionsForThisTheme.length; i++) {
      const q = questionsForThisTheme[i];
      const lessonIndex = Math.min(Math.floor(i / questionsPerLesson), LESSONS_PER_SOUS_THEME - 1);
      
      const [challenge] = await db
        .insert(schema.challenges)
        .values({
          lessonId: createdLessons[lessonIndex].id,
          question: q.question,
          order: (i % questionsPerLesson) + 1,
          explanation: q.explanation,
          sourceChunk: q.sourceChunk,
          difficulty: q.difficulty || 2,
        })
        .returning();

      // Insérer les options
      for (let j = 0; j < q.options.length; j++) {
        await db.insert(schema.challengeOptions).values({
          challengeId: challenge.id,
          text: q.options[j],
          correct: j === q.correctAnswer,
        });
      }
    }

    totalGenerated += questionsForThisTheme.length;
    console.log(`   ✅ ${questionsForThisTheme.length} questions sauvegardées pour "${st.title}"`);
  }

  console.log(`\n🎉 GÉNÉRATION TERMINÉE !`);
  console.log(`📊 Total : ${totalGenerated} nouvelles questions générées et sauvegardées`);
}

void main();
