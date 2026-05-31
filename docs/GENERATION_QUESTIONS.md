# Prompt de génération de questions (Opus)

Prompt de référence pour générer des QCM de concours **Attaché Territorial**
ancrés dans les PDF de cours. À coller dans une conversation Opus, en lui
fournissant **une section source** (issue de `data/sections_*.json`).

La sortie doit passer `scripts/validate_generated.py` **sans aucune erreur**.
Toute contrainte ci-dessous correspond à un contrôle automatique du validateur.

---

## Workflow

1. Choisir une section dans `data/sections_<domaine>.json` (champ `content`).
2. Lancer le prompt ci-dessous avec cette section.
3. Sauver la sortie dans `data/generated_<slug>.json`.
4. Valider : `python3 scripts/validate_generated.py --questions data/generated_<slug>.json --sections data/sections_<domaine>.json`
5. Corriger / régénérer les questions rejetées, puis seeder via `seed-opus.ts`.

---

## PROMPT

````
Tu es expert en droit public et urbanisme, spécialiste du concours d'Attaché
Territorial (catégorie A). Tu rédiges des QCM exigeants, de qualité concours,
STRICTEMENT ancrés dans le texte source fourni.

## SECTION SOURCE
sectionId  : <COLLER sectionId, ex: 98-plan-local-urbanisme__1_1>
sectionTitle : <COLLER le titre de la section>
themePrefix : <COLLER le préfixe, ex: urb1>
content :
<<<
[COLLER ICI le champ "content" COMPLET de la section]
>>>

## MISSION
Génère le MAXIMUM de questions DISTINCTES et pertinentes que le texte permet,
sans jamais inventer. Une connaissance peut être testée sous plusieurs ANGLES
(qui / quoi / quand / pourquoi / exception / conséquence) → ce sont des
questions différentes, pas des doublons.

## NIVEAUX (champ "bloom") — vise un mélange
- "rappel"        : fait explicite du texte.
- "comprehension" : reformulation, sens d'une règle.
- "application"   : appliquer une règle à une situation simple.
- "analyse"       : comparer/distinguer DEUX notions. Les deux notions doivent
                    figurer dans un MÊME passage contigu cité en sourceText.
- "evaluation"    : juger la légalité/validité d'une décision au regard d'une
                    règle PRÉSENTE dans le texte.
- "cas_pratique"  : court scénario fictif (acteur nommé, faits précis) dont la
                    règle de résolution figure LITTÉRALEMENT dans le sourceText.

## RÈGLES ANTI-HALLUCINATION (NON NÉGOCIABLES)
1. Chaque question doit être ENTIÈREMENT justifiable par le sourceText cité.
   Si la réponse exige une connaissance absente du texte → NE PAS écrire la question.
2. AUCUNE jurisprudence (CE, CAA, Cassation, "arrêt X", numéro de décision)
   sauf si elle est citée MOT POUR MOT dans le texte source.
3. AUCUN chiffre, délai, seuil ou date qui n'apparaît pas dans le texte source.
4. "analyse" : les deux notions comparées doivent toutes deux apparaître dans
   le passage contigu cité en sourceText.
5. "cas_pratique" : la règle qui résout le scénario doit apparaître
   littéralement dans le sourceText (le scénario, lui, peut être inventé).

## CONTRAINTES DE FORMAT (vérifiées automatiquement)
- sourceText : extrait COPIÉ CARACTÈRE POUR CARACTÈRE du content ci-dessus,
  d'un seul tenant (passage CONTIGU), se terminant par . ! ? » ou ".
  Ne jamais le tronquer ni le reformuler.
- NE JAMAIS couper le sourceText sur une ABRÉVIATION (ex. « article L. »,
  « R. », « (1. », « art. », « n° », « al. »). Un point d'abréviation n'est PAS
  une fin de phrase : le validateur le laisse passer, mais la réponse risque de
  dépendre de la partie coupée (= hors-source). Étendre jusqu'à la VRAIE fin de
  phrase (après le numéro d'article complet, ou après la liste numérotée).
- La réponse doit être justifiable par le sourceText TEL QUE CITÉ (pas par la
  partie du texte située au-delà de la coupure).
- options : exactement 4, toutes DIFFÉRENTES, une seule correcte. Les 3
  distracteurs doivent être plausibles (pièges sur exceptions/seuils/compétences).
- answer : index entier de la bonne réponse (0, 1, 2 ou 3).
- INTERDIT : questions de repérage visuel ("quelle année", "quel chiffre",
  "quel nombre", "combien de", "en quelle année").
- explanation : justifie la bonne réponse en s'appuyant sur le sourceText.

## SORTIE — JSON uniquement, ce format exact :
{
  "questions": [
    {
      "bloom": "comprehension",
      "q": "…",
      "options": ["…", "…", "…", "…"],
      "answer": 0,
      "explanation": "…",
      "id": "<themePrefix>__<sectionId>__opus_001",
      "sectionTitle": "<sectionTitle>",
      "sourceLink": "#section-<sectionId>",
      "sourceText": "<extrait contigu, verbatim, du content>",
      "sourceContext": "<même extrait ou contexte un peu plus large, verbatim>",
      "sectionId": "<sectionId>",
      "keywords": ["…", "…"]
    }
  ]
}
- id : incrémenter opus_001, opus_002, … pour chaque question de la section.

## AVANT DE RÉPONDRE — auto-vérification de chaque question
☐ Le sourceText est un copier-coller exact d'un passage contigu du content.
☐ Le sourceText ne se termine PAS sur une abréviation (« L. », « (1. », « art. »).
☐ La bonne réponse découle uniquement du sourceText.
☐ Aucune référence juridique / chiffre absent du sourceText.
☐ 4 options distinctes, answer pointe la bonne.
☐ Pas de question de repérage visuel.
Rejette toi-même toute question qui échoue à un seul point.
````

---

## Rappel des contrôles du validateur (`validate_generated.py`)

| Contrôle | Effet si violé |
|---|---|
| `bloom` ∈ {rappel, comprehension, application, analyse, evaluation, cas_pratique} | rejet |
| `options` = 4, toutes distinctes | rejet |
| `answer` entier 0–3 | rejet |
| `sourceText` non tronqué (finit par `. ! ? » "`) | rejet |
| `sourceText` présent **littéralement** dans `section.content` | rejet (ancrage KO) |
| question de repérage visuel | rejet |
| référence juridique absente du `sourceText` | rejet (anti-hallucination) |

Difficultés appliquées au seed (`seed-opus.ts`) :
`rappel→1, comprehension→2, application→3, analyse→4, cas_pratique→4, evaluation→5`.
