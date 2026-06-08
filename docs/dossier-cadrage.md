# Dossier de cadrage — Quiz Attaché Territorial

> **Objet du document.** Formaliser le passage *besoin → cahier des charges → solution* pour
> l'application de révision du concours d'Attaché Territorial. Sert de support à la compétence
> « Identifier et prioriser les cas d'utilisation : analyse, conception ».
>
> **Version** : 1.0 — **Date** : juin 2026 — **Auteur** : Vincent Balu — **Soutenance** : 10 juin 2026

---

## 1. Contexte et enjeu

Le concours d'Attaché Territorial repose sur un programme dense (droit public, finances
locales, urbanisme, environnement territorial…) où l'enjeu n'est pas la possession du cours
mais sa **maîtrise active** : savoir restituer, comprendre et appliquer des notions sous la
pression de l'examen.

**Problème constaté.** Les supports existants (annales papier, PDF de cours, fiches) sont
**passifs** : on relit sans jamais mesurer ce qu'on a réellement acquis, et on révise « à
l'aveugle » sans prioriser ses points faibles.

**Idée directrice.** Transformer des centaines de pages de cours en un **entraînement actif,
mesuré et priorisé**, à la manière de Duolingo, en s'appuyant sur l'IA pour produire un volume
de questions de **qualité concours** impossible à rédiger manuellement.

---

## 2. Expression du besoin (cahier des charges)

### 2.1 Besoin fonctionnel

| # | Le candidat doit pouvoir… | Justification |
|---|---|---|
| B1 | S'entraîner sur un thème ou une sélection de sous-thèmes | Cœur de l'entraînement actif |
| B2 | Travailler une leçon courte et ciblée | Sessions brèves, régulières (effet Duolingo) |
| B3 | **Rejouer en priorité ses erreurs** | La valeur pédagogique est dans la correction des points faibles |
| B4 | Voir une **explication + la source** après chaque réponse | Apprentissage, pas seulement évaluation |
| B5 | Suivre sa progression (par thème, global) | Motivation + pilotage de la révision |
| B6 | Consulter le cours d'origine (PDF, sections) | Revenir à la source en cas de doute |
| B7 | Rechercher dans le Code de l'urbanisme | Différenciateur : ancrage juridique vérifiable |
| B8 | Utiliser l'app sans créer de compte (mode invité) | Réduire la friction d'entrée |

### 2.2 Besoin non-fonctionnel

- **Qualité du contenu** : questions **ancrées strictement** sur le texte de cours (niveau
  concours, zéro hallucination). Critère bloquant.
- **Disponibilité / latence** : réponse instantanée pendant un quiz (pas d'attente d'un LLM).
- **Coût d'exploitation maîtrisé** : application personnelle → budget proche de 0 €/mois visé.
- **Sécurité** : l'identité de l'utilisateur ne vient jamais du client (autorité serveur).
- **Maintenabilité** : un seul développeur, stack typée de bout en bout.

### 2.3 Contraintes assumées

| Contrainte | Conséquence de conception |
|---|---|
| **Mono-utilisatrice** | On **exclut** tout module social/compétitif (ligues, classements, défis) |
| Délai court, dev solo | Privilégier le serverless managé (zéro ops) et une stack homogène TypeScript |
| Budget quasi nul | Tiers gratuits Vercel + Neon + Supabase ; coût IA = **batch one-shot**, pas runtime |
| Exigence concours | L'IA produit le contenu **hors-ligne**, avec validation automatisée avant mise en base |

---

## 3. Objectifs (mesurables)

1. **Couvrir** ≥ 2 matières du programme avec ≈ 760 QCM ancrés sur les PDF de cours. *(atteint)*
2. **Prioriser** automatiquement la révision sur les questions échouées (dernière réponse). *(atteint)*
3. **Servir** chaque question en < 200 ms, sans dépendance à un service IA en production. *(atteint)*
4. **Maintenir** un coût d'hébergement mensuel ≈ 0 € (tiers gratuits). *(à chiffrer — compétence 5)*
5. **Garantir** la traçabilité : chaque question pointe vers son extrait de cours source. *(atteint)*

---

## 4. Identification et priorisation des cas d'usage

### 4.1 Acteurs

- **La candidate** (utilisatrice unique) — connectée ou invitée.
- **Le concepteur de contenu** (rôle hors-ligne, joué par moi) — pilote la chaîne de génération IA.
- **Le système** — sert le contenu, mesure la progression, expose la recherche juridique.

