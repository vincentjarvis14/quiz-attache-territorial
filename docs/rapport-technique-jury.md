# Rapport technique — Quiz Attaché Territorial

> **Document de soutenance.** Présentation du projet et justification des choix techniques
> et d'architecture.
>
> **Auteur** : Vincent Balu — **Version** : 1.0 — **Soutenance** : 10 juin 2026
> **Dépôt** : application Next.js déployée sur Vercel · base Neon Postgres · auth Supabase

---

## Sommaire

1. [Résumé exécutif](#1-résumé-exécutif)
2. [Le projet : besoin et cas d'usage](#2-le-projet--besoin-et-cas-dusage)
3. [Architecture d'ensemble](#3-architecture-densemble)
4. [Stack technique, justifiée techno par techno](#4-stack-technique-justifiée-techno-par-techno)
5. [Modèle de données](#5-modèle-de-données)
6. [Compétence 2 — L'agent IA et le prompt engineering](#6-compétence-2--lagent-ia-et-le-prompt-engineering)
7. [Compétence 3 — Le RAG juridique](#7-compétence-3--le-rag-juridique)
8. [Compétence 4 — L'IA intégrée à l'application](#8-compétence-4--lia-intégrée-à-lapplication)
9. [Fonctionnalité phare : la répétition espacée](#9-fonctionnalité-phare--la-répétition-espacée)
10. [Sécurité](#10-sécurité)
11. [Compétence 5 — Tests et qualité](#11-compétence-5--tests-et-qualité)
12. [Compétence 5 — Coûts d'hébergement](#12-compétence-5--coûts-dhébergement)

---

## 1. Résumé exécutif

**Quiz Attaché Territorial** est une application web de révision active pour le concours
d'Attaché Territorial (catégorie A). Elle transforme des centaines de pages de cours (PDF) en
un entraînement par QCM **mesuré, priorisé et ancré sur le texte source**.

| | |
|---|---|
| **Problème résolu** | Réviser activement, mesurer ses acquis, retravailler ses points faibles en priorité |
| **Parti pris** | Application **mono-utilisatrice** — aucun module social ou compétitif |
| **Cœur technique** | ~760 QCM générés par IA (Claude Opus) avec ancrage strict + validation automatisée |
| **Différenciateur** | Répétition espacée (algorithme de Leitner) + RAG juridique sur le Code de l'urbanisme |
| **Stack** | Next.js 16 · React 19 · TypeScript · Drizzle ORM · Neon Postgres · Supabase Auth · Tailwind |
| **Coût d'exploitation** | **0 €/mois** (plans gratuits Vercel + Neon + Supabase) |

**Principe d'architecture directeur :** l'IA, coûteuse et faillible, est **confinée hors-ligne**
(elle fabrique le contenu en amont, une fois). La production ne sert que du contenu **validé et
figé** + une recherche déterministe → latence nulle, coût runtime nul, zéro hallucination servie.

---

## 2. Le projet : besoin et cas d'usage

### 2.1 Le besoin

Le concours repose sur un programme dense. L'enjeu n'est pas de *posséder* le cours mais de le
**maîtriser activement**. Les supports classiques (PDF, fiches) sont passifs : on relit sans
jamais mesurer ce qu'on a réellement acquis. L'application répond à ce manque.

### 2.2 Cas d'usage et priorisation (MoSCoW)

| Priorité | Cas d'usage | Implémentation |
|----------|-------------|----------------|
| **MUST** | Générer des QCM de qualité concours | Chaîne IA hors-ligne (§6) |
| **MUST** | S'entraîner (quiz libre / leçon ciblée) | `/lesson?sousThemeIds=` / `?lessonId=` |
| **MUST** | Réviser ses erreurs en priorité | Mode révision + SRS (§9) |
| **MUST** | Authentification + accès sans friction | Supabase + repli invité (§10) |
| **SHOULD** | Suivre sa progression | `/progression` (couverture + précision par chapitre) |
| **SHOULD** | Consulter le cours + lecteur PDF | `/library` |
| **COULD** | Rechercher dans le Code de l'urbanisme | RAG BM25 (§7) |
| **WON'T** | Social, classements, défis multijoueurs | **Exclus par décision de cadrage** |

> Le dossier de cadrage détaillé (analyse, conception, périmètre) fait l'objet d'un document
> dédié : [`docs/dossier-cadrage.md`](dossier-cadrage.md).

---

## 3. Architecture d'ensemble

```
   ●  CHAÎNE HORS-LIGNE (batch, exécutée une fois par le concepteur)
   ┌──────────────────────────────────────────────────────────────┐
   │  PDF de cours ──► extraction sections ──► Claude Opus          │
   │     (Source RAG/)        (Python)        (prompt d'ancrage)    │
   │                                              │                 │
   │                              validation auto (Python)          │
   │                                              │                 │
   │                                    data/generated_*.json       │
   │                                              │ seed (tsx)      │
   └──────────────────────────────────────────────┼────────────────┘
                                                   ▼
                                         ┌───────────────────┐
   ●  RUNTIME (utilisatrice)             │   Neon Postgres    │
   ┌─────────────────────────────────┐   │  (Drizzle ORM)     │
   │  Next.js 16 / Vercel            │◄──┤  - questions       │
   │  - Server Components (lecture)  │   │  - réponses / SRS  │
   │  - Server Actions (mutations)   │   │  - legal_chunks    │
   │  - quiz libre / leçon / révision│   └───────────────────┘
   │  - progression                  │            ▲
   │  - recherche RAG (BM25)─────────┼────────────┘
   └──────────────┬──────────────────┘
                  ▼
          Supabase Auth  (+ repli invité par cookie)
```

**Deux mondes séparés :** la chaîne hors-ligne (où vit l'IA) et le runtime (où vit l'utilisatrice).
C'est le choix structurant du projet, et il se défend point par point (voir §8).

---

## 4. Stack technique, justifiée techno par techno

Chaque choix répond à une contrainte du projet : **dev solo**, **coût nul**, **sécurité**, **type-safety de bout en bout**.

### 4.1 Socle applicatif

| Technologie | Rôle | Pourquoi CE choix pour CE projet |
|---|---|---|
| **Next.js 16** (App Router) | Framework full-stack React | Un seul outil du front au back ; **Server Components** = données proches de la base ; **Server Actions** = mutations sécurisées sans API séparée ; déploiement Vercel « zéro config » |
| **React 19** | Bibliothèque UI | Socle de Next ; Server Components natifs, Suspense |
| **TypeScript** | Typage statique | Détecte les erreurs au build ; documente le code ; indispensable en dev solo (le compilateur joue le rôle de relecteur) |
| **Tailwind CSS** | CSS utility-first | Styling rapide et cohérent ; design system maison (corail/cream/ink) ; dark mode via `next-themes` |

### 4.2 Données

| Technologie | Rôle | Pourquoi CE choix |
|---|---|---|
| **Neon Postgres** | Base relationnelle serverless | Postgres = modèle relationnel clair **+ recherche plein-texte native** (socle du RAG, §7) ; **scale-to-zero** → 0 € au repos |
| **Drizzle ORM** | ORM TypeScript type-safe | Requêtes SQL typées sans boilerplate ; schéma TS = source de vérité ; migrations versionnées |
| **@neondatabase/serverless** | Driver HTTP | Requêtes sans connexion TCP persistante → adapté au serverless/edge de Vercel |

### 4.3 Authentification

| Technologie | Rôle | Pourquoi CE choix |
|---|---|---|
| **Supabase Auth** (`@supabase/ssr`) | Authentification + sessions | Solution managée standard ; gestion des cookies côté serveur ; rafraîchissement de token automatique via middleware |
| **Repli invité** (cookie) | Accès sans compte | Réduit la friction d'entrée (cas d'usage MUST) |

### 4.4 UI et interactions

| Technologie | Rôle | Justification |
|---|---|---|
| **Radix UI** (primitives) | Composants accessibles headless (dialog, progress, scroll-area, accordion…) | Accessibilité WCAG « gratuite » + styling 100 % custom |
| **class-variance-authority + clsx + tailwind-merge** | Variantes de composants typées (`cn()`) | Composants UI paramétrables sans conflits de classes Tailwind |
| **Framer Motion** | Animations | Réservé aux pages de présentation (marketing) — pas dans l'app pour éviter le surcoût |
| **lucide-react** | Icônes SVG | Jeu d'icônes léger et cohérent |
| **react-pdf** | Lecteur PDF | Affiche les cours sources directement dans la bibliothèque |
| **sonner** | Notifications toast | Retour utilisateur non bloquant |
| **canvas-confetti** | Célébration de fin de quiz | Renforcement positif (ressort pédagogique Duolingo) |

### 4.5 Outillage de génération de contenu (hors-ligne)

| Technologie | Rôle |
|---|---|
| **Python** (`pdf-parse`/`pdftotext`, regex) | Extraction et découpage des PDF en sections |
| **Claude Opus** (Anthropic) | Génération des QCM ancrés (§6) |
| **tsx** | Exécution des scripts de seed TypeScript |

> **Honnêteté technique (dette identifiée) :** quelques dépendances présentes dans
> `package.json` ne sont plus utilisées (`zustand`, `react-confetti`, `react-use`,
> `react-circular-progressbar`, `openai` — vestige de tests). Elles sont **identifiées** et
> destinées au nettoyage. Les citer prouve la maîtrise de son propre code.

---

## 5. Modèle de données

Modèle **hiérarchique inspiré de Duolingo**, étendu par une couche de répétition espacée et une couche RAG juridique. Défini dans `db/schema.ts` (Drizzle), 13 tables, 5 énumérations Postgres.

### 5.1 Hiérarchie pédagogique

```
themes (matière)
  └─ sous_themes (= 1 PDF de cours)
       └─ lessons (≈ 8 questions)
            └─ challenges (la question)
                 └─ challenge_options (les 4 réponses)
```

### 5.2 Les trois couches de suivi utilisateur (séparation des responsabilités)

| Table | Rôle | Nature |
|---|---|---|
| `user_answers` | Journal brut de **chaque** réponse | Immuable (source de vérité) |
| `user_question_srs` | État de planification d'une question (boîte Leitner, prochaine échéance) | Upsert après chaque réponse |
| `user_sous_theme_progress` | Compteurs de couverture par chapitre | Pour l'affichage + le « decay » |

Cette séparation est un **choix de conception** : le journal ne ment jamais, l'état SRS se
recalcule, l'affichage se dérive — sans jamais réécrire l'historique.

### 5.3 Couche RAG juridique

| Table | Rôle |
|---|---|
| `legal_chunks` | Articles du Code de l'urbanisme, indexés en plein-texte français (GIN/tsvector) |
| `sections` | Sections de cours extraites des PDF |
| `section_legal_refs` | Pré-mapping section de cours → articles pertinents |

### 5.4 Stratégie de migration

Une **baseline unique** (`drizzle/0000_baseline_synced.sql`) resynchronisée sur la base live,
puis migrations additives et idempotentes (`IF NOT EXISTS`). Choix assumé pour un dev solo :
éviter les divergences schéma TS ↔ base.

---

## 6. Compétence 2 — L'agent IA et le prompt engineering

### 6.1 Le pipeline en 3 étapes

```
1. EXTRACTION   PDF de cours ──► sections JSON     (scripts/extract_pdf_sections.py)
2. GÉNÉRATION   section + prompt ──► Claude Opus ──► QCM JSON
3. VALIDATION   QCM ──► contrôle automatisé ──► seed en base  (scripts/validate_generated.py + seed-opus.ts)
```

### 6.2 Le prompt : ancrage strict anti-hallucination

Le prompt système (documenté dans `docs/GENERATION_QUESTIONS.md`) impose une discipline de
**qualité concours**. Extraits des règles **non négociables** :

- **Ancrage total** : chaque question doit être *entièrement* justifiable par un `sourceText`
  copié **caractère pour caractère** du cours, d'un seul tenant.
- **Aucune jurisprudence** (CE, CAA, Cassation) ni **aucun chiffre/délai/date** absent du texte source.
- **Interdiction des questions de repérage visuel** (« en quelle année… », « combien de… »).
- **Taxonomie de Bloom** explicite (rappel → compréhension → application → analyse → évaluation → cas pratique), avec un mélange visé.
- **Format JSON strict**, vérifié ensuite automatiquement.

### 6.3 La validation automatisée (le garde-fou)

`scripts/validate_generated.py` **rejette** mécaniquement toute question qui :
- a un `sourceText` tronqué (ne finit pas par `.`/`!`/`?`/`»`) ou **absent** du cours,
- contient une référence juridique non présente dans le `sourceText`,
- est une question visuelle,
- n'a pas exactement 4 options distinctes.

### 6.4 Le récit de conception : DeepSeek → Opus (la preuve de la démarche)

La **V1 utilisait DeepSeek** (modèle moins cher). Un audit qualité interne
(`_bmad-output/planning-artifacts/audit-avant-apres-deepseek.md`) a tranché :

| Métrique | DeepSeek (V1) | Opus (V2) |
|---|:---:|:---:|
| Score qualité moyen | **32 / 100** | **84 / 100** |
| Questions de niveau concours (≥70) | 8 % | **85 %** |
| Questions critiques (<40) | **72 %** | 0 % |
| `sourceText` tronqué | 78 % des questions | 0 % |

→ **420 questions DeepSeek supprimées**, migration complète vers Opus. Les scripts DeepSeek sont
conservés en `_legacy/` comme trace de l'arbitrage. **C'est une décision d'ingénieur mesurée, pas un choix par défaut.**

### 6.5 Volume produit

**~760 QCM**, distribution Bloom : compréhension 40 % · application 20 % · rappel 19 % · analyse 11 % · évaluation 7 % · cas pratique 3 %. L'accent sur compréhension + application (60 %) est conforme aux attendus de catégorie A.

---

## 7. Compétence 3 — Le RAG juridique

### 7.1 Ce qui est implémenté

Une recherche **plein-texte BM25** sur le Code de l'urbanisme (table `legal_chunks`), via les
fonctions natives de Postgres. Code dans `lib/rag.ts`, exposé par trois routes API
(`/api/rag/search`, `/api/rag/ask`, `/api/rag/article`).

### 7.2 La cascade de recherche (3 niveaux)

| Niveau | Méthode | Objectif |
|---|---|---|
| 1 | `plainto_tsquery('french', …)` (logique ET) | **Précision** : tous les termes requis |
| 2 | `to_tsquery` en OU (`terme1 | terme2 …`) | **Rappel** : au moins un terme |
| 3 | `ILIKE` sur contenu/référence | **Filet** : références exactes (« L151-1 »), acronymes |

Le classement utilise `ts_rank` (score BM25) et `ts_headline` produit l'extrait surligné.

### 7.3 Pourquoi BM25 (lexical) et pas vectoriel (sémantique) — choix assumé

Une approche **vectorielle** (embeddings) a été **tentée puis écartée** (`_legacy/.../embed_sections.py`, marqué obsolète). Justification :

- Sur un **corpus juridique**, l'utilisatrice cherche des **termes précis** (un numéro d'article,
  « loi littoral ») — le lexical est **plus fidèle** et ne « dérive » pas vers un article
  sémantiquement proche mais juridiquement faux.
- **Coût nul, zéro dépendance externe**, transparence totale (on sait exactement pourquoi un
  résultat remonte).

**Limite reconnue :** le lexical échoue quand la requête est une reformulation en langage naturel
sans mot-clé commun. L'évolution possible serait un RAG hybride BM25 + vectoriel.

---

## 8. Compétence 4 — L'IA intégrée à l'application

### 8.1 Comment l'IA est connectée au produit

L'intelligence artificielle intervient à **deux niveaux**, par conception :

1. **Moteur de contenu (en amont)** — Claude Opus a produit l'intégralité des ~760 QCM que
   l'application sert en continu. **Le cœur pédagogique du produit est généré par IA.**
2. **Recherche juridique (en direct)** — la route RAG interroge la base à chaque requête de
   l'utilisatrice et restitue les articles pertinents.

### 8.2 Pourquoi l'IA générative est confinée hors-ligne (et pas appelée à chaque clic)

C'est une **décision d'architecture délibérée**, pas une limite subie :

| Critère | IA en production (à chaque requête) | IA confinée hors-ligne (notre choix) |
|---|---|---|
| Latence pour l'utilisatrice | 1–3 s par appel | **Instantanée** |
| Coût | Par requête, récurrent | **Nul au runtime** |
| Risque d'hallucination servie | Réel | **Nul** (contenu validé en amont) |
| Reproductibilité / contrôle qualité | Faible | **Total** (validation automatisée avant mise en base) |

> Pour une application de **révision de concours**, servir une réponse fausse est inacceptable.
> Confiner l'IA en amont, avec validation humaine + automatisée, **maximise la fiabilité**.

### 8.3 Évolution possible (documentée)

Si une démonstration d'**appel LLM en temps réel** est souhaitée, l'extension la plus naturelle
est de transformer `/api/rag/ask` en *vrai* RAG **retrieve + generate** : garder la recherche
BM25 (retrieval) et ajouter une **synthèse Claude** des extraits récupérés, en streaming.
Coût marginal, et le contrat de streaming (SSE) actuel le supporte déjà sans changer le front.

---

## 9. Fonctionnalité phare : la répétition espacée

L'application implémente un véritable **système de répétition espacée** (algorithme de **Leitner**), pas un simple « rejoue tes erreurs ». Code isolé et testable dans `lib/srs.ts`.

### 9.1 Principe

Chaque question est une « carte » rangée dans une **boîte** (0 à 6). À chaque réponse :
- **Correcte** → la carte monte d'une boîte (intervalle plus long).
- **Fausse** → la carte retombe en boîte 0 (à revoir immédiatement).

| Boîte | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| Jours avant révision | 0 | 1 | 2 | 4 | 8 | 16 | 30 |

### 9.2 Deux raffinements pertinents pour un concours

- **Plafond examen** : aucune révision n'est programmée après la veille du concours (`exam_date`)
  → tout est revu avant l'épreuve.
- **Oubli simulé (decay)** : un chapitre « maîtrisé » repasse en « à revoir » s'il accumule des
  cartes en retard ou n'a pas été revu depuis 14 jours — sans réécrire la base (calcul à l'affichage).

C'est la brique d'« intelligence » la plus tangible de l'app côté runtime : **algorithmique, déterministe, à coût nul.**

---

## 10. Sécurité

- **L'identité ne vient jamais du client.** La fonction `auth()` (`lib/auth.ts`) résout le `userId`
  **côté serveur** : session Supabase → sinon cookie invité → sinon `null`. Aucune action ne fait
  confiance à un identifiant envoyé par le navigateur → usurpation impossible.
- **Sessions rafraîchies** automatiquement par le `middleware.ts` (token Supabase renouvelé à chaque requête).
- **Mutations via Server Actions** uniquement (`actions/`), chacune revalidant `auth()` avant d'écrire.

---

## 11. Compétence 5 — Tests et qualité

### 11.1 État actuel (transparent)

- **Qualité du contenu** : couverte par la validation automatisée des QCM (§6.3) — c'est un test
  de données, exécuté avant chaque seed.
- **Tests unitaires de code** : **non encore en place** (aucun framework installé à ce jour).

### 11.2 Plan de test ciblé (à valeur maximale)

La logique à tester en priorité est **pure et déterministe**, donc idéale pour des tests unitaires :

| Cible | Fichier | Pourquoi prioritaire |
|---|---|---|
| Algorithme SRS (`reviewCard`, `nextBox`, `computeDueAt`) | `lib/srs.ts` | Logique métier critique, 100 % pure → tests rapides et fiables |
| Construction de requête RAG (`buildOrTsQuery`) | `lib/rag.ts` | Transformation déterministe de la requête |
| Sélection des questions de révision | `db/queries.ts` | Cœur de l'expérience (dernière réponse = à retravailler) |

Outil retenu : **Vitest** (rapide, natif TypeScript/ESM, intégration Next).

---

## 12. Compétence 5 — Coûts d'hébergement

### 12.1 Coût réel du projet : **0 €/mois**

| Service | Plan | Coût | Marge avant saturation |
|---|---|---|---|
| **Vercel** (hébergement) | Hobby (gratuit) | **0 €** | ~1000× sous les limites (1 utilisatrice) |
| **Neon** (base Postgres) | Free | **0 €** | Données < 10 % du quota 0,5 Go ; scale-to-zero |
| **Supabase** (auth + storage) | Free | **0 €** | 1 MAU sur 50 000 autorisés |
| **TOTAL** | | **0 €/mois** | |

### 12.2 Les 3 pièges à connaître (anticipation jury)

1. **Vercel Hobby = usage non commercial uniquement.** Conforme ici (app personnelle). Toute
   monétisation imposerait le plan Pro (20 $/mois).
2. **Supabase Free se met en pause après 7 jours d'inactivité.** L'auth tomberait après une
   semaine sans usage ; réactivation manuelle. Seul le plan Pro (25 $/mois) garantit la continuité.
3. **Neon Free : scale-to-zero** → légère latence de réveil (~1 s) au premier accès après une
   pause. Invisible en usage normal.

### 12.3 Coût si passage en production grand public

≈ **50–55 $/mois** (Vercel Pro 20 $ + Neon Launch ~5–10 $ + Supabase Pro 25 $), hors dépassements
à l'usage. À documenter comme scénario de montée en charge, pas comme besoin actuel.

---

*Fin du rapport technique v1.0 — Quiz Attaché Territorial.*
