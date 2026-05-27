# 🚀 Kit Démarrage Projet IA

## Guide complet pour concevoir une application / site web avec l'IA

> **Utilisation :** Ce document est à la fois un guide méthodologique, un template à remplir, une boîte à outils IA et une checklist de suivi.  
> **Durée totale estimée :** 6 à 9 heures (60-90 min par séquence)  
> **Prérequis :** Un accès à un LLM (ChatGPT, Claude, Gemini...)

---

## 📋 Checklist Globale du Projet

- [ ] **Séquence 0** — Analyser le problème utilisateur avec l'IA
- [ ] **Séquence 1** — Identifier les utilisateurs et leurs besoins avec l'IA
- [ ] **Séquence 2** — Structurer les fonctionnalités de l'application avec l'IA
- [ ] **Séquence 3** — Concevoir l'architecture du produit avec l'IA
- [ ] **Séquence 4** — Définir les données nécessaires avec l'IA
- [ ] **Séquence 5** — Intégrer l'IA dans l'expérience utilisateur

---

# 🎯 Séquence 0 — Analyser le problème utilisateur

## Pourquoi c'est crucial

> *"La majorité des projets numériques qui échouent n'ont pas de problème technique — ils ont construit la mauvaise solution pour le mauvais problème."*

**Investissement :** 3 jours d'analyse peuvent économiser 6 semaines de développement.

## Les 4 questions fondamentales

1. **QUI** est affecté par ce problème ?
2. **QUEL** est le problème réel (pas le symptôme) ?
3. **POURQUOI** les solutions actuelles ne suffisent-elles pas ?
4. **QUELLE** est l'ampleur du problème ?

## Sources d'analyse

| Source | Description | Effort |
|--------|-------------|--------|
| Entretiens utilisateurs | 30-60 min avec des personnes qui vivent le problème | Élevé |
| Observations terrain | Observer en situation réelle (shadowing) | Moyen |
| Données existantes | Avis clients, tickets support, forums, App Store | Faible |
| Analyse des solutions existantes | Utiliser les outils actuels, lire leurs avis négatifs | Moyen |
| **IA (LLM)** | Explorer, reformuler, approfondir le problème | **Faible** |

## Grille d'analyse des solutions existantes

| Question | Réponse |
|----------|---------|
| **Solution actuelle** | Ce que les utilisateurs font aujourd'hui |
| **Ce qui fonctionne** | Aspects appréciés → À conserver/améliorer |
| **Ce qui ne fonctionne pas** | Frustrations, limites → Opportunités |
| **Pourquoi ils s'en contentent** | Coût du changement, habitude → Obstacles à lever |
| **Ce qui manque complètement** | Besoins non couverts → Opportunités différenciantes |

## 🧠 Prompts IA — Séquence 0

### Prompt 1 — Reformulation du problème
```
Voici le problème que j'ai identifié : [description].
Reformule-le de 5 façons différentes, en variant le niveau
d'abstraction, le point de vue de l'utilisateur et la
formulation de la douleur.
```

### Prompt 2 — Exploration des causes profondes (5 Pourquoi)
```
En utilisant la méthode des 5 Pourquoi, explore les
causes profondes de ce problème : [description].
Pour chaque niveau, propose 2 à 3 hypothèses de causes.
```

### Prompt 3 — Limites des solutions actuelles
```
Les utilisateurs confrontés à [problème] utilisent
actuellement [solution existante]. Analyse en détail :
- Ce qui fonctionne dans cette solution
- Ce qui est frustrant ou insuffisant
- Ce qui manque complètement
- Pourquoi ils s'en contentent malgré tout
```

### Prompt 4 — Challenge des hypothèses
```
Voici mes conclusions sur le problème : [synthèse].
Joue le rôle d'un critique bienveillant et identifie :
- Les hypothèses non vérifiées dans mon analyse
- Les angles que je n'ai pas explorés
- Les risques d'erreur dans ma compréhension
- Les questions que je devrais poser à de vrais utilisateurs
```

### Prompt 5 — Identification des opportunités
```
À partir de cette analyse du problème : [synthèse],
identifie les 5 opportunités principales pour une solution
numérique. Pour chaque opportunité, précise :
- La douleur spécifique qu'elle soulage
- La valeur créée pour l'utilisateur
- Les risques ou obstacles à anticiper
```

## 📝 Template — Synthèse du problème

```markdown
# Synthèse du Problème

## 1. CONTEXTE
- **Utilisateurs concernés :**
- **Contexte :**
- **Fréquence et intensité de la douleur :**

## 2. PROBLÈME CENTRAL (Problem Statement)
> **[Profil utilisateur] a besoin de [besoin réel]**
> **parce que [insight / cause profonde].**

## 3. LIMITES DES SOLUTIONS ACTUELLES
- Ce que les utilisateurs font aujourd'hui :
- 3 principales frustrations :
- Ce qui manque et n'est couvert par rien :

## 4. OPPORTUNITÉS IDENTIFIÉES
1. [Opportunité 1] → Douleur ciblée : ... → Valeur créée : ...
2. [Opportunité 2] → Douleur ciblée : ... → Valeur créée : ...
3. [Opportunité 3] → Douleur ciblée : ... → Valeur créée : ...

## 5. HYPOTHÈSES À VALIDER
- [ ] Hypothèse 1 — Question à poser :
- [ ] Hypothèse 2 — Question à poser :
- [ ] Hypothèse 3 — Question à poser :

## 6. PÉRIMÈTRE (ce que ce projet n'adresse PAS)
- ...
```

