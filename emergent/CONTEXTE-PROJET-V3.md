# 🎯 Contexte Projet — Quiz Attaché Territorial V3

> Document à destination d'emergent.SH pour générer la V3.
> **Zéro contrainte de design** — le style est entièrement libre.

---

## 1. Problème & Cible

**Problème :** Les candidats au concours d'Attaché Territorial (fonction publique) doivent maîtriser des matières juridiques denses (Environnement Territorial, Urbanisme) avec des documents officiels complexes. Les solutions existantes (papier, QCM génériques) ne permettent pas un apprentissage adaptatif et ludique.

**Cible :** Juristes confirmés préparant le concours d'Attaché Territorial (niveau Master 2). Pas des débutants.

---

## 2. Contenu Pédagogique

**2 matières :**
1. **Environnement Territorial** — 5 sous-thèmes
2. **Urbanisme** — 13 sous-thèmes

**Sources :** 18 PDFs officiels (disponibles dans `Source RAG/`) — chaque sous-thème a son PDF source.

**Questions :** ~400+ QCM générées par DeepSeek API à partir des PDFs, niveau expert (pièges, nuances, exceptions, jurisprudences).

---

## 3. Stack Technique

| Technologie | Usage |
|---|---|
| **Next.js 16** (App Router) | Framework |
| **Supabase** | Authentification |
| **Neon** (PostgreSQL) | Base de données |
| **Drizzle ORM** | Couche DB |
| **DeepSeek API** | Génération questions |
| **Zustand** | State management |
| **Framer Motion** | Animations (déjà installé) |

---

## 4. Schéma de Base de Données

### Table `themes` (matières)
- `id` serial PK
- `title` text — ex: "Environnement Territorial"
- `description` text
- `image_src` text (url)
- `order` integer
- `matiere` enum: `environnement_territorial | urbanisme`

### Table `sous_themes` (sous-thèmes = PDFs)
- `id` serial PK
- `title` text — ex: "Grands principes de l'organisation de l'État"
- `description` text
- `theme_id` FK → themes
- `order` integer
- `pdf_file_name` text — ex: "01-grands-principes-organisation-etat.pdf"
- `pdf_path` text (nullable)

### Table `lessons` (groupes de questions)
- `id` serial PK
- `title` text — ex: "Fondamentaux - Grands principes..."
- `sous_theme_id` FK → sous_themes
- `order` integer

### Table `challenges` (questions QCM)
- `id` serial PK
- `lesson_id` FK → lessons
- `type` enum: `SELECT`
- `question` text — la question QCM
- `order` integer
- `explanation` text — explication détaillée
- `source_chunk` text — extrait du PDF source
- `source_section` text (nullable) — section du PDF
- `difficulty` integer (1-3, défaut: 2)

### Table `challenge_options` (réponses possibles)
- `id` serial PK
- `challenge_id` FK → challenges
- `text` text — option de réponse
- `correct` boolean
- `image_src` text (nullable)
- `audio_src` text (nullable)

### Table `challenge_progress` (progression par question)
- `id` serial PK
- `user_id` text
- `challenge_id` FK → challenges
- `completed` boolean

### Table `user_progress`
- `user_id` text PK
- `user_name` text
- `user_image_src` text
- `active_theme_id` FK → themes (nullable)
- `hearts` integer (défaut: 5)
- `points` integer (défaut: 0)

### Table `user_sous_theme_progress`
- `id` serial PK
- `user_id` text
- `sous_theme_id` FK → sous_themes
- `total_answered` integer
- `correct_count` integer
- `last_reviewed_at` timestamp (nullable)
- `status` enum: `not_started | in_progress | needs_review | mastered`

