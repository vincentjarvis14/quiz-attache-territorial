---
stepsCompleted: [1, 2]
inputDocuments:
  - docs/RAPPORT_CHEF_DE_PROJET.md
  - docs/PLAN_ACTION_UI_UX_2026.md
  - docs/design-system-duolingo.md
---

# UX Design Specification — Quiz Attaché Territorial

**Author:** Vincent Balu
**Date:** 2026-05-27

---

## 1. Découverte UX

### 1.1 Contexte du projet

Application de préparation au concours d'attaché territorial, construite selon la méthodologie **Vibe Coding** (Product Builder IA). Stack actuelle : Next.js 16 + Tailwind CSS v4 + DeepSeek API + RAG.

### 1.2 Problème à résoudre

Les candidats au concours d'attaché territorial doivent maîtriser un volume important de connaissances (18 PDF de cours). L'application doit leur permettre de :
- S'entraîner via des quiz interactifs
- Dialoguer avec leurs cours via un assistant IA (RAG)
- Suivre leur progression dans le temps
- Rester motivés grâce à la gamification

### 1.3 Utilisateurs cibles

| Persona | Description | Besoins spécifiques |
|---|---|---|
| **Candidat stressé** | Prépare le concours seul, manque de confiance | Feedback immédiat, mode chill, révisions ciblées |
| **Candidat méthodique** | Planifie ses révisions, aime les stats | Dashboard, historique, mode challenge |
| **Candidat pressé** | Peu de temps, besoin d'efficacité | Assistant RAG, quiz rapides, recommandations |

### 1.4 Principes UX directeurs

1. **Gamifié mais sérieux** — l'aspect jeu motive sans infantiliser
2. **Mobile-first** — conçu pour les révisions dans les transports
3. **Feedback instantané** — chaque action a une réponse visuelle claire
4. **Accessible** — WCAG AA, dark mode, reduced motion
5. **IA transparente** — l'assistant montre ses sources

---

## 2. Design System Hybride

### 2.1 Philosophie

Fusion entre **Duolingo** (gamification, couleurs vives, pédagogie) et **Untitled UI** (professionnalisme, grille, composants). Le résultat : une interface **sérieuse mais pas austère, ludique mais pas enfantine**.

### 2.2 Palette de couleurs

```css
/* Couleurs primaires — inspirées Duolingo */
--color-green:        #58CC02;   /* Actions, succès, bouton principal */
--color-green-dark:   #58A700;   /* Ombre bouton vert */
--color-green-light:  #D7FFB8;   /* Fond succès */
--color-green-text:   #3C8500;   /* Texte succès */

--color-blue:         #1CB0F6;   /* Liens, info, bouton secondaire */
--color-blue-dark:    #1899D6;   /* Ombre bouton bleu */
--color-blue-light:   #DDF4FF;   /* Fond info */

--color-red:          #FF4B4B;   /* Erreurs, vies perdues */
--color-red-dark:     #EA2B2B;   /* Ombre bouton rouge */
--color-red-light:    #FFDFE0;   /* Fond erreur */

--color-yellow:       #FFC800;   /* Accomplissements, raretés */
--color-yellow-dark:  #DDA800;   /* Ombre */
--color-yellow-light: #FFF9C4;   /* Fond avertissement */

--color-purple:       #CE82FF;   /* Expert, maîtrise, premium */
--color-purple-dark:  #9C3EE8;   /* Ombre */

/* Échelle de gris — inspirée Untitled UI */
--gray-900: #101828;   /* Textes principaux */
--gray-700: #344054;   /* Textes secondaires */
--gray-500: #667085;   /* Textes désactivés */
--gray-300: #D0D5DD;   /* Bordures */
--gray-100: #F2F4F7;   /* Arrière-plans légers */
--gray-50:  #F9FAFB;   /* Arrière-plan page */
--white:    #FFFFFF;
```

### 2.3 Typographie