## ✅ Checklist Séquence 0

- [ ] Choisir un domaine problème (travail, apprentissage, santé, organisation...)
- [ ] Identifier 3 à 5 frustrations concrètes des utilisateurs cibles
- [ ] Analyser 2 solutions existantes avec la grille proposée
- [ ] Utiliser l'IA avec les 5 prompts pour approfondir l'analyse
- [ ] Rédiger le Problem Statement selon le format recommandé
- [ ] Lister 3 hypothèses à valider avec de vrais utilisateurs

---

# 👥 Séquence 1 — Identifier les utilisateurs et leurs besoins

## Pourquoi c'est crucial

> *"Concevoir pour « tout le monde » revient à concevoir pour personne."*

**Règle :** 2 à 4 personas maximum. Au-delà, le focus se dilue.

## Les 3 types d'utilisateurs

| Type | Description | Priorité |
|------|-------------|----------|
| **Primaires** | Utilisent le produit directement au quotidien | Concevoir D'ABORD pour eux |
| **Secondaires** | Utilisation occasionnelle ou bénéficient des résultats | Comptent mais ne dictent pas l'UI |
| **Parties prenantes** | Décident d'adopter/payer sans utiliser au quotidien | Critères : coût, sécurité, ROI |

## Les 7 dimensions d'un persona actionnable

1. **Profil et contexte** — Prénom fictif, âge, métier, environnement
2. **Situation actuelle** — Comment gère-t-il le problème aujourd'hui ?
3. **Objectifs et motivations** — Qu'essaie-t-il d'accomplir ?
4. **Frustrations et douleurs** — Qu'est-ce qui l'empêche d'atteindre ses objectifs ?
5. **Comportements numériques** — Niveau de confort tech, appareils, apps utilisées
6. **Citation représentative** — Une phrase qui résume sa vision du problème
7. **Critères de succès** — Comment saura-t-il que le produit lui est utile ?

## Besoins exprimés vs besoins réels

| Exprimé | Réel | Solution possible |
|---------|------|-------------------|
| « Je veux un bouton pour exporter en PDF » | « Je dois partager des rapports avec ma direction » | Lien de partage en lecture seule |
| « Je veux une application mobile » | « Je dois accéder rapidement à mes données en déplacement » | Site responsive optimisé |
| « Je veux des notifications par email » | « Je ne veux pas rater les événements importants » | Résumé quotidien intelligent |

> **Technique :** Demandez « Pourquoi voulez-vous cela ? » 2 à 3 fois de suite.

## 🧠 Prompts IA — Séquence 1

### Prompt 1 — Génération d'un persona détaillé
```
Je construis [description du produit].
Le problème central est : [Problem Statement].
Génère un persona détaillé pour [profil identifié].
Inclus : profil et contexte, situation actuelle,
objectifs, frustrations, comportement numérique,
une citation représentative et les critères de succès.
Base-toi sur des comportements réalistes, pas des
stéréotypes.
```

### Prompt 2 — Enrichissement et approfondissement
```
Voici le persona que j'ai créé : [persona].
Enrichis-le en :
- ajoutant des détails sur sa journée type
- décrivant 3 situations concrètes où il rencontre le problème
- identifiant ses 3 plus grandes frustrations avec les solutions actuelles
- proposant 3 questions que je devrais lui poser en entretien
```

### Prompt 3 — Simulation de situations d'usage
```
En te mettant dans la peau de ce persona : [persona],
décris comment il réagirait face à chacune de ces situations :
1. Il découvre votre produit pour la première fois
2. Il essaie d'accomplir [tâche principale]
3. Il rencontre une difficulté dans le produit
4. Il décide de recommander (ou non) le produit
Détaille ses pensées, émotions et actions à chaque étape.
```

### Prompt 4 — Challenge de cohérence
```
Voici mes [N] personas : [liste des personas].
Analyse-les et identifie :
- Les incohérences entre les profils
- Les besoins contradictoires
- Les profils trop similaires à fusionner
- Un profil utilisateur important que j'aurais oublié
- Les hypothèses non réalistes dans mes personas
```

### Prompt 5 — Besoin exprimé → besoin réel
```
Voici une demande formulée par un utilisateur type
de mon produit [description] : « [demande utilisateur] »
Analyse cette demande et :
1. Identifie le besoin réel sous-jacent
2. Propose 3 façons de répondre à ce besoin réel
3. Précise la solution la plus simple à implémenter
4. Identifie les questions à poser pour valider
```

## 📝 Template — Document de profils utilisateurs

