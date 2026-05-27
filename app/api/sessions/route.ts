import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";
import { createQuizSession, getActiveSession } from "@/db/queries";

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sousThemeId, mode, questionIds } = body;

    // TODO: Récupérer le vrai userId depuis Supabase Auth
    const userId = "user_demo";

    const session = await createQuizSession(
      userId,
      sousThemeId,
      mode,
      questionIds
    );

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Erreur création session:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const userId = "user_demo";
    const session = await getActiveSession(userId);
    return NextResponse.json({ session });
  } catch (error) {
    console.error("Erreur récupération session:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