```css
/* Police principale — Nunito (pédagogique, ronde, lisible) */
--font-primary: 'Nunito', sans-serif;

/* Police secondaire — Inter (professionnelle, pour les données) */
--font-secondary: 'Inter', sans-serif;

/* Hiérarchie */
--text-xs:   0.75rem;   /* 12px — Légendes */
--text-sm:   0.875rem;  /* 14px — Métadonnées */
--text-base: 1rem;      /* 16px — Corps */
--text-lg:   1.125rem;  /* 18px — Sous-titres */
--text-xl:   1.375rem;  /* 22px — Titres sections */
--text-2xl:  1.75rem;   /* 28px — Titres pages */
--text-3xl:  2.25rem;   /* 36px — Hero */
```

### 2.4 Espacement

```css
--space-xs:  4px;
--space-sm:  8px;
--space-md:  12px;
--space-lg:  16px;
--space-xl:  20px;
--space-2xl: 24px;
--space-3xl: 32px;
--space-4xl: 40px;
```

### 2.5 Bordures et ombres

```css
/* Rayons de bordure */
--radius-sm:   8px;
--radius-md:   12px;
--radius-lg:   16px;
--radius-xl:   20px;
--radius-pill: 999px;

/* Ombres — style Duolingo (boutons 3D) */
--shadow-green:  0 4px 0 var(--color-green-dark);
--shadow-blue:   0 4px 0 var(--color-blue-dark);
--shadow-red:    0 4px 0 var(--color-red-dark);
--shadow-card:   0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-elevated: 0 8px 24px rgba(0, 0, 0, 0.12);
```

### 2.6 Dark mode

```css
/* Variables dark mode */
[data-theme="dark"] {
  --bg-primary:    #1A1A2E;
  --bg-secondary:  #16213E;
  --bg-card:       #0F3460;
  --text-primary:  #E8E8E8;
  --text-secondary:#A0A0B0;
  --border:        #2A2A4A;
}
```

---

## 3. Composants UI

### 3.1 Button

| Variant | Usage | Couleur | Ombre |
|---|---|---|---|
| **primary** | Action principale (Commencer, Valider) | Vert `#58CC02` | `0 4px 0 #58A700` |
| **secondary** | Action secondaire (Retour, Annuler) | Bleu `#1CB0F6` | `0 4px 0 #1899D6` |
| **tertiary** | Action tertiaire (Voir plus) | Gris | Aucune |
| **destructive** | Action destructive (Tout effacer) | Rouge `#FF4B4B` | `0 4px 0 #EA2B2B` |
| **link** | Lien textuel | Bleu | Aucune |

**États** : normal, hover (brightness 1.1), active (translateY(2px)), disabled (opacity 0.5)

### 3.2 Badge

| Variant | Usage | Couleur |
|---|---|---|
| **brand** | Niveau Bloom "Rappel" | Gris |
| **success** | Niveau Bloom "Application" | Vert |
| **warning** | Niveau Bloom "Compréhension" | Jaune |
| **error** | Score faible | Rouge |
| **premium** | Achievement rare | Violet |

### 3.3 Card (ThemeChip)

- **MagicCard** avec effet spotlight au survol (Magic UI)
- Bordure animée (ShineBorder) pour les cartes sélectionnées
- Ombre portée `0 4px 12px rgba(0,0,0,0.08)`
- Badge du nombre de questions non vues

### 3.4 OptionButton

- 4 options (A, B, C, D) avec lettre dans un cercle
- État normal : bordure grise, fond blanc
- État sélectionné : bordure bleue, fond bleu clair, glow
- État correct : bordure verte, fond vert clair
- État incorrect : bordure rouge, fond rouge clair, shake animation
- Transition scale 1.02 au hover

### 3.5 ProgressBar

- Barre de progression avec label "3/10"
- Animation fluide (transition width 300ms ease)
- Couleur : vert (par défaut), rouge (si vies épuisées)
- Optionnel : ScrollProgress (Magic UI) pour les longs quiz

### 3.6 Modal

- Overlay avec backdrop-blur
- Animation zoomIn (0.95 → 1)
- Focus trap pour accessibilité
- Bouton fermeture (X) en haut à droite

### 3.7 Header

- Logo + titre de l'app
- Barre de progression (page quiz)
- Compteur de vies (mode challenge) avec animation heart beat
- Bouton retour (page quiz)

---

## 4. Écrans et parcours utilisateur

### 4.1 Page d'accueil (`/`)

