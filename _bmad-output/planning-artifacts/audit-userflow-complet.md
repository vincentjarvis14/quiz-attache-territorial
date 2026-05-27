 # 📊 Audit Complet — Userflow Quiz Attaché Territorial

> Généré le 19/05/2026
> Audit multi-agents : UX/UI + Architecture JS + Design System CSS

---

## Résumé exécutif

| Catégorie | Critique | Moyen | Mineur | Total |
|-----------|----------|-------|--------|-------|
| UX / Userflow | 2 | 4 | 3 | 9 |
| Architecture JS | 4 | 8 | 5 | 17 |
| Design System CSS | 1 | 3 | 4 | 8 |
| **Total** | **7** | **15** | **12** | **34** |

---

## 🔴 PROBLÈMES CRITIQUES (7)

### 1. [UX] Bouton "Voir les améliorations du 17/05" obsolète
- **Fichier** : `index.html` ligne ~130
- **Problème** : Date hardcodée ("17/05") et contenu du changelog mentionne "Session du 18 mai 2026". Devenu obsolète.
- **Suggestion** : Remplacer par un bouton dynamique "📋 Nouveautés" qui affiche le contenu du changelog mis à jour automatiquement, ou supprimer le bouton.

### 2. [UX] Aucune transition visuelle entre les écrans
- **Fichier** : `css/style.css` (animation `fadeSlideIn` existe mais pas utilisée entre les écrans)
- **Problème** : Le changement d'écran est instantané, ce qui peut désorienter l'utilisateur.
- **Suggestion** : Ajouter une transition CSS sur `.screen.active` avec `animation: fadeSlideIn 0.25s var(--ease) both;` (déjà présent mais vérifier qu'elle s'applique correctement).

### 3. [JS] storage.js inutilisé (dead code)
- **Fichier** : `js/storage.js`
- **Problème** : Le module `Storage` est défini mais jamais importé/utilisé. La persistance est gérée par `state.js`.
- **Suggestion** : Supprimer `js/storage.js` et sa référence dans `index.html`.

### 4. [JS] Incohérence get()/set() des copies d'objets
- **Fichier** : `js/state.js` lignes ~65-80
- **Problème** : `get()` retourne une copie (nouvelle référence), mais `set()` compare par référence (`old === value`). Toute copie modifiée puis repassée à `set()` déclenche une notification inutile.
- **Suggestion** : Remplacer la comparaison par référence par une comparaison en profondeur (`JSON.stringify`) ou documenter que les setters doivent recevoir des valeurs primitives.

### 5. [JS] Clonage DOM fragile pour nettoyer les listeners
- **Fichier** : `js/app.js` lignes ~100-120 (`bindQuizEvents`, `bindResultsEvents`)
- **Problème** : `cloneNode(true)` + `replaceChild()` est un workaround fragile qui détruit l'état DOM, crée des fuites mémoire et cache le vrai problème (accumulation de listeners).
- **Suggestion** : Remplacer par de la délégation d'événements sur un conteneur persistant (ex: `document.getElementById('screen-quiz')`).

### 6. [JS] XSS potentiel par injection HTML non échappée
- **Fichier** : `js/ui.js` (`renderThemes`, `renderOptions`, `openSourceModal`)
- **Problème** : Des données (`ch.title`, `opt`, `kw.term`) sont injectées dans `innerHTML` sans `escapeHtml()`. Les `data-*` attributes ne sont pas échappés non plus.
- **Suggestion** : Appliquer `escapeHtml()` sur toutes les données injectées dans `innerHTML`. La fonction `escapeHtml()` existe déjà dans `ui.js` mais n'est pas utilisée partout.

### 7. [CSS] Ombres 3D incohérentes entre boutons
- **Fichier** : `css/style.css`
- **Problème** : 
  - `.btn-green:hover` → `box-shadow: 0 6px 0` (décalage Y augmenté à 6px au lieu de 4px)
  - `.btn-continue-correct` et `.btn-continue-incorrect` n'ont **pas de style hover** avec soulèvement 3D
  - `.keyword-chip` utilise `box-shadow: 0 2px 0` au lieu de `0 4px 0`
