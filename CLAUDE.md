# Quiz Attaché Territorial

App de révision pour le concours d'Attaché Territorial. **Application mono-utilisatrice** :
exclure tout module social ou compétitif (ligues, classements, défis entre joueurs).

## Stack technique
- **Next.js 16** (App Router, Turbopack) — React 19, TypeScript
- **Drizzle ORM** + **Neon Postgres** (serverless, `@neondatabase/serverless`)
- **Supabase** pour l'authentification (`@supabase/ssr`) + fallback invité par cookie
- **Tailwind CSS** — design system maison corail (`#E85C51`) / cream (`#FBF1E7`) / ink (`#1F1D1B`)
- Framer Motion, Zustand (état UI local)

## Structure du projet
```
/
├── app/
│   ├── (auth)/            # sign-in, sign-up (Supabase)
│   ├── (main)/            # courses, dashboard, learn, library (app connectée)
│   ├── (marketing)/       # landing + pages présentation
│   ├── lesson/            # lecteur de quiz (page.tsx → quiz-player.tsx)
│   ├── api/               # routes : chapter, glossary, guest, questions, rag, section
│   └── auth/callback/     # callback OAuth Supabase
├── db/
│   ├── drizzle.ts         # connexion Neon (DATABASE_URL)
│   ├── schema.ts          # schéma Drizzle (tables + relations + enums)
│   └── queries.ts         # toutes les requêtes (cache React)
├── actions/               # Server Actions (answers, self-mastery, user-progress, ...)
├── lib/                   # auth, rag, mastery, supabase-server, utils
├── components/            # composants UI partagés + ui/ (primitives)
├── drizzle/               # migrations SQL + meta/_journal.json
├── scripts/               # seed (tsx) + génération de questions (Opus, Python)
└── data/generated_*.json  # questions générées, prêtes à seeder
```

## Architecture
- **Server Components** par défaut + **Server Actions** pour les mutations
- Auth côté serveur via `lib/auth.ts` → `auth()` renvoie le userId Supabase, sinon l'invité (cookie `guest_id`), sinon `null`. **Le userId ne vient jamais du client.**
- Modèle de données inspiré de Duolingo : `themes` (matières) → `sous_themes` (= PDF) → `lessons` → `challenges` (questions) → `challenge_options`
- **Modes de quiz** (via `/lesson` query params) :
  - **libre** : pool mélangé de sous-thèmes (`?sousThemeIds=`)
  - **leçon** : une leçon précise (`?lessonId=` / `?sousThemeId=`)
  - **révision** : rejoue en priorité les questions ratées (`?mode=revision`)
- Réponses persistées dans `user_answers` via l'action `recordAnswer`. La révision se base
  sur la **dernière** réponse par question (incorrecte = à retravailler).

## Base de données (Neon Postgres)
Tables principales : `themes`, `sous_themes`, `lessons`, `sections`, `challenges`,
`challenge_options`, `user_answers`, `user_progress`, `user_sous_theme_progress`,
`quiz_sessions`, `challenge_progress`, `legal_chunks`, `section_legal_refs`, `profiles`.

RAG urbanisme : `legal_chunks` (articles du Code de l'urbanisme, recherche plein-texte BM25)
et `section_legal_refs` (mapping section de cours → articles pertinents).

## Génération des questions
Questions générées par **Opus** à partir des PDF de cours (`Source RAG/`), avec ancrage
strict sur le texte source (qualité concours). Sortie → `data/generated_*.json` → seed en base.

## Commandes utiles
```bash
npm run dev            # serveur de dev (http://localhost:3000)
npm run build          # build de production
npm run lint           # ESLint
npm run format:fix     # Prettier (écriture)

npm run db:studio      # Drizzle Studio (exploration de la base)
npm run db:push        # pousser le schéma vers Neon (⚠️ destructif — revue d'abord)
npm run db:generate    # générer une migration SQL depuis le schéma
npm run db:migrate     # appliquer les migrations

npm run seed:themes              # seed des thèmes
npx tsx scripts/seed-opus.ts --all   # seed des questions générées
```

> ⚠️ `db:push` diffe le schéma TypeScript contre la base live et peut supprimer des
> colonnes/tables. Toujours revoir le plan (et sauvegarder) avant de confirmer.