```markdown
# Profils Utilisateurs — [Nom du Projet]

## PAGE DE GARDE
- Projet : | Date : | Version : | Auteur(s) :
- Méthode : entretiens réalisés + IA utilisée

## SECTION 1 — CARTOGRAPHIE DES UTILISATEURS
| Nom | Type | Rôle dans le produit | Priorité V1 |
|-----|------|---------------------|-------------|
|     |      |                     |             |

## SECTION 2 — PERSONA PRIMAIRE (fiche détaillée)
**Nom :** [Prénom, âge, métier]
**Contexte :**
**Situation actuelle :**
**Objectifs :**
**Frustrations :**
**Comportement numérique :**
**Citation :** « ... »
**Critères de succès :**

## SECTION 3 — PERSONAS SECONDAIRES (fiches synthétiques)
[Version allégée des 7 dimensions, focus sur ce qui diffère]

## SECTION 4 — BESOINS CONSOLIDÉS
| Besoin | Persona concerné | Priorité | Besoin réel |
|--------|-----------------|----------|-------------|

## SECTION 5 — HYPOTHÈSES À VALIDER
- [ ] Hypothèse — Comment la valider ?

## SECTION 6 — QUESTIONS POUR LES ENTRETIENS
- Thème 1 (contexte) : ...
- Thème 2 (objectifs) : ...
- Thème 3 (frustrations) : ...
```

## ✅ Checklist Séquence 1

- [ ] Identifier 2 à 3 profils utilisateurs pour votre projet
- [ ] Utiliser les 4 prompts pour générer et enrichir chaque persona
- [ ] Rédiger la fiche complète du persona primaire (7 dimensions)
- [ ] Construire le tableau de synthèse des besoins
- [ ] Lister 5 hypothèses à valider et les questions d'entretien associées

---

# ⚙️ Séquence 2 — Structurer les fonctionnalités

## La chaîne Besoin → Fonctionnalité → Valeur

```
BESOIN UTILISATEUR → FONCTIONNALITÉ → VALEUR CRÉÉE
```

**Test de pertinence** (à appliquer à chaque feature) :
- Quel besoin cette fonctionnalité résout-elle ?
- Pour quel persona est-elle prioritaire ?
- Que se passerait-il si on ne l'avait pas ?
- Peut-on valider ce besoin avant de la construire ?

## Les 4 phases du processus

| Phase | Action | Durée |
|-------|--------|-------|
| **1. Divergence** | Lister toutes les fonctionnalités possibles sans filtre | 20-30 min |
| **2. Regroupement** | Organiser en modules/Epics cohérents | 15-20 min |
| **3. Filtrage** | Appliquer le test de pertinence | 15-20 min |
| **4. Priorisation** | MoSCoW ou RICE → distinguer MVP des évolutions | 20-30 min |

## Méthode MoSCoW

| Catégorie | Description | Exemple |
|-----------|-------------|---------|
| **Must Have** | Sans ça, le produit ne résout pas le problème | Créer une tâche, authentification |
| **Should Have** | Important mais contournable temporairement | Vue calendrier, commentaires |
| **Could Have** | Utile mais faible impact immédiat | Mode sombre, modèles prédéfinis |
| **Won't Have V1** | Explicitement exclu du MVP | App mobile native, facturation |

> **Règle :** Le MVP = les Must Have uniquement.

## Format User Story

```
En tant que [persona],
Je veux [action / fonctionnalité],
Afin de [bénéfice attendu].
```

**Critères d'acceptation :**
```
ÉTANT DONNÉ [contexte],
QUAND [action],
ALORS [résultat attendu].
```

## 🧠 Prompts IA — Séquence 2

### Prompt 1 — Génération de la liste initiale
```
Je construis [description du produit].
Problème central : [Problem Statement]
Persona principal : [description du persona]
Génère une liste exhaustive de fonctionnalités
potentielles pour ce produit. Pour chaque fonctionnalité :
- Nom court et explicite
- Le besoin utilisateur auquel elle répond
- Le persona concerné
- La valeur créée (bénéfice concret)
Ne filtre pas encore : inclus toutes les fonctionnalités
envisageables, du cœur du produit aux évolutions futures.
```

### Prompt 2 — Regroupement par logique métier
```
Voici la liste de fonctionnalités que j'ai identifiées :
[lister]
Regroupe-les en modules ou epics cohérents.
Pour chaque groupe :
- Donne-lui un nom représentatif
- Résume l'objectif métier du groupe en 1 phrase
- Liste les fonctionnalités qui en font partie
Identifie les doublons et les fonctionnalités à fusionner.
```

### Prompt 3 — Distinction MVP / post-MVP
```
Pour chaque fonctionnalité de cette liste : [liste],
classe-la en :
- MVP (indispensable pour que le produit soit utilisable)
- Post-MVP v2 (importante mais pas bloquante au lancement)
- Évolution future (nice-to-have, à planifier plus tard)
Justifie chaque classification en une phrase.
Critères pour le MVP : sans elle, le produit ne résout pas
le problème central pour le persona primaire.
```

### Prompt 4 — Challenge des choix MVP
```
Voici mon MVP tel que je l'ai défini : [liste MVP].
Joue le rôle d'un product manager expérimenté et :
1. Identifie les fonctionnalités potentiellement superflues
2. Signale les fonctionnalités manquantes
3. Pointe les fonctionnalités trop complexes à simplifier
4. Propose une version encore plus minimaliste du MVP (MMP)
```

