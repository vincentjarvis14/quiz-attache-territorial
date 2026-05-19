# 🔗 Vérification de cohérence

Vérifie que la réponse correcte et le sourceText sont cohérents entre eux et avec la question.

## Principe

Une question peut avoir une réponse correcte et un sourceText présent dans la section, mais le sourceText peut ne pas justifier la réponse. C'est le bug critique que Le Professeur doit détecter.

## Types d'incohérences

### 1. sourceText ne justifie pas la réponse
Le sourceText parle d'autre chose. Exemple :
- Question : "Une association sportive est une personne morale de quel type ?"
- Réponse : "Personne morale de droit privé"
- sourceText : "L'État est donc une personne morale souveraine..."
- → ❌ Le sourceText parle de l'État, pas des associations

### 2. sourceText contredit la réponse
Le sourceText dit l'inverse de la réponse donnée comme correcte.

### 3. sourceText trop vague
Le sourceText est trop général et ne permet pas de déduire la réponse spécifique.

### 4. Question et sourceText déconnectés
La question porte sur un sujet et le sourceText sur un autre. C'est le cas le plus fréquent des bugs de matching.

## Méthode de vérification

Pour chaque question, vérifier :

1. **Le sourceText mentionne-t-il le concept clé de la question ?**
   - Question sur les associations → le sourceText doit contenir "association"
   - Question sur l'État → le sourceText doit contenir "État"

2. **Le sourceText supporte-t-il la réponse donnée ?**
   - Si la réponse est "droit privé", le sourceText doit dire que les associations sont de droit privé
   - Si la réponse est "souveraineté", le sourceText doit parler de souveraineté

3. **Y a-t-il un meilleur passage dans la section ?**
   - Si oui, le signaler comme sourceText alternatif

## Format de sortie

```markdown
### Question : [énoncé]
✅ Réponse correcte : [réponse]
🔗 sourceText actuel : "[extrait]"

🔴 Problème : [description de l'incohérence]
✅ sourceText attendu : "[meilleur extrait de la section]"
📚 Explication : [pourquoi l'autre extrait est meilleur]
```

## Ce qui fait le succès de la vérification

- **Précision** — ne pas signaler de faux positifs (quand le sourceText est correct)
- **Utilité** — proposer le bon sourceText alternatif
- **Pédagogie** — expliquer pourquoi l'ancien sourceText ne convenait pas
