# 🏆 Plan Final Consolidé — Patch Correctif d'Excellence

> Issu du Conseil de Guerre BMAD — 19/05/2026
> Agents participants : Winston 🏗️, Sally 🎨, Amelia 💻, Luna 🎮

---

## Résumé des décisions collectives

| Agent | Décision clé |
|-------|-------------|
| 🏗️ **Winston** | Tests unitaires intégrés aux Lots 1-2 (pas en Lot 3). Dark mode + confetti → Phase 4. prefers-reduced-motion → Lot 1. |
| 🎨 **Sally** | Feedback perte de vie doit être émotionnel. État hors-ligne humain. Micro-delight sur bonnes réponses. |
| 💻 **Amelia** | P0 : vitest + eslint + prettier AVANT toute modif. `git tag pre-patch`. Chaque lot passe les tests. |
| 🎮 **Luna** | Confetti à 90% (pas 80%). Perte de vie : flash + shake + haptic. Timer persisté. Transitions animées. |

---

## ✅ Plan d'Exécution

### Phase 0 — Fondations (P0)
- [x] `git tag pre-patch`
- [x] `npm install -D vitest eslint prettier`
- [x] Écrire tests unitaires pour `ui.js`
- [x] `npm test && npm run lint` ✅

### Lot 1 — Stabilité & Sécurité
- [x] 1. Supprimer `storage.js` (dead code)
- [x] 2. Échapper toutes les injections HTML (`escapeHtml()`)
- [x] 3. Remplacer clonage DOM par délégation d'événements
- [x] 4. Uniformiser les ombres 3D des boutons
- [x] 5. Ajouter `prefers-reduced-motion`
- [x] 6. Rendre le bouton changelog dynamique
- [x] `npm test && npm run lint` ✅

### Lot 2 — Robustesse & UX
- [x] 7. Validation du JSON chargé (schéma strict)
- [x] 8. Cache localStorage fallback pour quiz_pool.json
- [x] 9. Feedback visuel perte de vies (shake + flash)
- [x] 10. Persistance session dans sessionStorage
- [x] 11. Micro-animation transition entre questions
- [x] `npm test && npm run lint` ✅

### Lot 3 — Polish & Accessibilité
- [x] 12. Supprimer classes CSS inutilisées
- [x] 13. Breakpoint < 380px (iPhone SE)
- [x] 14. État hors-ligne humain pour erreur de chargement
- [x] `npm test && npm run lint` ✅

### Phase 4 — Enhancement (optionnel)
- [ ] 15. Dark mode (`prefers-color-scheme`)
- [ ] 16. Confettis sur score ≥ 90%
- [ ] 17. Mode révision (revoir ses erreurs)

---

## Fichiers impactés

| Fichier | Phase | Modifications |
|---------|-------|---------------|
| `js/storage.js` | Lot 1 | Supprimé |
| `index.html` | Lot 1 | Ref storage.js supprimée, bouton changelog dynamique |
| `js/ui.js` | P0, Lot 1-3 | Tests, escapeHtml, feedback vies, transitions |
| `js/app.js` | Lot 1-2 | Délégation événements, validation JSON, cache pool |
| `css/style.css` | Lot 1-3 | Ombres, reduced-motion, classes inutilisées, breakpoint |
| `js/state.js` | Lot 2 | sessionStorage persist/restore |
| `tests/ui.test.js` | P0 | Nouveau fichier de tests |
| `package.json` | P0 | Nouveau (scripts test + lint) |
