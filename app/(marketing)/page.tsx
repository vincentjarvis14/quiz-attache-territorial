import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GuestButton } from "./guest-button";
import { GraduationCap, Sparkles, Target, Brain, ArrowRight } from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-50 via-white to-emerald-50/30 px-4">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
        {/* Logo / Titre */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-500 shadow-xl shadow-purple-200">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold md:text-5xl">
            <span className="bg-gradient-to-r from-purple-700 to-emerald-600 bg-clip-text text-transparent">
              Quiz Attaché Territorial
            </span>
          </h1>
        </div>

        {/* Sous-titre */}
        <p className="max-w-2xl text-lg text-slate-600 md:text-xl">
          Préparez efficacement le concours d'Attaché Territorial avec des QCM
          experts générés par IA à partir des documents officiels.
        </p>

        {/* Thèmes */}
        <div className="grid w-full max-w-3xl gap-4 md:grid-cols-2">
          <div className="group rounded-2xl border-2 border-purple-200/60 bg-gradient-to-br from-white to-purple-50/40 p-6 shadow-sm transition-all hover:border-purple-300 hover:shadow-md">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-md shadow-purple-200">
              <span className="text-xl">🏛️</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800">
              Environnement Territorial
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              5 sous-thèmes : organisation de l'État, décentralisation,
              collectivités territoriales
            </p>
          </div>

          <div className="group rounded-2xl border-2 border-emerald-200/60 bg-gradient-to-br from-white to-emerald-50/40 p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-200">
              <span className="text-xl">🏗️</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Urbanisme</h3>
            <p className="mt-1 text-sm text-slate-500">
              13 sous-thèmes : PLU, permis de construire, SCoT, droit de
              l'urbanisme
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/sign-up">
            <Button
              size="lg"
              variant="primary"
              className="min-w-[200px] text-lg"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button
              size="lg"
              variant="primaryOutline"
              className="min-w-[200px] text-lg"
            >
              J'ai déjà un compte
            </Button>
          </Link>
          <GuestButton />
        </div>

        {/* Features */}
        <div className="mt-8 grid gap-6 text-left md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <h4 className="font-semibold text-slate-800">400+ Questions</h4>
            <p className="mt-1 text-sm text-slate-500">
              Générées à partir des documents officiels du concours
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <Brain className="h-5 w-5 text-emerald-600" />
            </div>
            <h4 className="font-semibold text-slate-800">Suivi personnalisé</h4>
            <p className="mt-1 text-sm text-slate-500">
              Visualisez votre progression et vos points faibles
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <Sparkles className="h-5 w-5 text-amber-600" />
            </div>
            <h4 className="font-semibold text-slate-800">Assistant IA</h4>
            <p className="mt-1 text-sm text-slate-500">
              Posez vos questions et obtenez des explications détaillées
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