- **Suggestion** : Uniformiser toutes les ombres 3D : `0 4px 0` en état normal, `0 6px 0` en hover, `none` en active.

---

## 🟠 PROBLÈMES MOYENS (15)

### 8. [UX] Mode Challenge : perte de vies pas assez visible
- **Fichier** : `js/app.js` (handleVerify)
- **Problème** : Quand l'utilisateur perd une vie en mode Challenge, il n'y a pas d'animation/feedback visuel sur les cœurs. La perte de vie est silencieuse.
- **Suggestion** : Ajouter une animation "shake" sur le cœur perdu, un message toast "💔 -1 vie", ou un flash rouge.

### 9. [UX] Modale source : double clic nécessaire pour ouvrir
- **Fichier** : `js/ui.js` (openSourceModal)
- **Problème** : Les mots-clés dans le bloc source (après vérification) ouvrent la modale, mais l'utilisateur doit d'abord comprendre que ce sont des boutons cliquables. Pas d'indice visuel fort.
- **Suggestion** : Ajouter un tooltip "Cliquez pour voir le contexte" au survol, ou un indicateur visuel (icône 🔍, flèche).

### 10. [UX] Pas de message si aucune question disponible
- **Fichier** : `js/app.js` (startQuiz)
- **Problème** : Si `buildQueue()` retourne un tableau vide, `startQuiz()` fait un `return` silencieux. L'utilisateur ne voit rien.
- **Suggestion** : Afficher un message d'erreur ou une notification toast.

### 11. [UX] Rafraîchissement pendant le quiz → perte de progression
- **Fichier** : `js/state.js`
- **Problème** : L'état de la session (index, score, queue) n'est pas persisté. Un rafraîchissement renvoie à l'accueil.
- **Suggestion** : Sauvegarder l'état de la session dans `sessionStorage` et le restaurer au chargement.

### 12. [JS] normalizeText() fragile sur l'Unicode
- **Fichier** : `js/ui.js` (normalizeText)
- **Problème** : `.toLowerCase()` sans locale, couverture incomplète des caractères Unicode (accents, ligatures).
- **Suggestion** : Utiliser `.toLocaleLowerCase('fr-FR')` et normaliser les caractères Unicode avec `String.prototype.normalize('NFD')`.

### 13. [JS] extractContext() peut échouer sur des textes longs
- **Fichier** : `js/ui.js` (extractContext)
- **Problème** : La recherche de correspondance partielle (mots communs > 3 caractères) peut être lente sur des textes très longs et produire des faux positifs.
- **Suggestion** : Ajouter un seuil de confiance minimum (ex: 70% de mots communs) et un timeout.

### 14. [JS] Pas de validation du JSON chargé
- **Fichier** : `js/app.js` (fetch quiz_pool.json)
- **Problème** : Aucune validation de la structure du JSON. Si le format change, l'app crash silencieusement.
- **Suggestion** : Ajouter une validation basique (présence de `chapters`, `questions`, `id`, `q`, `options`, `answer`).

### 15. [JS] Pas de fallback si fetch échoue après le premier essai
- **Fichier** : `js/app.js`
- **Problème** : Si le fetch échoue, un message d'erreur s'affiche avec un bouton "Réessayer" qui recharge la page. Pas de fallback gracieux.
- **Suggestion** : Ajouter un cache localStorage du dernier pool chargé avec succès.

### 16. [JS] Les getters retournent des copies → perte de référence
- **Fichier** : `js/state.js`
- **Problème** : `get('queue')` retourne une copie du tableau. Si on modifie cette copie, l'état interne n'est pas mis à jour. Peut causer des bugs subtils.
- **Suggestion** : Documenter que les getters sont read-only et que les mutations doivent passer par `set()` ou `setAll()`.

