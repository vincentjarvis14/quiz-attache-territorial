# 📋 Audit multi-agents — `_archive/demo-bmad/index.html`

**Date :** 18/05/2026  
**Fichiers audités :** `_archive/demo-bmad/index.html`, `_archive/demo-bmad/style.css`, `_archive/demo-bmad/app.js`  
**Agents participants :** Mary, John, Winston, Amelia, Sally, Paige  
**Mode :** Party Mode BMAD — agents indépendants

---

## 📊 Mary — Business Analyst

### Message sur l'apport de l'IA
Clair mais pas percutant. Le lien « problème → solution » est implicite — on ne décrit jamais le processus *sans* IA, ce qui affaiblit le contraste. Le terme « BMAD Builder » n'est pas défini pour un non-initié.

### Métriques
Pertinentes mais contextualisation à renforcer. Les tooltips sont excellents (transparence des hypothèses), mais le gain de 68% (80h→25h) est caché au survol alors que c'est la métrique la plus convaincante. Pas de benchmark pour « 50+ questions » (est-ce suffisant pour un concours ?).

### Structure narrative
Progression logique (Hero → Stats → Équipe → Professeur → Timeline → Résultats) mais déséquilibrée. La section Équipe arrive trop tôt (avant qu'on sache ce que le projet a produit). La Timeline est trop technique. Le Filetree est un overkill pour le message principal.

### Informations manquantes
- Pas de description du « avant » (processus sans IA)
- Pas de témoignage utilisateur
- Pas de mention du coût (API, tokens)
- Pas de « prochaines étapes » pour le visiteur

### Public cible (professeur)
Comprendra la valeur démontrée, mais risque de se perdre dans la technicité. Le message « l'IA m'a aidé à coder plus vite » est clair, mais « voici comment tu peux le reproduire » est absent.

### 🎯 3 améliorations concrètes
1. **Ajouter une section « Sans IA vs Avec IA »** — un comparatif visuel (tableau ou avant/après) qui rend le contraste tangible
2. **Rendre le gain de 68% visible sans survol** — c'est la métrique la plus forte, elle doit être dans le texte principal
3. **Ajouter un « Parcours de reproduction »** — 3 étapes simples pour qu'un professeur puisse imaginer appliquer la même méthode à son projet

---

## 📋 John — Product Manager

### Parcours narratif
Le fil Hero → Chiffres → Équipe → Deep Dive → Timeline → Résultats → CTA est logique mais le point d'entrée est problématique : le Hero raconte une histoire personnelle ("Comment l'IA *m'accompagne*") au lieu de vendre une promesse produit ("BMAD vous fait développer 3× plus vite"). Le badge "Projet pédagogique" saborde d'entrée la crédibilité.

### Jobs-to-be-done du visiteur
Partiellement satisfaits. La preuve par l'exemple (chiffres, timeline) répond à "est-ce que ça marche ?". Mais "est-ce que je peux l'utiliser facilement ?" et "est-ce que ça vaut le coup pour *mon* projet ?" restent sans réponse. Pas de chemin d'adoption visible.

### Proposition de valeur
Floue dans le Hero. Le titre est un titre de blog, pas un headline de landing. Le visiteur doit lire jusqu'aux chiffres (section 2) pour comprendre le *quoi*. Trop tard.

### Frictions de navigation
- Ancres HUD sans scroll smoothing, pas d'highlight de section active
- Tooltips stats inaccessibles au mobile (hover-only)
- Filetree (meilleure preuve de crédibilité technique) arrive après le CTA — beaucoup de visiteurs ne la verront jamais

### CTA final
Correct mais pas assez motivant. "Prêt à voir le résultat ?" est passif. Le CTA devrait être "Crée ton propre quiz avec BMAD" ou "Télécharge le template".

### 🎯 3 problèmes produit à corriger
1. **Hero à réécrire** — remplacer le récit personnel par une promesse de valeur claire et un sous-titre qui explique *pour qui* et *pourquoi*
2. **Ajouter une section "Comment faire la même chose"** — 3 étapes concrètes pour reproduire l'approche (pas besoin de tout le framework)
3. **Réorganiser les sections** — déplacer le Filetree avant le CTA, et la section Équipe après la Timeline (quand on sait déjà ce que les agents ont produit)

---

## 🏗️ Winston — System Architect

### Forces
- Séparation HTML/CSS/JS propre et bien organisée
- Design system complet via variables CSS (couleurs, typographie, espacement, radius)
- Sémantique HTML correcte : `<nav>`, `<footer>`, `aria-modal`, `role="dialog"`
- `'use strict'` en JS, IntersectionObserver pour la navigation et les animations au scroll
- Responsive design avec 4 breakpoints (1024px, 768px, 480px)

### 🔴 Problème critique #1 — Surcharge Google Fonts (3 familles)
Inter + EB Garamond + JetBrains Mono = ~150-200 KB. JetBrains Mono n'est utilisé que dans les blocs de code ; la system font `ui-monospace, monospace` est déjà en fallback. Supprimer JetBrains Mono de la requête Google Fonts économise ~50-70 KB et ~500ms de rendu initial.

### 🔴 Problème critique #2 — Données inline dans le JS
Les objets `AGENTS` (237 lignes) et `FILETREE_DATA` (335 lignes) sont codés en dur dans `app.js`, ce qui couple données et logique et gonfle le fichier à 966 lignes. Externaliser dans des fichiers JSON séparés (`data/agents.json`, `data/filetree.json`) et les charger via `fetch()`.

### 🔴 Problème critique #3 — Pas de fallback JS
Si JavaScript est désactivé ou ne charge pas :
- Le filetree reste vide (pas de message d'erreur)
- Les animations au scroll figent le contenu (opacity:0 via CSS inline)
- La modale agent est inaccessible
- Le HUD constellation ne fonctionne pas
- Aucun `<noscript>` n'informe l'utilisateur

### Autres points
- **Performance** : 3 requêtes Google Fonts + 1 CSS + 1 JS = 5 requêtes au load. Acceptable mais optimisable.
- **Accessibilité** : Les tooltips stats sont en `::after` CSS — inaccessibles au clavier et aux lecteurs d'écran.
- **Responsive** : Le filetree reste en 2 colonnes même à 480px. Le HUD constellation est utilisable mais les labels sont tronqués.

---

## 💻 Amelia — Senior Software Engineer

### 🔴 BUG CRITIQUE #1 — `resolveData()` corrompt la navigation (app.js:621-640)
La ligne `if (data.children) data = data.children` mute la référence de l'objet de données en cours de boucle. La logique fonctionne *par accident* pour les chemins à 2 niveaux mais est structurellement incorrecte. Si un nœud a une propriété `children` qui n'est pas un sous-arbre, le code plante silencieusement.

### 🔴 BUG CRITIQUE #2 — `hasVisibleChildren()` ignore l'état plié (app.js:643-645)
Retourne `true` même si tous les enfants sont masqués par un ancêtre plié → le toggle `▼` s'affiche alors qu'aucun enfant n'est visible.

### 🟡 Problème — Tableau `items` hardcodé (app.js:587-615)
Copie manuelle de la hiérarchie de `FILETREE_DATA`. Couplage fort : toute modification des données nécessite une modification synchrone du tableau. Garantie d'incohérence à la première évolution.

### 🟡 Problème — Couplage HTML/JS par index (app.js:857-865)
`Object.keys(AGENTS)[index]` suppose que l'ordre HTML des `.team-card` correspond exactement à l'ordre de définition dans `AGENTS`. Fragile : un réordonnancement des cartes dans le HTML casse la modale sans erreur visible.

### 🟡 Problème — Pas de focus trap dans la modale
La modale agent n'a pas de focus trap. Un utilisateur clavier peut tabber en dehors de la modale et interagir avec le fond. La fermeture par Escape est présente mais pas de restauration du focus à l'ouverture.

### 🟡 Problème — `showDetail()` vulnérable aux données manquantes
Si une clé de `FILETREE_DATA` est absente ou qu'une propriété est `undefined`, le rendu plante avec une erreur silencieuse. Aucun `?.` (optional chaining) ni fallback.

### 🎯 3 bugs critiques à corriger
1. **`resolveData()` — corruption de référence** (app.js:621-640)
2. **`hasVisibleChildren()` — état plié ignoré** (app.js:643-645)
3. **Pas de `<noscript>` ni de fallback JS** — le site est inutilisable sans JS

---

## 🎨 Sally — UX Designer

### Design system
Palette crème/corail/foncé magnifique, variables CSS impeccables, typographie cohérente (EB Garamond + Inter + JetBrains Mono). **Problème majeur** : les contrastes WCAG AA ne sont pas respectés — `--on-dark-soft` (#a09d96) et `--muted` (#6c6a64) sont systématiquement trop clairs (ratios ~2.8:1 à 3.8:1, loin du 4.5:1 requis).

### Responsive
3 breakpoints (1024px, 768px, 480px) bien gérés pour le layout général. **Mais le filetree reste en 2 colonnes même sur mobile** — inutilisable à 375px.

### Navigation HUD
Conceptuellement génial (IntersectionObserver + nœuds actifs), mais placé en bas à droite hors du flux de lecture naturel. La modale agent est très bien conçue (animation, structure, contenu riche).

### Animations
Fluides et justifiées (fadeInUp hero, hover cards, modalSlideUp). **Problème critique** : les animations au scroll utilisent du CSS inline avec `opacity: 0` par défaut — si JS ne charge pas, tout le contenu reste invisible.

### Filetree interactif
La feature la plus réussie — visuellement claire, badges colorés, indentation, détails riches. Mais le panneau de détails est trop dense (6 sections) et le texte en `#a09d96` est difficile à lire.

### 🎯 3 problèmes UX à corriger
1. **Contrastes insuffisants** — `--on-dark-soft` (#a09d96) et `--muted` (#6c6a64) doivent être assombris pour atteindre le ratio 4.5:1
2. **Filetree non responsive** — passer en colonne unique en dessous de 768px
3. **Fallback JS manquant** — si JS ne charge pas, tout le contenu reste invisible (opacity:0). Ajouter une classe `.no-js` et un état visible par défaut

---

## 📚 Paige — Technical Writer

### Qualité rédactionnelle
Bien écrit, sans fautes d'orthographe ni de grammaire. Le ton est enthousiaste et globalement adapté au public cible (enseignants, cadres territoriaux).

### Structure narrative
Logique (Hero → Chiffres → Équipe → Professeur → Timeline → Résultats → Filetree → CTA). Mais quelques déséquilibres : la section Équipe est trop longue par rapport à son importance narrative, et le Filetree (pourtant très réussi) arrive trop tard.

### Clarté technique
**Problème majeur** : le terme « BMAD Builder » n'est jamais défini. Le visiteur ne sait pas si c'est un logiciel, un plugin, une bibliothèque ou un concept. Ajouter 1-2 phrases explicatives dans le Hero ou la section Chiffres.

### Ton et voix
Adapté mais quelques hyperboles qui affaiblissent la crédibilité :
- « impossible à maintenir manuellement » → hyperbole inutile
- « un processus qui aurait pris des jours » → vague, préférer « ~3 jours de travail manuel »
- « zéro framework, zéro dépendance » → répété 4 fois dans la page

### Cohérence
- **Incohérence « clone Duolingo » (ligne 67) vs « design system Duolingo » (ligne 439)** — le premier est trop fort et contredit le second. Remplacer « clone » par « inspiré de » ou « sur le modèle de ».
- **Confusion agent vs skill** — 10 agents présentés comme une « équipe », mais un seul « skill sur mesure ». La hiérarchie n'est pas claire.

### 🎯 3 problèmes de contenu à corriger
1. **Définir BMAD Builder dès le Hero** — 1-2 phrases qui expliquent ce que c'est
2. **Clarifier agent vs skill** — ajouter un encart dans la section Équipe
3. **Remplacer « clone Duolingo » par « inspiré de Duolingo »** — pour la crédibilité

---

## 📊 Synthèse consolidée — Priorités d'action

### 🔴 Critique (à corriger immédiatement)
| # | Problème | Agent | Gravité |
|---|----------|-------|---------|
| 1 | `resolveData()` corrompt la référence des données (app.js:621-640) | Amelia | 🔴 Bloquant |
| 2 | `hasVisibleChildren()` ignore l'état plié (app.js:643-645) | Amelia | 🔴 Bloquant |
| 3 | Pas de fallback JS — site invisible sans JS | Winston, Sally | 🔴 Bloquant |
| 4 | Contrastes WCAG AA non respectés (`--on-dark-soft`, `--muted`) | Sally | 🔴 Accessibilité |

### 🟡 Important (à corriger rapidement)
| # | Problème | Agent |
|---|----------|-------|
| 5 | Surcharge Google Fonts (3 familles → 2 suffisent) | Winston |
| 6 | Données inline dans le JS (AGENTS, FILETREE_DATA) | Winston, Amelia |
| 7 | Pas de focus trap dans la modale agent | Amelia |
| 8 | Filetree non responsive en dessous de 768px | Sally |
| 9 | Hero à réécrire (promesse de valeur floue) | John, Mary |
| 10 | BMAD Builder jamais défini | Paige |

### 🟢 Amélioration (bonus)
| # | Problème | Agent |
|---|----------|-------|
| 11 | Ajouter section « Sans IA vs Avec IA » | Mary |
| 12 | Remplacer « clone Duolingo » par « inspiré de » | Paige |
| 13 | Ajouter section « Comment reproduire » | John |
| 14 | Tooltips stats inaccessibles au clavier | Winston, Sally |
| 15 | Tableau `items` hardcodé → génération automatique | Amelia |

---

*Rapport généré par Party Mode BMAD — 6 agents indépendants*