### Prompt 5 — Fonctionnalités → User Stories
```
Voici mes personas : [liste des personas]
Voici mes fonctionnalités MVP : [liste]
Pour chaque fonctionnalité, génère :
- 2 à 3 user stories au format :
  'En tant que [persona], je veux [action], afin de [bénéfice].'
- Pour chaque story : 2 critères d'acceptation
  au format 'ÉTANT DONNÉ / QUAND / ALORS'
Varie les personas selon la pertinence de chaque story.
```

## 📝 Template — Liste priorisée des fonctionnalités

```markdown
# Fonctionnalités — [Nom du Projet]

## SECTION 1 — VUE D'ENSEMBLE
- Nombre total de fonctionnalités identifiées :
- Répartition MVP / post-MVP / évolutions futures :
- Périmètre du MVP en une phrase :

## SECTION 2 — FONCTIONNALITÉS PAR MODULE
### Module 1 : [Nom]
Objectif métier :
| Fonctionnalité | Description | Besoin | Persona | MoSCoW | Complexité |
|---------------|-------------|--------|---------|--------|------------|

### Module 2 : [Nom]
...

## SECTION 3 — MVP : PÉRIMÈTRE V1
**Must Have :**
- [ ] Fonctionnalité 1
- [ ] Fonctionnalité 2
- [ ] ...

**Hors scope V1 (Won't Have) :**
- ...

## SECTION 4 — USER STORIES MVP
### Fonctionnalité 1
- US1 : En tant que..., je veux..., afin de...
  - Critère : ÉTANT DONNÉ... QUAND... ALORS...
- US2 : ...

## SECTION 5 — BACKLOG POST-MVP
- Should Have : ...
- Could Have : ...
- Évolutions futures : ...

## SECTION 6 — HYPOTHÈSES ET RISQUES
- ...
```

## ✅ Checklist Séquence 2

- [ ] Utiliser les prompts 1 et 2 pour générer et regrouper les fonctionnalités
- [ ] Appliquer le test de pertinence et éliminer les fonctionnalités sans besoin identifié
- [ ] Utiliser le prompt 3 pour proposer une classification MoSCoW
- [ ] Challenger le MVP avec le prompt 4 et le réduire autant que possible
- [ ] Rédiger 2 user stories avec critères d'acceptation pour les 3 Must Have les plus importantes

---

# 🏗️ Séquence 3 — Concevoir l'architecture du produit

## Les 3 niveaux de l'architecture

| Niveau | Description | Outil |
|--------|-------------|-------|
| **1. Architecture de l'information** | Comment le contenu est organisé et hiérarchisé | Sitemap / arborescence |
| **2. Architecture de navigation** | Comment l'utilisateur se déplace entre les pages | Schéma de navigation |
| **3. Parcours utilisateurs** | Le chemin complet pour accomplir une tâche | User flows |

> **Règle :** Définissez les niveaux 1 et 2 avant de concevoir les wireframes.

## Comment construire un sitemap

1. **Lister toutes les pages nécessaires** — Partez des fonctionnalités MVP
2. **Regrouper en sections logiques** — Pages publiques / connectées / admin / paramètres
3. **Hiérarchiser (parent → enfant)** — Définir navigation principale et sous-pages
4. **Vérifier la profondeur** — Règle des 3 clics maximum

## Exemple de sitemap structuré

```
PAGES PUBLIQUES (non connecté)
├── /                    → Page d'accueil / landing
├── /connexion           → Formulaire de connexion
├── /inscription         → Formulaire d'inscription
└── /mot-de-passe        → Réinitialisation mot de passe

ESPACE CONNECTÉ
├── /tableau-de-bord     → Vue d'ensemble
├── /projets             → Liste de tous les projets
│   └── /projets/[id]    → Détail d'un projet
│       ├── /taches      → Tâches du projet
│       └── /membres     → Membres du projet
├── /taches              → Mes tâches (vue personnelle)
└── /notifications       → Centre de notifications

PARAMÈTRES
├── /profil              → Profil et préférences
├── /equipe              → Gestion des membres (admin)
└── /abonnement          → Plan et facturation (admin)

PAGES SYSTÉMIQUES
├── /onboarding          → Guide premier démarrage
├── /404                 → Page introuvable
└── /maintenance         → Mode maintenance
```

## Patterns de navigation

| Pattern | Idéal pour | Exemple |
|---------|-----------|---------|
| **Top navigation** | 4-7 sections, desktop B2B | Notion, Google Analytics |
| **Sidebar** | Beaucoup de sections, dashboards | Slack, Linear, Figma |
| **Bottom navigation** | Mobile, 3-5 sections | Instagram, Airbnb |
| **Tabs** | Navigation au sein d'une même page | Profil utilisateur |
| **Breadcrumb** | Navigation profonde (3+ niveaux) | Complément des autres |

## 🧠 Prompts IA — Séquence 3

