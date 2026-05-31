# 🎯 Quiz Attaché Territorial — Documentation du Projet

## 📋 Présentation

Application web de QCM pour la préparation au concours d'**Attaché Territorial**.
Deux matières : **Environnement Territorial** (5 sous-thèmes) et **Urbanisme** (12 sous-thèmes),
soit ~760 questions générées par IA (**Claude Opus**) à partir des documents officiels PDF,
avec ancrage strict sur le texte source (qualité concours).

**Application mono-utilisatrice** : aucun module social ou compétitif
(ligues, classements, défis entre joueurs).

## 🏗️ Stack Technique

| Technologie | Usage |
|-------------|-------|
| **Next.js 16** (App Router, Turbopack) | Framework full-stack — React 19, TypeScript |
| **Neon PostgreSQL** (`@neondatabase/serverless`) | Base de données serverless |
| **Drizzle ORM** | Schéma TypeScript = source de vérité, requêtes typées |
| **Supabase Auth** (`@supabase/ssr`) | Authentification (sessions, OAuth) + fallback invité par cookie |
| **Claude Opus** (Anthropic) | Génération des questions QCM (offline, ancrage source) |
| **Tailwind CSS** | Design system maison corail / cream / ink |
| **Framer Motion** | Animations |
| **Zustand** | État UI local |
| **react-pdf** | Lecteur de PDF (bibliothèque) |

## 📁 Structure du Projet

```
/
├── app/
│   ├── (auth)/            # sign-in, sign-up (Supabase)
│   ├── (main)/            # courses, learn, library, progression (app connectée)
│   ├── (marketing)/       # landing + pages /presentation (ce rapport, version web)
│   ├── lesson/            # lecteur de quiz (page.tsx → quiz-player.tsx)
│   ├── api/               # routes : chapter, glossary, guest, questions, rag, section
│   └── auth/callback/     # callback OAuth Supabase
├── db/
│   ├── drizzle.ts         # connexion Neon (DATABASE_URL)
│   ├── schema.ts          # schéma Drizzle (tables + relations + enums)
│   └── queries.ts         # toutes les requêtes (cache React)
├── actions/               # Server Actions (answers, self-mastery, user-progress)
├── lib/                   # auth, rag, mastery, glossary-terms, supabase-server, utils
├── components/            # composants UI partagés + ui/ (primitives) + library/ + modals/
├── middleware.ts          # rafraîchissement de session Supabase
├── drizzle/               # migrations SQL + meta/_journal.json
├── scripts/               # seed (tsx) + génération de questions (Opus, Python)
├── data/generated_*.json  # questions générées, prêtes à seeder
└── Source RAG/            # PDFs officiels + Code de l'urbanisme intégral
```

## 🏛️ Architecture

- **Server Components** par défaut + **Server Actions** pour les mutations.
- Auth côté serveur via `lib/auth.ts` → `auth()` renvoie le userId Supabase, sinon
  l'invité (cookie `guest_id`), sinon `null`. **Le userId ne vient jamais du client.**
- `middleware.ts` rafraîchit le token de session Supabase à chaque requête.
- Modèle de données inspiré de Duolingo :
  `themes` (matières) → `sous_themes` (= PDF) → `lessons` → `challenges` (questions) → `challenge_options`.

## 🗄️ Schéma de Base de Données (Neon Postgres)

14 tables organisées en deux domaines + le RAG urbanisme.

### Contenu pédagogique
1. **themes** — Les matières (Environnement Territorial, Urbanisme)
2. **sous_themes** — Les sous-thèmes (liés aux PDFs sources)
3. **lessons** — Groupes de questions
4. **sections** — Sections de cours (contenu de la bibliothèque)
5. **challenges** — Les questions QCM (avec source citée)
6. **challenge_options** — Les options par question

### Progression utilisateur
7. **user_progress** — Points, thème actif
8. **user_sous_theme_progress** — Avancement + maîtrise auto-déclarée par sous-thème
9. **challenge_progress** — Questions complétées
10. **quiz_sessions** — Sessions de quiz
11. **user_answers** — Chaque réponse individuelle (base du mode révision)
12. **profiles** — Profils utilisateurs

### RAG urbanisme
13. **legal_chunks** — Articles du Code de l'urbanisme (recherche plein-texte BM25)
14. **section_legal_refs** — Mapping section de cours → articles pertinents

### Statuts de progression
- `not_started` — Sous-thème non commencé
- `in_progress` — Quiz démarré, non terminé
- `needs_review` — Score insuffisant
- `mastered` — Maîtrisé

### Maîtrise auto-déclarée (lecteur)
- `a_revoir` · `en_cours` · `maitrise` — déclaration manuelle par l'utilisateur.

## 🎮 Modes de Quiz

Pilotés par les query params de `/lesson` :

- **Libre** — pool mélangé de sous-thèmes (`?sousThemeIds=`)
- **Leçon** — une leçon précise (`?lessonId=` / `?sousThemeId=`)
- **Révision** — rejoue en priorité les questions ratées (`?mode=revision`),
  d'après la **dernière** réponse par question dans `user_answers`.

> Le système de « cœurs » (mode Challenge Duolingo) a été retiré : les quiz sont unifiés,
> sans vies ni game over.

## 🧠 RAG — Deux usages

1. **Génération offline des questions** : chaque PDF officiel → Claude Opus →
   `data/generated_*.json` → seed en base. **Aucun appel LLM en production** :
   les questions sont servies depuis Neon. Chaque question conserve son extrait source.
2. **Recherche juridique live (bibliothèque)** : recherche plein-texte **BM25** sur
   `legal_chunks` (Code de l'urbanisme) via `/api/rag/search`, `/api/rag/ask`,
   `/api/rag/article`. La réponse est construite à partir des extraits locaux —
   **toujours sans appel LLM en production**.

## 📚 Fonctionnalités

- ✅ ~760 questions QCM niveau concours, ancrées dans les PDF officiels (Claude Opus)
- ✅ 3 modes de quiz : libre / leçon / révision
- ✅ Progression visuelle par matière et sous-thème (tableau de bord `/progression`)
- ✅ **Bibliothèque** : cours par section, lecteur PDF, articles-clés du Code de l'urbanisme,
  glossaire de notions juridiques cliquables
- ✅ **RAG urbanisme** : recherche plein-texte dans le Code de l'urbanisme
- ✅ Auto-évaluation de maîtrise par sous-thème (à revoir / en cours / maîtrisé)
- ✅ Sauvegarde automatique des réponses, reprise de session
- ✅ Authentification Supabase + mode invité (cookie)
- ✅ Design system maison (corail / cream / ink)

## 🚀 Commandes

```bash
# Développement
npm run dev            # serveur de dev (http://localhost:3000)
npm run build          # build de production
npm run lint           # ESLint
npm run format:fix     # Prettier (écriture)

# Base de données
npm run db:studio      # Drizzle Studio (exploration)
npm run db:push        # pousser le schéma vers Neon (⚠️ destructif — revue d'abord)
npm run db:generate    # générer une migration SQL
npm run db:migrate     # appliquer les migrations

# Seed
npm run seed:themes              # seed des thèmes
npx tsx scripts/seed-opus.ts --all   # seed des questions générées
```

> ⚠️ `db:push` diffe le schéma TypeScript contre la base live et peut supprimer des
> colonnes/tables. Toujours revoir le plan (et sauvegarder) avant de confirmer.

## 🔧 Configuration Requise

1. **Neon** : base PostgreSQL → `DATABASE_URL`
2. **Supabase** : projet → `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Anthropic** : clé API pour la génération des questions (offline uniquement)