### 4.2 Cas d'usage recensés

| ID | Cas d'usage | Acteur | Implémentation |
|----|-------------|--------|----------------|
| UC1 | Quiz libre (pool multi-sous-thèmes mélangé) | Candidate | `/lesson?sousThemeIds=` |
| UC2 | Jouer une leçon précise | Candidate | `/lesson?lessonId=` |
| UC3 | Mode révision (erreurs en priorité) | Candidate | `/lesson?mode=revision` |
| UC4 | Tableau de bord de progression | Candidate | `/progression` |
| UC5 | Bibliothèque de cours + lecteur PDF | Candidate | `/library/...` |
| UC6 | Recherche dans le Code de l'urbanisme (RAG) | Candidate | `/api/rag/*` |
| UC7 | Authentification / session invité | Candidate | `(auth)/`, `/api/guest` |
| UC8 | **Générer des QCM de qualité concours** | Concepteur | `scripts/` (Opus + validation) |

### 4.3 Priorisation (méthode MoSCoW)

| Priorité | Cas d'usage | Raison de la priorité |
|----------|-------------|------------------------|
| **MUST** | UC8 (génération), UC1, UC2, UC3, UC7 | Sans contenu de qualité ni entraînement/révision, le produit n'existe pas |
| **SHOULD** | UC4 (progression), UC5 (bibliothèque) | Forte valeur de pilotage et de réassurance, mais non bloquants |
| **COULD** | UC6 (RAG urbanisme) | Différenciateur fort ; périmètre une seule matière |
| **WON'T** | Social, classements, défis, multi-utilisateurs | **Exclus par décision de cadrage** (app mono-utilisatrice) |

> **Lecture jury.** La priorisation découle directement des besoins non-fonctionnels : la
> *qualité du contenu* (UC8) prime sur tout, car une app de QCM avec des questions fausses
> est contre-productive pour un concours. La *révision priorisée* (UC3) est le cas d'usage à
> plus forte valeur pédagogique, donc traité avant le confort (UC4/UC5).

---

## 5. Du cahier des charges à la solution : choix de conception justifiés

Chaque décision est tracée *besoin → option retenue → alternative écartée*.

### 5.1 Architecture applicative — Next.js 16 (App Router) + Server Components

- **Besoin** : stack homogène, typée, déployable sans ops, par un seul dev.
- **Retenu** : Next.js 16 / React 19 / TypeScript, Server Components par défaut + Server Actions
  pour les mutations.
- **Pourquoi** : un seul langage du front au back ; rendu serveur = données proches de la base ;
  déploiement Vercel « zéro config ».
- **Écarté** : SPA + API séparée (deux déploiements, plus de surface à maintenir pour un solo).

### 5.2 Données — Neon Postgres + Drizzle ORM

- **Besoin** : modèle relationnel clair (thèmes → leçons → questions), coût ≈ 0, serverless.
- **Retenu** : Neon (Postgres serverless) + Drizzle (ORM typé, migrations versionnées).
- **Pourquoi** : Postgres donne *gratuitement* la recherche plein-texte (clé du RAG, §5.5) ;
  Drizzle aligne le schéma TypeScript et la base.
- **Modèle** inspiré de Duolingo : `themes → sous_themes (= PDF) → lessons → challenges →
  challenge_options`, traçabilité via `user_answers`.

### 5.3 Authentification — Supabase + fallback invité

- **Besoin** : connexion simple, mais entrée sans friction (UC7/B8).
- **Retenu** : Supabase Auth (`@supabase/ssr`) **+** repli invité par cookie `guest_id`.
- **Principe de sécurité** : `auth()` côté serveur (`lib/auth.ts`) → l'`userId` ne vient
  **jamais** du client.

### 5.4 Génération du contenu par IA — un « agent » hors-ligne piloté par prompt (compétence 2)

- **Besoin** : produire des centaines de QCM **de qualité concours**, infaisable à la main.
- **Retenu** : pipeline **PDF → extraction de sections → génération par Claude (Opus) → validation
  automatisée → seed en base**.
  - Prompt d'**ancrage strict** : interdiction de questions sur des dates/chiffres isolés,
    obligation d'un `sourceText` extrait *verbatim* du cours, format JSON imposé.
  - Couverture de la **taxonomie de Bloom** (rappel / compréhension / application / analyse…).
  - **Validation** (`scripts/validate_generated.py`) : rejet des `sourceText` tronqués, des
    questions « visuelles », des références juridiques hallucinées.