### Prompt 1 — Génération du sitemap
```
Je construis [description du produit].
Fonctionnalités MVP : [liste des Must Have]
Personas : [liste]
Génère le sitemap complet de l'application :
- Pages publiques (avant connexion)
- Espace connecté avec sous-pages
- Pages d'administration si pertinent
- Pages systémiques (onboarding, erreurs, profil)
Organise par niveau hiérarchique (parent / enfant).
Respecte la règle des 3 clics maximum.
```

### Prompt 2 — Génération des user flows prioritaires
```
Pour ce produit [description], génère les user flows
détaillés des 3 tâches principales suivantes :
1. [tâche 1 — issue des user stories Must Have]
2. [tâche 2]
3. [tâche 3]
Pour chaque flow :
- Point d'entrée
- Toutes les étapes séquentielles avec écrans traversés
- Points de décision (succès et cas d'erreur)
- Point de sortie et confirmation
Utilise une notation textuelle claire (flèches et indentation).
```

### Prompt 3 — Détection des incohérences
```
Voici l'architecture que j'ai définie : [sitemap + flows].
Analyse-la et identifie :
- Les pages référencées dans les flows mais absentes du sitemap
- Les pages du sitemap inaccessibles depuis la navigation
- Les flows avec trop d'étapes (> 7 étapes = friction excessive)
- Les cas d'erreur non gérés
- Les incohérences entre les flows et les fonctionnalités MVP
```

### Prompt 4 — Navigation et structure des menus
```
Pour ce produit [description] avec ce sitemap [sitemap],
propose :
- La structure de la navigation principale (menu)
- Les éléments toujours visibles vs contextuels
- Les raccourcis d'accès aux actions fréquentes
- Le pattern de navigation adapté (sidebar, top nav,
  bottom nav mobile, breadcrumb)
Justifie tes choix en fonction du persona primaire.
```

## ✅ Checklist Séquence 3

### Sitemap
- [ ] Toutes les fonctionnalités MVP ont une page associée
- [ ] Aucune page à plus de 3 clics de l'accueil
- [ ] Pages systémiques présentes (onboarding, 404, profil, paramètres)
- [ ] Séparation claire public / connecté / admin

### User Flows
- [ ] Un flow par user story Must Have
- [ ] Chaque flow a un point d'entrée et une fin claire
- [ ] Les cas d'erreur sont représentés
- [ ] Aucun flow à plus de 7 étapes

### Navigation
- [ ] Pattern de navigation choisi et justifié
- [ ] Actions fréquentes accessibles en 1-2 clics
- [ ] Aucune page orpheline
- [ ] Retour arrière possible depuis chaque écran

### Cohérence
- [ ] Les flows traversent uniquement des pages du sitemap
- [ ] Pas de contradiction entre flows différents
- [ ] L'architecture reflète les priorités MoSCoW

---

# 💾 Séquence 4 — Définir les données nécessaires

## Les 3 concepts fondamentaux

| Concept | Définition | Exemple |
|---------|-----------|---------|
| **Entité** | Type d'objet que le produit doit mémoriser | Utilisateur, Projet, Tâche |
| **Champ** | Information stockée pour chaque instance | titre, statut, échéance |
| **Relation** | Lien entre deux entités | Une Tâche appartient à un Projet |

## Types de champs courants

| Type | Usage | Exemple |
|------|-------|---------|
| Text / String | Titre, nom, description, email | `titre: "Rapport Q3"` |
| Number | Prix, quantité, score | `prix: 29.99` |
| Boolean | Actif/inactif, lu/non lu | `est_actif: true` |
| Date / DateTime | Échéance, date création | `créé_le: 2025-03-01` |
| Select | Statut, priorité (valeurs fixes) | `statut: "En cours"` |
| Multi-select | Tags, rôles (plusieurs valeurs) | `tags: ["urgent", "design"]` |
| File / Image | Photo, pièce jointe | `avatar_url: "..."` |
| Relation | Lien vers une autre entité | `projet → Projet` |
| Computed | Valeur calculée | `durée = fin - début` |

## Les 3 types de relations

| Type | Description | Exemple |
|------|-------------|---------|
| **1-à-1** | Chaque A lié à exactement un B | Un Utilisateur a un Profil |
| **1-à-plusieurs** | Un A lié à plusieurs B (la plus fréquente) | Un Projet a plusieurs Tâches |
| **Plusieurs-à-plusieurs** | A lié à plusieurs B et vice-versa | Projets ↔ Membres (table de jonction) |

## Exemple de modèle de données complet

```
Utilisateur
├── id          UUID       Identifiant unique
├── email       Text       Unique, obligatoire
├── nom         Text
├── avatar_url  File
└── créé_le     DateTime

Projet
├── id          UUID
├── titre       Text       Obligatoire
├── description Text
├── statut      Select     Actif | Archivé | Terminé
├── owner       → Utilisateur  (1-à-plusieurs)
└── créé_le     DateTime

Tâche
├── id          UUID
├── titre       Text       Obligatoire
├── description Text
├── statut      Select     À faire | En cours | Bloqué | Fait
├── priorité    Select     Basse | Moyenne | Haute | Critique
├── échéance    Date
├── projet      → Projet       (1-à-plusieurs)
├── assigné     → Utilisateur  (1-à-plusieurs)
├── créé_le     DateTime
└── modifié_le  DateTime

Commentaire
├── id          UUID
├── texte       Text       Obligatoire
├── tâche       → Tâche        (1-à-plusieurs)
├── auteur      → Utilisateur  (1-à-plusieurs)
└── créé_le     DateTime

MembreProjet  ← table de jonction (Many-to-Many)
├── utilisateur → Utilisateur
├── projet      → Projet
├── rôle        Select     Membre | Admin | Lecteur
└── ajouté_le   DateTime
```