```
┌─────────────────────────────────────┐
│  🎓 Quiz Attaché Territorial        │
│  Prépare ton concours               │
├─────────────────────────────────────┤
│                                     │
│  Choisir une thématique             │
│  ┌─────────────────────────────┐    │
│  │ 📚 Droit constitutionnel    │    │  ← MagicCard avec spotlight
│  │ 12 questions non vues       │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ ⚖️ Droit administratif      │    │
│  │ 8 questions non vues        │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ 💶 Finances publiques       │    │
│  │ 15 questions non vues       │    │
│  └─────────────────────────────┘    │
│                                     │
│  Nombre de questions                │
│  [5] [10] [15] [20] [Toutes]       │
│                                     │
│  Mode de jeu                        │
│  ┌──────────┐ ┌──────────────┐     │
│  │ 😌 Chill │ │ ❤️ Challenge  │     │
│  └──────────┘ └──────────────┘     │
│                                     │
│  ┌─────────────────────────────┐    │
│  │      Commencer 🚀           │    │  ← RainbowButton (Magic UI)
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Animations** :
- Fond : Particles (Magic UI) subtiles
- Cartes : MagicCard avec effet spotlight
- Bouton CTA : RainbowButton avec gradient animé
- Transition vers `/quiz` : slideInFromBottom

### 4.2 Page Quiz (`/quiz`)

```
┌─────────────────────────────────────┐
│  ← Retour   3/10    ❤️❤️❤️         │
├─────────────────────────────────────┤
│  ████████░░░░░░░░░░░  30%           │  ← ScrollProgress
│                                     │
│  📖 Droit constitutionnel           │
│                                     │
│  Quelle est la durée du mandat      │
│  du Président de la République      │
│  sous la Vème République ?          │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ A. 5 ans                    │    │  ← OptionButton
│  ├─────────────────────────────┤    │     (RippleButton au clic)
│  │ B. 7 ans                    │    │
│  ├─────────────────────────────┤    │
│  │ C. 4 ans                    │    │
│  ├─────────────────────────────┤    │
│  │ D. 6 ans                    │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │        Valider ✅            │    │  ← Button primary
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Après validation** :
- Option correcte : bordure verte + fond vert clair
- Option incorrecte : bordure rouge + shake animation
- Bloc source enrichi apparaît (SourceBlock)
- Badge Bloom (Rappel/Compréhension/Application)
- Bouton "Suivant →"

**Animations** :
- RippleButton au clic sur une option
- Shake sur réponse incorrecte
- SlideInFromBottom pour le bloc source
- Transition fluide entre questions

### 4.3 Page Résultats (`/results`)

```
┌─────────────────────────────────────┐
│  🎉 Félicitations !                 │  ← Confettis si ≥ 80%
├─────────────────────────────────────┤
│                                     │
│        ┌───────────┐                │
│        │    80%    │                │  ← NumberTicker
│        │  8/10     │                │
│        └───────────┘                │
│                                     │
│  📊 Statistiques                    │
│  Bonnes réponses : 8                │
│  Meilleure série : 5                │
│  Mode : Chill                       │
│                                     │
│  🏆 Badges débloqués                │
│  ┌──┐ ┌──┐ ┌──┐                    │
│  │🔥│ │💪│ │⭐│                    │
│  └──┘ └──┘ └──┘                    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │   🔄 Refaire le quiz        │    │
│  ├─────────────────────────────┤    │
│  │   🏠 Retour à l'accueil     │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Animations** :
- Confettis (Magic UI) si score ≥ 80%
- NumberTicker pour l'animation du score
- Badges avec animation d'apparition staggered
- PulsatingButton sur "Refaire le quiz"

### 4.4 Page Assistant IA (`/assistant`)

```
┌─────────────────────────────────────┐
│  🤖 Assistant Attaché Territorial   │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 💬 Quelle est la différence │    │
│  │ entre un décret et un       │    │
│  │ arrêté ?                    │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🤖 Bonne question !         │    │  ← AnimatedList
│  │                             │    │
│  │ Un décret est un acte       │    │
│  │ réglementaire signé par     │    │
│  │ le Président ou le Premier  │    │
│  │ ministre...                 │    │
│  │                             │    │
│  │ 📚 Sources :                │    │
│  │ ┌───────────────────────┐   │    │  ← ShineBorder
│  │ │ Droit administratif   │   │    │
│  │ │ Chapitre 3, §2        │   │    │
│  │ └───────────────────────┘   │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Pose ta question ici...     │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Animations** :
- Avatar IA avec animation de "réflexion" (dots bouncing)
- AnimatedList pour l'apparition des messages
- ShineBorder sur les cartes sources
- Loading state avec animation de points