### 17. [JS] Pas de mécanisme de réessai pour le chargement du JSON
- **Fichier** : `js/app.js`
- **Problème** : Si le réseau est lent ou instable, un seul échec de fetch bloque l'application.
- **Suggestion** : Ajouter un mécanisme de retry (3 tentatives avec délai exponentiel).

### 18. [CSS] Pas de `prefers-reduced-motion`
- **Fichier** : `css/style.css`
- **Problème** : Les animations (bounce, shake, slideUp, fadeSlideIn) ne sont pas désactivées pour les utilisateurs qui préfèrent réduire les mouvements.
- **Suggestion** : Ajouter `@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; } }`

### 19. [CSS] Pas de breakpoint pour les très petits écrans (< 360px)
- **Fichier** : `css/style.css`
- **Problème** : Le seul breakpoint est à 640px. Sur un iPhone SE (375px), les espacements peuvent être trop grands.
- **Suggestion** : Ajouter un breakpoint à 360px avec des espacements réduits.

### 20. [CSS] Bouton gris tertiaire — padding incohérent
- **Fichier** : `css/style.css`
- **Problème** : `.btn-gray` utilise `padding: calc(var(--space-xl) - 2px)` pour compenser la bordure de 2px. Les autres boutons n'ont pas cette compensation.
- **Suggestion** : Uniformiser en utilisant `box-sizing: border-box` (déjà présent) et des paddings identiques.

### 21. [CSS] Classes CSS inutilisées
- **Fichier** : `css/style.css`
- **Problème** : Plusieurs classes ne sont plus référencées dans le HTML ou le JS : `.btn-icon`, `.btn-auto`, `.btn-lg`, `.empty-state`, `.source-extract-inner`, `.source-extract-ctx`, `.source-extract-hl`, `.source-section-full`, `.modal-empty`, `.results-title.perfect`, `.results-title.good`, `.results-title.retry`, `.shake`, `.pop-in`, `.pulse`, `.source-block-enter`.
- **Suggestion** : Supprimer les classes inutilisées pour réduire la taille du CSS.

### 22. [CSS] Animation `fadeSlideIn` appliquée deux fois
- **Fichier** : `css/style.css`
- **Problème** : `.screen.active` a déjà `animation: fadeSlideIn 0.25s var(--ease) both;` mais l'écran d'accueil a aussi `animation: fadeSlideIn` via la classe `.screen.active`. Pas de conflit mais redondant avec l'animation de la modale.
- **Suggestion** : Vérifier que l'animation ne cause pas de flash au changement d'écran.

---

## 🔵 PROBLÈMES MINEURS (12)

### 23. [UX] Pas de son/feedback audio
- **Problème** : Aucun retour audio (succès/échec). Pourrait améliorer l'engagement.
- **Suggestion** : Ajouter des sons optionnels via Web Audio API.

### 24. [UX] Pas de confettis sur score > 80%
- **Problème** : Les scores élevés ne sont pas célébrés visuellement.
- **Suggestion** : Ajouter une animation de confettis (CSS ou canvas) quand le score dépasse 80%.

### 25. [UX] Pas d'indicateur de chargement pour la modale source
- **Problème** : Si la section est longue, l'ouverture de la modale peut être lente sans feedback.
- **Suggestion** : Ajouter un état de chargement dans la modale.

### 26. [JS] Pas de tests unitaires pour ui.js
- **Fichier** : `tests/`
- **Problème** : Seul `state.js` a des tests. Les fonctions de rendu (`ui.js`) ne sont pas testées.
- **Suggestion** : Ajouter des tests pour les fonctions critiques (`extractContext`, `highlightKeywordsInHtml`, `escapeHtml`).

