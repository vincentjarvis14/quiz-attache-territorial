# ⏳ Détection d'obsolescence

Repère les questions basées sur des lois, décrets, seuils ou jurisprudences potentiellement obsolètes.

## Principe

Le droit administratif et territorial évolue rapidement (réformes territoriales, lois de décentralisation, nouveaux codes). Une question basée sur une loi abrogée ou un seuil modifié est pire qu'inutile — elle désinforme les candidats.

## Indices d'obsolescence

### 1. Dates de lois et décrets
- Loi NOTRe (2015) → toujours en vigueur mais des dispositions ont été modifiées
- Loi MAPTAM (2014) → idem
- Loi 3DS (2022) → récente, à vérifier
- Loi de programmation 2018-2022 pour la justice → vérifier si les mesures sont entrées en vigueur
- Décret n°2015-510 → vérifier s'il a été modifié

### 2. Seuils et montants
- Seuils de population pour les communes (500, 1000, 3500, etc.) → vérifier les seuils actuels
- Montants d'indemnités → vérifier les barèmes en vigueur
- Plafonds de dépenses → vérifier l'indexation

### 3. Structures administratives
- Tribunaux de grande instance → fusionnés en tribunaux judiciaires (2020)
- Intercommunalités → vérifier les seuils de création
- Régions → vérifier le nombre actuel (fusion 2016)

### 4. Réformes récentes
- Loi Engagement et Proximité (2019)
- Loi de décentralisation différenciée (2022)
- Réforme de la fonction publique (2019)
- Loi de transformation de la fonction publique

## Méthode de détection

1. **Scanner** les questions pour les mots-clés : dates de lois, numéros de décrets, seuils, montants
2. **Vérifier** si la référence est toujours d'actualité (basé sur la connaissance du LLM)
3. **Signaler** les questions potentiellement obsolètes avec le niveau de risque :
   - 🔴 **Obsolète confirmé** — loi abrogée, structure supprimée, seuil modifié
   - 🟡 **À vérifier** — réforme récente, date proche, incertitude
   - ⚪ **Information** — mention d'une date qui pourrait devenir obsolète

## Format de sortie

```markdown
### Question : [énoncé]

⚠️ Risque : 🟡 À vérifier
🔗 Référence : Loi NOTRe (2015)
📝 Explication : La question mentionne les seuils de l'intercommunalité fixés par la loi NOTRe. Vérifier si les seuils ont été modifiés depuis.
💡 Action : Consulter la version actualisée du CGCT.
```