- **Itération de conception assumée** : la **V1 utilisait DeepSeek** (moins cher) — qualité
  jugée **insuffisante** pour le niveau concours → **migration vers Opus** avec ancrage renforcé.
  Les scripts DeepSeek sont conservés en `_legacy/` comme trace de l'arbitrage.
- **Choix structurant** : l'IA agit **en amont** (batch), pas en production → coût runtime nul,
  latence nulle, **zéro hallucination servie** à l'utilisateur.

### 5.5 RAG juridique — recherche plein-texte BM25 Postgres (compétence 3)

- **Besoin** (UC6) : retrouver l'article exact du Code de l'urbanisme appuyant une notion.
- **Retenu** : indexation `tsvector` français + cascade de requêtes dans `lib/rag.ts` :
  1. `plainto_tsquery` (tous les termes — précision),
  2. `to_tsquery` en OR (rappel),
  3. `ILIKE` (filet de sécurité).
- **Écarté (pour l'instant)** : RAG **vectoriel** (embeddings + pgvector). Tenté
  (`_legacy/.../embed_sections.py`) puis écarté : sur un corpus juridique où l'utilisateur cherche
  des **termes précis** (« L151-1 », « loi littoral »), le lexical BM25 est **plus fidèle, gratuit
  et sans dépendance externe**.
- **Limite reconnue** : `/api/rag/ask` **assemble** aujourd'hui les extraits sans **génération**
  par un LLM. → Voir §7 (évolution cible : retrieve **+** generate).

### 5.6 Déploiement — Vercel + Neon + Supabase

- **Retenu** : `git push` → build Vercel → déploiement ; base Neon ; auth/stockage Supabase.
- **Pourquoi** : trois services managés en tiers gratuit → **objectif coût ≈ 0 €** (chiffrage détaillé : compétence 5).

---

## 6. Architecture cible (synthèse)

```
   [ PDF de cours ]                         ●  CHAÎNE HORS-LIGNE (batch, une fois)
        │  extraction de sections
        ▼
   [ Claude Opus ]  ──prompt d'ancrage strict──▶  [ JSON de QCM ]
        │                                              │ validation auto
        ▼                                              ▼
   ────────────────────  seed  ────────────────▶  [ Neon Postgres ]
                                                       │
   ●  RUNTIME (utilisatrice)                           │
   [ Next.js / Vercel ]  ◀── Server Components ───────┤
        │  - quiz (libre / leçon / révision)           │
        │  - progression                               │
        │  - recherche RAG (BM25 plein-texte) ─────────┘
        ▼
   [ Supabase Auth ]  (+ fallback invité cookie)
```

**Principe clé :** l'IA (coûteuse, potentiellement faillible) est **confinée hors-ligne** ;
la production ne sert que du contenu **validé et figé** + une recherche déterministe.

---

## 7. Risques, arbitrages et évolutions

| Risque / limite | Arbitrage actuel | Évolution possible (avant jury) |
|---|---|---|
| « IA non connectée en live » (compétence 4) | IA confinée hors-ligne (choix de qualité/coût) | **Ajouter une synthèse Claude sur les extraits RAG** → vrai *retrieve + generate*, IA en direct dans l'app |
| RAG lexical, pas sémantique | BM25 suffisant pour des termes juridiques précis | Hybride BM25 + embeddings si besoin de requêtes en langage naturel |
| Aucun test automatisé (compétence 5) | — | Tests unitaires ciblés : logique de révision, parsing RAG, scoring |
| Doc obsolète (CLAUDE.md disait Opus, code legacy DeepSeek) | Clarifié dans ce dossier | Mettre à jour la doc projet |

---

## 8. Planning jusqu'à la soutenance (10 juin)

| Jalon | Livrable |
|---|---|
| J-9 → J-7 | Ce dossier de cadrage (compétence 1) + récit agent/prompt (compétence 2) |
| J-6 → J-4 | Brique **RAG retrieve+generate** (compétences 3 & 4) + tests unitaires (compétence 5) |
| J-3 → J-2 | Chiffrage des coûts d'hébergement (compétence 5) |
| J-1 | Support de soutenance : démo + justification des choix |

---

*Fin du dossier de cadrage v1.0.*
