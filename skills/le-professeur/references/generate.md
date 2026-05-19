# 🧪 Génération

Crée de nouvelles questions de niveau concours à partir d'un texte source.

## Principe

L'utilisateur fournit un texte source (extrait de fiche, article, loi) → Le Professeur génère des questions QCM pointues, niveau Attaché Territorial.

## Règles de génération

### 1. Exploiter TOUT le texte
Chaque alinéa, chaque concept, chaque date, chaque distinction doit donner lieu à au moins une question. Ne rien laisser de côté.

### 2. Répartir sur les niveaux Bloom
- **Rappel** (30%) : définitions, chiffres, dates, noms d'institutions
- **Compréhension** (40%) : expliquer un mécanisme, distinguer deux concepts
- **Application** (30%) : appliquer une règle à un cas concret, identifier une conséquence

### 3. Niveau concours Attaché Territorial
- Questions techniques et précises
- Distracteurs subtils et crédibles
- Pièges sur les distinctions fines (ex: déconcentration ≠ décentralisation)
- Références aux textes (lois, articles, décrets) quand le texte source les mentionne

### 4. Structure de chaque question
- **q** : énoncé précis, sans guillemets doubles internes
- **options** : 4 options, toutes plausibles
- **answer** : index (0-3) de la bonne réponse
- **explanation** : 1-2 phrases ancrées dans le texte, avec référence si possible
- **sourceText** : recopie textuelle du passage qui justifie la réponse
- **bloom** : "rappel", "comprehension", ou "application"

### 5. Interdictions absolues
- Pas de "Toutes ces réponses" ou "Aucune de ces réponses"
- Pas de double négation
- Pas de distracteurs absurdes ou hors-sujet
- Pas de questions dont la réponse est devinable sans le texte
- Pas de guillemets doubles dans les chaînes (utiliser « » ou ')

## Format de sortie

```json
[
  {
    "bloom": "comprehension",
    "q": "Question précise sans guillemets doubles",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0,
    "explanation": "Explication ancrée dans le texte.",
    "sourceText": "Recopie textuelle du passage source."
  }
]
```

## Ce qui fait le succès de la génération

- **Couverture exhaustive** — chaque concept du texte est exploité
- **Niveau homogène** — toutes les questions sont au niveau concours
- **Distracteurs crédibles** — un candidat sérieux pourrait hésiter
- **sourceText exact** — pas de reformulation, la recopie textuelle
