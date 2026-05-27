# Design System Master File — Quiz Attaché Territorial

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Quiz Attaché Territorial
**Style:** Moderne, ludique adulte, glassmorphism, violet + émeraude
**Target:** Desktop-first (priorité), responsive tablet/mobile
**Mode:** Light only

---

## Global Rules

### Color Palette — Violet & Émeraude

| Role | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Primary | `#7C3AED` | `--color-primary` | Boutons, liens, accents principaux |
| On Primary | `#FFFFFF` | `--color-on-primary` | Texte sur fond primary |
| Secondary | `#10B981` | `--color-secondary` | Succès, bonnes réponses, badges verts |
| Accent/CTA | `#8B5CF6` | `--color-accent` | Hover, variantes secondaires |
| Background | `#FAF5FF` | `--color-background` | Fond général (violet très clair) |
| Surface | `#FFFFFF` | `--color-surface` | Cards, modals, sidebar |
| Foreground | `#1E1B4B` | `--color-foreground` | Texte principal (indigo très foncé) |
| Muted | `#F3E8FF` | `--color-muted` | Fond des sections secondaires |
| Border | `#E9D5FF` | `--color-border` | Bordures, séparateurs |
| Destructive | `#EF4444` | `--color-destructive` | Erreurs, mauvaises réponses |
| Warning | `#F59E0B` | `--color-warning` | Alertes, avertissements |
| Ring | `#7C3AED` | `--color-ring` | Focus rings |

### Typography

- **Heading Font:** Poppins (600-700) — https://fonts.google.com/specimen/Poppins
- **Body Font:** Inter (400-500) — https://fonts.google.com/specimen/Inter
- **Mood:** moderne, professionnel, lisible, engageant
- **Font scale:** 14px / 16px / 18px / 24px / 32px / 48px

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700&display=swap');
```

### Style: Glassmorphism Moderne

- Arrière-plans avec `backdrop-filter: blur(12px)` sur sidebar, modals, header
- Cards avec ombres douces et bordures subtiles `rgba(124, 58, 237, 0.1)`
- Coins arrondis `rounded-xl` (12px) pour les cards, `rounded-lg` (8px) pour les boutons
- Transitions en 200-300ms sur tous les éléments interactifs

### Effets clés
- `backdrop-filter: blur(8-16px)` sur éléments glassmorphiques
- Ombres : `shadow-md` sur cards, `shadow-lg` sur sidebar
- Hover : scale(1.02) + shadow augmentée sur cards cliquables
- Transitions douces : `transition-all duration-200`

---

## Composants

### Sidebar
- Fond blanc avec effet glassmorphism subtil
- Largeur `256px` (lg:w-64)
- Logo violet + émeraude
- Navigation items avec icônes lucide-react
- État actif : fond violet clair + texte violet
- Bouton déconnexion en bas, séparé

### Header (mobile)
- Fond blanc, hauteur 56px
- Menu hamburger (Sheet shadcn)
- Logo miniature

### Landing Page
- Hero avec gradient violet → indigo
- Cartes thèmes avec glassmorphism
- CTA boutons violet + émeraude
- Section features (3 colonnes desktop)

### Dashboard / Learn
- Grille 2 colonnes desktop (thèmes)
- Progress bar émeraude
- Sous-thèmes avec statuts (icônes statut)
- Cartes avec hover scale

### Page Sous-thème
- 2 modes de jeu : Libre (émeraude) / Challenge (violet)
- Cartes cliquables avec chevron

### Quiz / Lesson
- Header : bouton retour, progress bar, cœurs (Challenge)
- Options QCM : radio cards stylisées
- Feedback : vert (correct) / rouge (incorrect) avec explication
- Source PDF : section repliable bleue
- Écran de fin : score + pourcentage + boutons

### Auth (Sign-in / Sign-up)
- Design épuré, centré
- Fond gradient violet
- Card glassmorphism blanche

---

## Anti-Patterns (Ne PAS faire)

- ❌ Ne pas utiliser d'emojis comme icônes structurelles (utiliser lucide-react)
- ❌ Pas de dark mode
- ❌ Pas de mascotte / illustrations enfantines
- ❌ Pas de vert Duolingo (#58CC02)
- ❌ Pas de streaks / classement
- ❌ Éviter les animations excessives (>300ms)
- ❌ Pas de timer (sauf si optionnel plus tard)

---

## Checklist pré-livraison

- [ ] Pas d'emojis comme icônes (toujours lucide-react)
- [ ] `cursor-pointer` sur tous les éléments cliquables
- [ ] États hover avec transitions 150-300ms
- [ ] Contraste texte 4.5:1 minimum
- [ ] Focus states visibles pour navigation clavier
- [ ] Responsive : 375px, 768px, 1024px, 1440px
- [ ] Pas de contenu caché derrière la sidebar
- [ ] Pas de scroll horizontal
- [ ] Sons correct/incorrect joués sur réponse
- [ ] framer-motion pour les animations quiz