## Principes d'un modèle de données de qualité

1. **Ne stocker que ce qui est utilisé** — Chaque champ doit correspondre à une donnée affichée ou traitée
2. **Éviter la duplication** — Une information = un seul endroit. Utilisez des relations, jamais des copies
3. **Nommer clairement** — `statut_commande` plutôt que `s` ou `status`
4. **Toujours inclure des métadonnées temporelles** — `créé_le` et `modifié_le` sur presque toutes les entités
5. **Anticiper sans sur-ingénierie** — Concevez pour le MVP, laissez de la place logique pour les évolutions

## 🧠 Prompts IA — Séquence 4

### Prompt 1 — Génération du modèle initial
```
Je construis [description du produit].
Fonctionnalités MVP : [liste des Must Have]
Génère le modèle de données complet :
- Liste toutes les entités nécessaires
- Pour chaque entité : nom, liste des champs
  avec type (Text, Number, Date, Select, Relation...)
  et caractère obligatoire ou optionnel
- Décris toutes les relations entre entités
  avec leur cardinalité (1-à-1, 1-à-N, N-à-N)
- Signale les tables de jonction nécessaires
```

### Prompt 2 — Affinage des champs
```
Pour l'entité [nom de l'entité] de mon modèle,
analyse chaque champ et vérifie :
- Le type est-il le plus adapté ?
- Manque-t-il des champs pour couvrir
  les fonctionnalités MVP suivantes : [liste] ?
- Y a-t-il des champs redondants ou inutiles ?
- Quels champs devraient avoir une valeur par défaut ?
```

### Prompt 3 — Vérification de cohérence
```
Voici mon modèle de données complet : [modèle].
Vérifie sa cohérence en :
1. Croisant chaque fonctionnalité MVP [liste]
   avec le modèle — est-elle réalisable ?
2. Identifiant les données manquantes
3. Signalant les relations incorrectes
   ou les cardinalités mal définies
4. Repérant les risques de duplication
   ou d'incohérence de données
```

### Prompt 4 — Simulation d'un scénario d'usage
```
En utilisant mon modèle de données [modèle],
simule le scénario suivant étape par étape :
[description d'un flow utilisateur complet]
Pour chaque étape, indique :
- Quelle entité est lue ou modifiée
- Quels champs sont impliqués
- Si une donnée manque pour réaliser cette étape
```

## 📝 Template — Modèle de données

```markdown
# Modèle de Données — [Nom du Projet]

## SECTION 1 — VUE D'ENSEMBLE
Liste des entités avec leur rôle en 1 phrase :
- **Utilisateur** : ...
- **Projet** : ...
- ...

## SECTION 2 — FICHE DÉTAILLÉE PAR ENTITÉ
### Entité : [Nom]
Rôle métier :
| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
|       |      |             |             |
Valeurs possibles pour les Select : ...
Contraintes : ...

## SECTION 3 — TABLEAU DES RELATIONS
| Entité A | Relation | Entité B | Description |
|----------|----------|----------|-------------|
| Tâche    | N-à-1    | Projet   | Appartient  |

## SECTION 4 — VALIDATION PAR LES FLOWS
| Étape du flow | Entité concernée | Opération (C/R/U/D) |
|---------------|-----------------|---------------------|

## SECTION 5 — QUESTIONS OUVERTES
- Décisions non encore tranchées :
- Points à valider avec le développeur :
```

## ✅ Checklist Séquence 4

- [ ] Lister toutes les entités nécessaires à partir des fonctionnalités MVP
- [ ] Utiliser le prompt 1 pour générer le modèle initial avec l'IA
- [ ] Pour les 2 entités principales, affiner les champs avec le prompt 2
- [ ] Simuler un flow utilisateur complet sur le modèle avec le prompt 4
- [ ] Rédiger le tableau des relations et vérifier la cohérence avec le prompt 3

---

# 🤖 Séquence 5 — Intégrer l'IA dans l'expérience utilisateur

## Les 5 grandes capacités de l'IA en produit

| Capacité | Description | Exemple |
|----------|-------------|---------|
| **1. Génération de contenu** | Produire du texte, images, code | Rédiger un brouillon, compléter un champ |
| **2. Classification** | Analyser et assigner une catégorie | Classer un ticket, détecter le ton |
| **3. Recommandation** | Proposer le contenu le plus pertinent | Suggérer la prochaine étape |
| **4. Extraction et synthèse** | Lire un contenu long et en extraire les clés | Résumer une réunion |
| **5. Prédiction et détection** | Anticiper un résultat, signaler une anomalie | Prédire un risque de retard |

## Test de pertinence d'un usage IA

