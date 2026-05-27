import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, sql, and } from "drizzle-orm";
import * as schema from "@/db/schema";

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sousThemeId = searchParams.get("sousThemeId");
  const lessonId = searchParams.get("lessonId");
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    let query = db
      .select()
      .from(schema.challenges)
      .innerJoin(schema.lessons, eq(schema.challenges.lessonId, schema.lessons.id))
      .innerJoin(schema.challengeOptions, eq(schema.challenges.id, schema.challengeOptions.challengeId))
      .orderBy(sql`RANDOM()`)
      .limit(limit);

    if (sousThemeId) {
      query = query.where(eq(schema.lessons.sousThemeId, parseInt(sousThemeId))) as any;
    }
    if (lessonId) {
      query = query.where(eq(schema.challenges.lessonId, parseInt(lessonId))) as any;
    }

    const results = await query;

    // Grouper les options par challenge
    const challengeMap = new Map();
    for (const row of results as any[]) {
      const challenge = row.challenges;
      const option = row.challenge_options;
      if (!challengeMap.has(challenge.id)) {
        challengeMap.set(challenge.id, {
          ...challenge,
          options: [],
        });
      }
      if (option) {
        challengeMap.get(challenge.id).options.push(option);
      }
    }

    const challenges = Array.from(challengeMap.values());

    return NextResponse.json({ questions: challenges });
  } catch (error) {
    console.error("Erreur récupération questions:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
