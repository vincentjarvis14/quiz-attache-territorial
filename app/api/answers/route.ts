import { NextRequest, NextResponse } from "next/server";
import { saveUserAnswer } from "@/db/queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionId, selectedAnswer, correct, sessionId } = body;

    // TODO: Récupérer le vrai userId depuis Supabase Auth
    const userId = "user_demo";

    await saveUserAnswer(userId, questionId, selectedAnswer, correct, sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur sauvegarde réponse:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