| Question | À vérifier |
|----------|-----------|
| Q1 — Quel problème utilisateur précis cet usage résout-il ? | Doit correspondre à une frustration identifiée |
| Q2 — Pourquoi l'IA est-elle meilleure qu'une approche classique ? | Si une règle métier suffit → pas d'IA |
| Q3 — Comment mesurerez-vous la valeur créée ? | Gain de temps, taux d'erreur, adoption... |
| Q4 — Quels sont les risques si l'IA se trompe ? | Erreur bénigne vs erreur à fort impact |

> **Résultat :** Réponse claire aux 4 questions → usage à inclure. Réponse vague → usage à différer.

## Les 6 patterns d'intégration IA

| Pattern | Autonomie | Idéal pour |
|---------|-----------|------------|
| **1. Suggestion** | Faible — IA propose, humain décide | Autocomplétion, suggestion de tags |
| **2. Génération assistée** | Moyen | Email pré-rédigé, rapport auto-généré |
| **3. Analyse et synthèse** | Moyen | Résumé de documents, analyse de retours |
| **4. Personnalisation adaptative** | Élevé | Ordre personnalisé, niveau adaptatif |
| **5. Détection et alerte** | Élevé | Alerte retard, détection fraude |
| **6. Automatisation autonome** | Maximal | Réponse auto aux emails simples |

> **Règle de progression :** Commencez par les patterns 1 et 2 (suggestion et génération assistée). Ils offrent de la valeur immédiate avec un risque minimal car l'utilisateur reste en contrôle. Les patterns 4, 5 et 6 nécessitent plus de données et de tests.

## 🧠 Prompts IA — Séquence 5

### Prompt 1 — Exploration des opportunités IA
```
Je construis [description du produit].
Problème central : [Problem Statement]
Persona primaire : [description]
Fonctionnalités MVP : [liste]
Identifie les 5 endroits dans ce produit où
l'intelligence artificielle pourrait créer
une valeur significative pour l'utilisateur.
Pour chaque opportunité :
- Description de l'usage IA
- Problème utilisateur résolu
- Pattern d'intégration recommandé
- Valeur mesurable créée
- Difficulté d'implémentation (faible/moyenne/élevée)
```

### Prompt 2 — Comparaison d'approches
```
Pour la fonctionnalité IA suivante : [description],
compare 3 approches d'implémentation différentes :
- Approche 1 : [ex. génération complète par LLM]
- Approche 2 : [ex. suggestions basées sur règles + LLM]
- Approche 3 : [ex. extraction + présentation structurée]
Pour chaque approche :
→ Expérience utilisateur concrète
→ Avantages et inconvénients
→ Risques d'erreur et conséquences
→ Complexité d'implémentation
→ Recommandation pour un MVP
```

### Prompt 3 — Challenge de pertinence
```
Voici les usages IA que j'envisage pour mon produit :
[liste des usages]
Pour chacun, joue l'avocat du diable :
1. Ce problème pourrait-il être résolu plus simplement sans IA ?
2. Quels sont les cas où l'IA pourrait se tromper et quelles en seraient les conséquences ?
3. Quel est le risque de dépendance excessive à l'IA ?
4. L'utilisateur fera-t-il confiance au résultat sans le vérifier ?
```

### Prompt 4 — Rédaction de la note de conception IA
```
À partir de cette analyse : [synthèse des usages retenus],
rédige une note de conception IA structurée comprenant :
- Vision de la couche IA du produit (2-3 phrases)
- Liste des usages IA retenus avec justification
- Liste des usages écartés avec raison
- Points de vigilance techniques et éthiques
- Indicateurs pour mesurer la valeur créée
```

## Points de vigilance

| Risque | Description | Mitigation |
|--------|-------------|------------|
| **Hallucinations** | L'IA produit des informations plausibles mais fausses | Positionner l'IA comme aide à la décision, jamais comme source de vérité |
| **Biais** | Les modèles reproduisent les biais de leurs données d'entraînement | Tester les outputs sur des cas limites dès la conception |
| **Dépendance** | L'utilisateur perd la capacité de faire la tâche seul | Concevoir pour amplifier, pas remplacer |
| **Transparence** | L'utilisateur ne comprend pas pourquoi l'IA propose quelque chose | Montrer le raisonnement, préférer les patterns de suggestion |
| **Coûts API** | Chaque appel LLM a un coût variable | Estimer le volume d'appels et intégrer ces coûts dans le business case |

## 📝 Template — Note de conception IA

```markdown
# Note de Conception IA — [Nom du Projet]

## SECTION 1 — VISION DE LA COUCHE IA
[2 à 3 phrases : quel rôle joue l'IA dans ce produit ?]

## SECTION 2 — USAGES IA RETENUS
### Usage 1 : [Nom]
- Fonctionnalité concernée :
- Problème utilisateur résolu :
- Pattern d'intégration :
- Expérience utilisateur concrète :
- Valeur mesurable (KPI) :
- Risques et mitigation :

### Usage 2 : [Nom]
...

## SECTION 3 — USAGES ÉCARTÉS
- [Usage] — Raison de l'exclusion :

## SECTION 4 — POINTS DE VIGILANCE
- Risques techniques (coûts API, latence, erreurs) :
- Risques UX (confiance, dépendance, transparence) :
- Risques éthiques (biais, données personnelles) :

## SECTION 5 — INDICATEURS DE SUCCÈS
- Usage 1 → KPI cible :
- Usage 2 → KPI cible :
```

