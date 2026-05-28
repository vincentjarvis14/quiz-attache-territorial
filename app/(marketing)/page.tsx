import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, FileText, BarChart3, Target, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "./header";
import { Footer } from "./footer";
import { GuestButton } from "./guest-button";

const STATS = [
  { value: "400+", label: "Questions QCM" },
  { value: "18", label: "Documents officiels" },
  { value: "2", label: "Matières au programme" },
  { value: "100%", label: "Sources référencées" },
] as const;

const MATIERES = [
  {
    emoji: "🏛️",
    title: "Environnement Territorial",
    badge: "5 sous-thèmes",
    topics: [
      "Organisation de l'État",
      "Grandes étapes de la décentralisation",
      "Collectivités territoriales",
      "Organisation juridictionnelle",
      "Principes constitutionnels",
    ],
  },
  {
    emoji: "🏗️",
    title: "Urbanisme",
    badge: "13 sous-thèmes",
    topics: [
      "Plan Local d'Urbanisme (PLU)",
      "Schéma de Cohérence Territoriale",
      "Permis de construire",
      "Loi Littoral & Loi Montagne",
      "Contentieux de l'urbanisme",
    ],
  },
] as const;

const STEPS = [
  {
    number: "01",
    title: "Choisissez une matière",
    description:
      "Sélectionnez votre matière et le sous-thème à travailler selon vos points faibles.",
  },
  {
    number: "02",
    title: "Répondez aux QCM",
    description:
      "Questions de niveau expert — pièges, nuances, exceptions, jurisprudences. Conçues pour le niveau concours.",
  },
  {
    number: "03",
    title: "Consultez la source",
    description:
      "Chaque réponse renvoie vers l'extrait exact du document officiel pour ancrer la connaissance.",
  },
] as const;

const FEATURES = [
  {
    Icon: Target,
    title: "Questions d'expert",
    description:
      "Générées par IA à partir des textes officiels. Niveau Master 2 — pièges, nuances et exceptions inclus.",
  },
  {
    Icon: FileText,
    title: "Sources PDF incluses",
    description:
      "Chaque question est liée à l'extrait du document officiel. Apprenez dans le contexte réel du concours.",
  },
  {
    Icon: BarChart3,
    title: "Suivi de progression",
    description:
      "Progression suivie par sous-thème. Identifiez vos points faibles et ciblez vos révisions.",
  },
  {
    Icon: ShieldCheck,
    title: "Mode challenge",
    description:
      "5 cœurs disponibles. Chaque erreur coûte un cœur — la pression d'un vrai examen.",
  },
] as const;

export default function MarketingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="border-b border-slate-100 px-6 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-medium text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
              Concours Attaché Territorial · Session 2026
            </div>

            <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl md:leading-[1.15]">
              Préparez le concours
              <br />
              <span className="text-blue-900">avec les bons outils.</span>
            </h1>

            <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-slate-500 md:text-lg">
              400+ QCM d'expert générées à partir des textes officiels.
              <br className="hidden md:block" />
              Sources PDF référencées pour chaque réponse.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/sign-up">
                <Button variant="primary" size="lg" className="min-w-[220px]">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="primaryOutline" size="lg" className="min-w-[180px]">
                  J'ai déjà un compte
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Ou commencez directement —{" "}
              <span className="text-slate-500">aucune inscription requise</span>
            </p>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="border-b border-slate-100 bg-slate-50 px-6 py-10">
          <div className="mx-auto max-w-3xl">
            <dl className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <dt className="text-3xl font-bold tracking-tight text-slate-900">
                    {stat.value}
                  </dt>
                  <dd className="mt-1 text-xs text-slate-500">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Matières ── */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
              Programme
            </p>
            <h2 className="mb-10 text-center text-2xl font-bold text-slate-900">
              2 matières couvertes intégralement
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {MATIERES.map((matiere) => (
                <div
                  key={matiere.title}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <span className="text-2xl">{matiere.emoji}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {matiere.badge}
                    </span>
                  </div>
                  <h3 className="mb-4 text-base font-semibold text-slate-900">
                    {matiere.title}
                  </h3>
                  <ul className="space-y-2">
                    {matiere.topics.map((topic) => (
                      <li key={topic} className="flex items-center gap-2 text-sm text-slate-500">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-blue-900" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Comment ça marche ── */}
        <section className="border-y border-slate-100 bg-slate-50 px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
              Méthode
            </p>
            <h2 className="mb-10 text-center text-2xl font-bold text-slate-900">
              Simple. Exigeant. Efficace.
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.number}>
                  <span className="mb-3 block text-4xl font-black text-slate-200">
                    {step.number}
                  </span>
                  <h3 className="mb-2 text-sm font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-500">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Fonctionnalités ── */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
              Fonctionnalités
            </p>
            <h2 className="mb-10 text-center text-2xl font-bold text-slate-900">
              Conçu pour les candidats sérieux
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {FEATURES.map(({ Icon, title, description }) => (
                <div
                  key={title}
                  className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <Icon className="h-4 w-4 text-blue-900" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-slate-900">
                      {title}
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-500">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA final ── */}
        <section className="bg-slate-900 px-6 py-16">
          <div className="mx-auto max-w-lg text-center">
            <BookOpen className="mx-auto mb-4 h-8 w-8 text-slate-500" />
            <h2 className="mb-2 text-2xl font-bold text-white">
              Commencez maintenant.
            </h2>
            <p className="mb-8 text-sm text-slate-400">
              Gratuit. Aucune carte de crédit requise.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/sign-up">
                <Button
                  variant="primary"
                  size="lg"
                  className="min-w-[220px] bg-white text-slate-900 hover:bg-slate-100 shadow-none"
                >
                  Créer un compte gratuit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <GuestButton />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
