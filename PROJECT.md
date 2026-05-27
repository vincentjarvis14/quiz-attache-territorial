# 🎯 Quiz Attaché Territorial — Documentation du Projet

## 📋 Présentation

Application de QCM pour la préparation au concours d'Attaché Territorial.
Deux matières : **Environnement Territorial** (5 sous-thèmes) et **Urbanisme** (13 sous-thèmes).
400+ questions générées par IA (DeepSeek) à partir des documents officiels PDF.

## 🏗️ Stack Technique

| Technologie | Usage |
|-------------|-------|
| **Next.js 16** | Framework frontend + backend |
| **Supabase** | Authentification + Base de données PostgreSQL |
| **Drizzle ORM** | Gestion de la base de données |
| **DeepSeek API** | Génération des questions QCM |
| **Tailwind CSS** | Styles |
| **shadcn/ui** | Composants UI |
| **Zustand** | State management |
| **BMAD** | Framework agentique pour le développement |

## 📁 Structure du Projet

```
/
├── app/
│   ├── (marketing)/page.tsx    # Page d'accueil
│   ├── (main)/learn/           # Dashboard étudiant
│   │   ├── page.tsx            # Vue d'ensemble des thèmes
│   │   ├── [sousThemeId]/      # Détail d'un sous-thème
│   │   └── resume/             # Reprise de session
│   ├── lesson/page.tsx         # Quiz (cœur du jeu)
│   ├── api/
│   │   ├── questions/          # API récupération questions
│   │   ├── sessions/           # API gestion sessions
│   │   └── answers/            # API sauvegarde réponses
│   └── (auth)/                 # Pages connexion/inscription
├── db/
│   ├── schema.ts               # Schéma Drizzle (tables)
│   ├── queries.ts              # Requêtes DB
│   └── drizzle.ts              # Client Drizzle
├── lib/
│   ├── supabase.ts             # Client Supabase
│   └── auth.ts                 # Fonctions d'authentification
├── scripts/
│   ├── seed-themes.ts          # Seed des thèmes et sous-thèmes
│   └── generate-questions.ts   # Génération des 400+ questions
├── components/                 # Composants UI (shadcn)
├── Source RAG/                 # Documents PDF sources
│   ├── environnement-territorial/  # 5 PDFs
│   └── urbanisme/                  # 13 PDFs
└── .cline/skills/              # BMAD skills
```

## 🗄️ Schéma de Base de Données

### Tables principales

1. **themes** — Les 2 matières (Environnement Territorial, Urbanisme)
2. **sous_themes** — Les 18 sous-thèmes (liés aux PDFs)
3. **questions** — Les 400+ questions QCM générées
4. **quiz_sessions** — Sessions de quiz (avec sauvegarde de progression)
5. **user_answers** — Chaque réponse individuelle
6. **user_sous_theme_progress** — Progression par sous-thème
7. **profiles** — Profils utilisateurs

### Codes couleur de progression

- 🟢 **Mastered** : ≥10 réponses, ≥80% de bonnes réponses
- 🟡 **In Progress** : Commencé, entre 40% et 80%
- 🔴 **Needs Review** : <40% de bonnes réponses
- ⚪ **Not Started** : Pas encore commencé

## 🎮 Modes de Jeu

### Mode Libre
- Pas de limite de vies
- Idéal pour apprendre à son rythme
- Questions aléatoires

### Mode Challenge
- 5 cœurs (vies)
- 10 questions
- Perdu si les 5 cœurs sont épuisés
- Pour se tester en conditions réelles

## 🚀 Commandes

```bash
# Développement
npm run dev

# Base de données
npm run db:push    # Appliquer les migrations
npm run db:studio  # Interface Drizzle Studio

# Seed des thèmes
npm run seed:themes

# Génération des questions (400+)
npm run seed:questions

# Build
npm run build
```

## 🔧 Configuration Requise

1. **Supabase** : Créer un projet, récupérer URL + Anon Key
2. **Neon** : Créer une base PostgreSQL, récupérer DATABASE_URL
3. **DeepSeek** : Clé API déjà configurée

## 📊 Fonctionnalités Clés

- ✅ 400+ questions QCM niveau concours
- ✅ Génération par IA avec sources PDF
- ✅ 2 modes de jeu (Libre / Challenge)
- ✅ Progression visuelle (🟢🟡🔴⚪)
- ✅ Sauvegarde automatique des réponses
- ✅ Reprise de session interrompue
- ✅ Détection des points faibles
- ✅ Affichage des sources PDF
- ✅ Assistant IA (chat RAG)
- ✅ Design Duolingo-like
