# 📚 Enseignement (évolutif)

Permet à l'utilisateur d'ajouter de nouveaux critères de qualité au Professeur.

## Principe

Le Professeur est livré avec des critères de qualité standards. Mais le droit territorial évolue, les concours changent, et l'utilisateur peut vouloir ajouter ses propres règles. Cette capacité permet d'étendre les compétences du Professeur sans modifier ses fichiers sources.

## Comment ça marche

L'utilisateur dit : "Apprends ce nouveau critère : [description]"

Le Professeur :
1. **Comprend** le nouveau critère
2. **L'enregistre** dans sa mémoire (MEMORY.md) sous la section "Critères appris"
3. **L'applique** lors des audits suivants

## Exemples de nouveaux critères

> "Apprends que la loi 3DS de 2022 a modifié les compétences des régions en matière de transport"

> "Ajoute un critère : une question sur le CSE doit mentionner la date de 2020 pour être à jour"

> "Apprends que le seuil de 3500 habitants pour les communes a été modifié par la loi Engagement et Proximité"

## Format d'enregistrement

Chaque critère appris est stocké dans MEMORY.md :

```markdown
### Critère appris : [nom du critère]
- **Date d'ajout** : [date]
- **Description** : [description complète]
- **Type** : obsolescence | coherence | difficulte | precision
- **Déclencheur** : [mot-clé ou pattern qui active ce critère]
- **Action** : [ce que le Professeur doit faire quand le critère est déclenché]
```

## Ce qui fait le succès de l'enseignement

- **Flexibilité** — l'utilisateur peut adapter le Professeur à l'évolution du droit
- **Persistance** — les critères appris survivent entre les sessions
- **Transparence** — l'utilisateur peut lister les critères appris à tout moment
- **Non-destructif** — les critères appris ne modifient pas les fichiers du skill