### 27. [JS] Fonctions fléchées vs fonctions nommées
- **Fichier** : `js/ui.js`
- **Problème** : Mélange de fonctions fléchées et de fonctions nommées. Les fonctions fléchées ne sont pas hoistées, ce qui peut causer des erreurs si l'ordre change.
- **Suggestion** : Uniformiser en fonctions nommées pour la cohérence.

### 28. [JS] Pas de gestion d'erreur pour localStorage
- **Fichier** : `js/state.js`
- **Problème** : `_persistSeenIds()` a un try/catch, mais `loadSeenIds()` aussi. En mode privé, localStorage peut lever des exceptions.
- **Suggestion** : Déjà géré, mais ajouter un log console.error pour le débogage.

### 29. [JS] Pas de versioning du cache JSON
- **Fichier** : `js/app.js`
- **Problème** : Si le fichier JSON change (nouvelles questions), le navigateur peut servir une version en cache.
- **Suggestion** : Ajouter un paramètre de version dans l'URL (`quiz_pool.json?v=2`).

### 30. [CSS] Police Nunito chargée depuis Google Fonts → dépendance externe
- **Fichier** : `css/style.css`
- **Problème** : Dépendance à Google Fonts. Si le CDN est bloqué (Chine, mode avion), la police de secours s'affiche.
- **Suggestion** : Ajouter une police de secours plus proche (ex: `'Varela Round'`) et/ou self-hoster Nunito.

### 31. [CSS] Pas de mode sombre (dark mode)
- **Fichier** : `css/style.css`
- **Problème** : Pas de support du `prefers-color-scheme: dark`.
- **Suggestion** : Ajouter un thème dark avec des variables CSS alternatives.

### 32. [CSS] Scrollbar personnalisée seulement pour WebKit
- **Fichier** : `css/style.css`
- **Problème** : `::-webkit-scrollbar` ne fonctionne que sur Chrome/Safari. Firefox et Edge ne sont pas couverts.
- **Suggestion** : Ajouter `scrollbar-width: thin` pour Firefox.

### 33. [CSS] Pas de style pour les états "focus" sur les chips
- **Fichier** : `css/style.css`
- **Problème** : Les `.theme-chip`, `.qty-btn`, `.mode-btn` n'ont pas de style `:focus-visible`.
- **Suggestion** : Ajouter `outline: 3px solid var(--blue)` sur `:focus-visible` pour tous les éléments interactifs.

### 34. [CSS] Animation bounce sur la chouette des résultats non accessible
- **Fichier** : `css/style.css`
- **Problème** : L'animation `bounce` sur `.results-owl` n'a pas de `prefers-reduced-motion`.
- **Suggestion** : Ajouter la media query.

---

## 📋 PLAN D'ACTION RECOMMANDÉ

### Priorité Haute (à faire immédiatement)
1. 🔴 Supprimer `storage.js` (dead code)
2. 🔴 Remplacer le clonage DOM par de la délégation d'événements
3. 🔴 Échapper toutes les injections HTML avec `escapeHtml()`
4. 🔴 Uniformiser les ombres 3D des boutons
5. 🟠 Rendre le bouton changelog dynamique (pas de date hardcodée)

### Priorité Moyenne (prochaine itération)
6. 🔴 Ajouter une validation du JSON chargé
7. 🟠 Ajouter `prefers-reduced-motion`
8. 🟠 Ajouter un feedback visuel pour la perte de vies
9. 🟠 Sauvegarder l'état de session dans sessionStorage
10. 🟠 Ajouter un breakpoint pour très petits écrans

### Priorité Basse (améliorations continues)
11. 🔵 Supprimer les classes CSS inutilisées
12. 🔵 Ajouter des tests unitaires pour ui.js
13. 🔵 Ajouter le mode sombre
14. 🔵 Ajouter des confettis sur score > 80%
15. 🔵 Ajouter des sons optionnels

---

*Audit réalisé par les agents BMAD : UX/UI Analyst, Architecture JS Reviewer, Design System CSS Expert*