---

## 5. Animations et micro-interactions

| Élément | Animation | Source | Priorité |
|---|---|---|---|
| Cartes thématiques | MagicCard (spotlight hover) | Magic UI | 🔥 Haute |
| Bouton CTA | RainbowButton (gradient animé) | Magic UI | 🔥 Haute |
| Options quiz | RippleButton (effet vague) | Magic UI | 🔥 Haute |
| Score résultats | NumberTicker (compteur) | Magic UI | 🔥 Haute |
| Confettis (≥80%) | Confetti | Magic UI | 🔥 Haute |
| Messages assistant | AnimatedList | Magic UI | 🔥 Haute |
| Sources assistant | ShineBorder | Magic UI | 🔥 Haute |
| Fond accueil | Particles | Magic UI | 📋 Moyenne |
| Barre progression | ScrollProgress | Magic UI | 📋 Moyenne |
| Bouton "Refaire" | PulsatingButton | Magic UI | 📋 Moyenne |
| Transition pages | slideInFromBottom | CSS | 🔥 Haute |
| Réponse incorrecte | Shake | CSS | 🔥 Haute |
| Cœur vies | HeartBeat | CSS | 📋 Moyenne |

---

## 6. Responsive et accessibilité

### Breakpoints

| Device | Width | Layout |
|---|---|---|
| Mobile | < 480px | 1 colonne, plein écran |
| Tablette | 480px - 768px | 2 colonnes thématiques |
| Desktop | > 768px | Centré max-w-lg, sidebar optionnelle |

### Accessibilité (WCAG AA)

- `prefers-reduced-motion` : désactive toutes les animations
- `prefers-color-scheme: dark` : dark mode automatique
- Focus visible sur tous les éléments interactifs
- Focus trap dans la modale
- Labels ARIA sur tous les composants
- Contraste minimum 4.5:1
- Safe areas iOS (env(safe-area-inset-*))

---

## 7. Roadmap d'implémentation

### Phase 1 — Design System (Jour 1)
- [ ] Créer les tokens CSS (palette Duolingo + gris Untitled UI)
- [ ] Refondre le composant Button (5 variants, ombres 3D)
- [ ] Refondre le composant Badge (5 variants, couleurs vives)
- [ ] Ajouter le dark mode (variables CSS + toggle)
- [ ] Ajouter les animations CSS (fadeIn, slideIn, zoomIn, shake)

### Phase 2 — Composants Magic UI (Jour 2-3)
- [ ] Installer Magic UI (npm install)
- [ ] Intégrer MagicCard pour les ThemeChip
- [ ] Intégrer RainbowButton pour le CTA
- [ ] Intégrer RippleButton pour les options
- [ ] Intégrer Confetti pour les résultats
- [ ] Intégrer NumberTicker pour le score
- [ ] Intégrer AnimatedList pour l'assistant
- [ ] Intégrer ShineBorder pour les sources

### Phase 3 — UX Premium (Jour 4-5)
- [ ] Responsive : breakpoint tablette (480px+)
- [ ] Safe areas iOS
- [ ] prefers-reduced-motion
- [ ] Focus trap modale
- [ ] Micro-feedback options (scale + glow)
- [ ] Animations de transition entre pages

---

## 8. Métriques de succès UX

| Métrique | Cible | Mesure |
|---|---|---|
| Temps pour commencer un quiz | < 10 secondes | Analytics |
| Taux de complétion d'un quiz | > 80% | Analytics |
| Score de satisfaction (NPS) | > 50 | Sondage |
| Temps passé sur l'assistant | > 3 min/session | Analytics |
| Taux de retour (7 jours) | > 40% | Analytics |
| Accessibilité | WCAG AA | Audit Lighthouse |
