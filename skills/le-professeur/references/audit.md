# 🔍 Audit qualité

Analyse complète du pool de questions et production d'un rapport détaillé.

## Ce que ça produit

Un rapport structuré avec :
- **Score global** du pool (sur 100)
- **Questions problématiques** classées par sévérité (critique / moyen / faible)
- **Répartition Bloom** (rappel / compréhension / application)
- **Distribution par section**
- **Questions trop faciles** détectées
- **Distracteurs absurdes** détectés
- **Incohérences question/source** détectées

## Critères de notation (par question)

| Critère | Pénalité | Déclencheur |
|---------|----------|-------------|
| Distracteur absurde | -40 | Une option est hors-sujet, ridicule ou trop évidente (ex: "Nations Unies" dans une question de droit administratif français) |
| Question trop facile | -30 | La réponse est devinable sans connaître le cours (3 options absurdes, 1 seule plausible) |
| Explication faible | -20 | L'explication ne fait que répéter la réponse sans l'ancrer dans le texte |
| Distracteur hors-sujet | -15 | Un distracteur ne partage aucun thème avec la bonne réponse |
| Question piège mal formulée | -10 | Utilisation de "sauf", "n'est pas", "excepté" en début de phrase |
| Doublon | -30 | Question très similaire à une autre (similarité > 85%) |
| sourceText incohérent | -40 | Le sourceText ne correspond pas à la question ou à la réponse |
| Référence juridique | +10 (bonus) | L'explication cite un article, une loi, un décret |

## Niveaux de sévérité

- **Critique** (score < 40) : Question à supprimer ou réécrire entièrement
- **Moyen** (score 40-70) : Question à améliorer (distracteurs, formulation)
- **Faible** (score 70-85) : Question acceptable mais perfectible
- **Excellent** (score > 85) : Question de niveau concours

## Format du rapport

```markdown
# 📊 Rapport d'audit — [date]

## Score global : XX/100

### Questions critiques (X)
- [Q] ... → Problème : ...

### Questions à améliorer (X)
- [Q] ... → Suggestion : ...

### Répartition
- Rappel : X (X%)
- Compréhension : X (X%)
- Application : X (X%)

### Distribution par section
- Section A : X questions
- Section B : X questions
```

## Ce qui fait le succès de l'audit

- **Zéro faux positif** — ne signale que les vrais problèmes
- **Raisons explicites** — chaque problème est expliqué avec le critère qui a déclenché
- **Priorisation claire** — les questions critiques sont listées en premier
- **Actionnable** — chaque problème peut être corrigé
