import { getActiveSession } from "@/db/queries";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, inArray } from "drizzle-orm";
import * as schema from "@/db/schema";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

export default async function ResumePage() {
  const userId = "user_demo"; // TODO: remplacer par auth()
  const session = await getActiveSession(userId);

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mb-4 text-6xl">📭</div>
        <h2 className="text-xl font-bold text-slate-800">
          Aucune session en cours
        </h2>
        <p className="mt-2 text-slate-500">
          Tu n&apos;as pas de quiz interrompu. Lance un nouveau quiz !
        </p>
        <Link href="/learn">
          <Button className="mt-6 bg-emerald-500 hover:bg-emerald-600">
            Retour à l&apos;apprentissage
          </Button>
        </Link>
      </div>
    );
  }

  // Récupérer le sous-thème
  const [sousTheme] = await db
    .select()
    .from(schema.sousThemes)
    .where(eq(schema.sousThemes.id, session.sousThemeId))
    .limit(1);

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="mb-4 text-6xl">📌</div>
      <h2 className="text-xl font-bold text-slate-800">
        Session en cours
      </h2>
      <p className="mt-2 text-slate-500">
        Tu étais en train de réviser{" "}
        <strong>{sousTheme?.title || "un sous-thème"}</strong>.
      </p>
      <p className="mt-1 text-sm text-slate-400">
        Question {(session.currentQuestionIndex || 0) + 1} / {session.totalQuestions}
      </p>

      <Link href={`/lesson?sousThemeId=${session.sousThemeId}&mode=${session.mode}&resume=${session.id}`}>
        <Button className="mt-6 bg-emerald-500 hover:bg-emerald-600">
          Reprendre
        </Button>
      </Link>
    </div>
  );
}