## ✅ Checklist Séquence 5

- [ ] Appliquer le test en 4 questions à chaque usage IA envisagé
- [ ] Utiliser le prompt 1 pour que l'IA explore les opportunités d'intégration
- [ ] Pour les 2 usages les plus prometteurs, comparer 2 approches avec le prompt 2
- [ ] Challenger les choix avec le prompt 3 — identifier les risques non anticipés
- [ ] Rédiger la note de conception IA complète en 5 sections

---

# 📚 Annexe — Erreurs fréquentes à éviter

## Séquence 0 — Analyse du problème
- ❌ Formuler le symptôme comme si c'était le problème
- ❌ Confondre le problème et la solution
- ❌ Analyser sans parler à de vrais utilisateurs
- ❌ Élargir le problème à l'infini
- ❌ Passer trop vite à la solution

## Séquence 1 — Personas
- ❌ Créer un persona démographique sans insight
- ❌ Inventer des personas sans données réelles
- ❌ Créer trop de personas (> 4)
- ❌ Ne pas distinguer le persona du segment marketing
- ❌ Oublier de relier les personas aux fonctionnalités

## Séquence 2 — Fonctionnalités
- ❌ Lister des fonctionnalités sans les relier à un besoin
- ❌ Copier les fonctionnalités d'un concurrent sans analyse
- ❌ Confondre fonctionnalité et écran
- ❌ Ne jamais réduire le périmètre du MVP
- ❌ MVP surchargé qui retarde tout

## Séquence 3 — Architecture
- ❌ Concevoir les écrans avant l'architecture
- ❌ Oublier les pages systémiques (onboarding, 404, mot de passe oublié)
- ❌ Créer des flows uniquement pour le cas idéal (happy path)
- ❌ Ignorer la profondeur de navigation (> 3 clics)
- ❌ Architecture pensée en écrans sans logique hiérarchique

## Séquence 4 — Données
- ❌ Créer une entité unique fourre-tout
- ❌ Oublier les entités de jonction (Many-to-Many)
- ❌ Ne pas distinguer donnée et état calculé
- ❌ Valider le modèle sans le tester sur les flows
- ❌ Dupliquer les données au lieu d'utiliser des relations

## Séquence 5 — IA
- ❌ Ajouter de l'IA sans lien avec les besoins utilisateurs (gadget)
- ❌ Confondre IA et automatisation classique
- ❌ Ne pas anticiper la dégradation gracieuse (si l'API IA est indisponible)
- ❌ Oublier de mesurer la valeur réelle
- ❌ Sous-estimer les coûts d'exploitation des API IA

---

# 🛠️ Outils recommandés

| Étape | Outil | Type |
|-------|-------|------|
| Analyse du problème | LLM (ChatGPT, Claude, Gemini) | IA |
| Personas | LLM + Whimsical / FigJam | IA + Design |
| Sitemap / Architecture | Whimsical, FigJam, Miro | Design |
| User flows | Whimsical, FigJam, draw.io | Design |
| Modèle de données | LLM + Airtable / Notion / SQL | IA + Data |
| Wireframes | Figma, Balsamiq, Sketch | Design |
| Prototypage | Figma, Framer | Design |
| Développement no-code | Bubble, Adalo, FlutterFlow | No-code |
| Développement code | VS Code, React, Next.js, Supabase | Code |

---

# 📖 Glossaire

| Terme | Définition |
|-------|-----------|
| **MVP** | Minimum Viable Product — version la plus simple qui résout le problème central |
| **MMP** | Minimum Marketable Product — version minimalement commercialisable |
| **Persona** | Représentation synthétique d'un groupe d'utilisateurs |
| **Problem Statement** | Formulation concise du problème |
| **User Story** | Description d'une fonctionnalité du point de vue utilisateur |
| **User Flow** | Chemin complet pour accomplir une tâche |
| **Sitemap** | Carte de toutes les pages de l'application |
| **MoSCoW** | Méthode de priorisation : Must/Should/Could/Won't have |
| **Entité** | Type d'objet que le produit doit mémoriser |
| **Relation** | Lien entre deux entités avec une cardinalité |
| **LLM** | Large Language Model (ChatGPT, Claude, Gemini) |
| **Pattern IA** | Façon d'intégrer l'IA dans l'expérience utilisateur |
| **KPI** | Key Performance Indicator |
| **Wireframe** | Schéma fonctionnel d'un écran sans design visuel |
| **Backlog** | Liste priorisée des fonctionnalités à développer |

---

> **💡 Pro tip :** Pour chaque nouveau projet, dupliquez ce fichier et remplissez les templates séquence par séquence. Utilisez les checklists pour suivre votre progression. Les prompts IA sont conçus pour être copiés-collés directement dans votre LLM préféré.

---

*Document généré à partir de la formation "Conception IA" — Coursenia LearningCampus*