### Table `quiz_sessions`
- `id` serial PK
- `user_id` text
- `sous_theme_id` FK → sous_themes
- `mode` enum: `free | challenge`
- `hearts_remaining` integer (nullable — null en mode free)
- `total_questions` integer
- `correct_answers` integer
- `completed` boolean
- `current_question_index` integer
- `question_ids` jsonb (tableau d'IDs)
- `created_at` timestamp
- `updated_at` timestamp

### Table `user_answers`
- `id` serial PK
- `user_id` text
- `question_id` FK → challenges
- `session_id` FK → quiz_sessions (nullable)
- `selected_answer` integer (index)
- `correct` boolean
- `created_at` timestamp

### Table `profiles`
- `id` text PK (mapped from Supabase Auth)
- `email` text
- `nom` text (nullable)
- `prenom` text (nullable)
- `avatar_url` text (nullable)
- `created_at` timestamp

---

## 5. Règles Métier

### Progression par sous-thème
- **not_started** : pas commencé
- **in_progress** : commencé, entre 40% et 80%
- **needs_review** : <40% de bonnes réponses
- **mastered** : ≥10 réponses ET ≥80% correct

### Modes de jeu
- **Mode libre** : pas de limite de coeurs, idéal pour apprendre
- **Mode challenge** : 5 coeurs, 10 questions, perdu si 0 coeur

### Génération des questions
- DeepSeek API avec prompt expert (niveau concours)
- 23 questions par sous-thème → ~414 questions
- 3 leçons par sous-thème (Fondamentaux / Approfondissement / Maîtrise)
- Les questions sont réparties entre les leçons

---

## 6. Fonctions Backend Disponibles

### Queries (db/queries.ts)
- `getUserProgress()` → userProgress + activeTheme
- `getSousThemesWithProgress()` → sous-thèmes avec statuts (not_started/in_progress/needs_review/mastered)
- `getSousThemeStats(sousThemeId)` → stats d'un sous-thème
- `getThemes()` → tous les thèmes
- `getThemeById(themeId)` → thème avec sous-thèmes et leçons
- `getCourseProgress()` → première leçon non complétée
- `getLesson(id?)` → leçon avec challenges + options + progression
- `getLessonPercentage()` → % de progression de la leçon active
- `getTopTenUsers()` → classement top 10
- `getQuestionsForSousTheme(sousThemeId, limit)` → questions aléatoires
- `getWeaknessQuestions(userId, limit)` → questions des points faibles
- `createQuizSession(userId, sousThemeId, mode, questionIds)` → nouvelle session
- `getActiveSession(userId)` → session en cours
- `updateQuizSession(sessionId, data)` → update session
- `saveUserAnswer(userId, questionId, selectedAnswer, correct, sessionId?)` → sauvegarde réponse + update progression

### Actions (Server Actions)
- `actions/user-progress.ts` : gestion points et coeurs
- `actions/challenge-progress.ts` : marquer question complétée

### API Routes
- `POST /api/guest` : créer un compte invité
- `GET /api/questions?sousThemeId=X&limit=N` : récupérer questions
- `POST /api/sessions` : créer session quiz
- `POST /api/answers` : sauvegarder réponse

### Auth
- `lib/auth.ts` → `auth()` retourne userId ou null
- `lib/supabase.ts` → client Supabase configuré
- Pages auth : `app/(auth)/sign-in/` et `app/(auth)/sign-up/`

---

## 7. CE QUI NE DOIT PAS ÊTRE TOUCHÉ

```
db/              → Schéma, queries, client Drizzle
lib/auth.ts      → Auth Supabase
lib/supabase.ts  → Client Supabase
scripts/         → Seed et génération questions
Source RAG/      → PDFs sources
store/           → Stores Zustand (exit-modal, hearts-modal, practice-modal)
actions/         → Server actions
```

## 8. CE QUI PEUT ÊTRE RECRÉÉ LIBREMENT

```
app/             → Pages (sauf (auth)/)
components/      → Composants UI
hooks/           → Custom hooks
public/          → Assets
tailwind.config.ts → Styles
globals.css      → Styles globaux
```

---

## 9. Alias d'import Disponibles

```ts
import { ... } from "@/..."        // → ./"
import { ... } from "@emergent/..." // → ./emergent/"
```

---

## 10. Pages à Créer (libre inspiration)

- **Page d'accueil** (/) — présentation de l'app
- **Choix du thème** (/courses) — sélectionner Environnement Territorial ou Urbanisme
- **Dashboard apprentissage** (/learn) — grille des sous-thèmes avec progression
- **Détail sous-thème** (/learn/[sousThemeId]) — leçons d'un sous-thème
- **Quiz** (/lesson) — écran de jeu QCM
- **Résultats** — écran de fin de quiz avec score
- **Classement** — top utilisateurs
- **Profil** — paramètres utilisateur
