# Quiz Attaché Territorial - Clone Duolingo

Un jeu de quiz interactif pour préparer le concours d'Attaché Territorial, avec une interface **clone complet de Duolingo** utilisant le design system officiel.

## 🎯 Objectif
Transformer l'interface du jeu en un véritable clone Duolingo en intégrant tous les composants, icônes, illustrations et design tokens du projet Figma public Duolingo.

## 🎨 Design System Duolingo Intégré

### Design System Complet
L'application utilise désormais le **design system officiel de Duolingo** avec :

#### 🎨 Tokens de Couleur
- **Vert primaire** : `#58CC02` (boutons principaux)
- **Bleu secondaire** : `#1CB0F6` (actions secondaires)
- **Rouge erreur** : `#FF4B4B` (feedback négatif)
- **Jaune attention** : `#FFC800` (avertissements)
- **Violet accent** : `#CE82FF` (éléments spéciaux)
- **Échelle de gris** : 5 niveaux de `#3C3C3C` à `#F7F7F7`

#### ✨ Composants UI
- **Boutons 3D** avec effets de pression et ripple effect
- **Cartes interactives** avec ombres et bordures
- **Barre de progression** style Duolingo
- **Badges Bloom** colorés (Rappel, Compréhension, Application)
- **Modales** avec animations fluides
- **Toggle switches** pour les modes de jeu

#### 🖼️ Assets Visuels
- **Logo hibou custom** en SVG (style Duolingo)
- **Icônes vectorielles** pour tous les thèmes
- **Illustrations** pour les états vides et résultats
- **Animations CSS** : bounce, fade, pop-in, shake

#### 📐 Système de Design
- **Variables CSS complètes** (tokens design)
- **Espacement cohérent** (scale 4px → 40px)
- **Typographie** : Nunito (poids 400-900)
- **Bordures** : radius 8px → 20px + pill
- **Ombres** : boutons 3D, cartes, modales
- **Transitions** : easing cubic-bezier(0.4, 0, 0.2, 1)

### Source du Design System
Projet Figma public : [Hoo Dini - Design System for Duolingo](https://www.figma.com/design/BNVMEmUCHD2co4IWUTEHzg/Hoo-Dini--Design-System-for-Duolingo--Community-?node-id=2001-1604&t=aVThUN4uMcFzTjcC-1)

## Fonctionnalités

### Fonctionnalités existantes
- **Sélection de thèmes** : 9 chapitres thématiques avec icônes
- **Système de progression** : Suivi des questions déjà vues (localStorage)
- **Quiz interactif** : Questions à choix multiples avec 4 options
- **Niveaux cognitifs** : Questions classées selon la taxonomie de Bloom (Rappel, Compréhension, Application)
- **Feedback immédiat** : Correction avec explication et source
- **Modal de source** : Consultation complète du contenu source avec surlignage
- **Résultats détaillés** : Score, statistiques et encouragement
- **Génération automatique** : Script Python pour générer des questions via API Claude

### Nouvelles fonctionnalités ajoutées

#### 1. Système de vies et streak
- **3 vies par session** : Affichées dans l'en-tête du quiz (❤️❤️❤️)
- **Perte de vie** : À chaque mauvaise réponse, une vie est perdue
- **Fin de partie** : Le quiz se termine automatiquement quand il n'y a plus de vies
- **Streak** : Compteur de réponses correctes consécutives
- **Meilleur streak** : Affiché dans les résultats avec une carte dédiée

#### 2. Mode de jeu sélectionnable
- **Mode Chill** 😌 : Pas de vies, pas de pression - idéal pour l'apprentissage
- **Mode Challenge** ❤️ : 3 vies, fin du quiz si épuisées - pour les défis
- **Toggle visuel** : Interface intuitive pour choisir entre les deux modes
- **Persistance** : Le mode sélectionné est appliqué à toute la session

#### 3. Navigation améliorée
- **Retour à l'accueil** : Bouton de fermeture visible dans l'en-tête du quiz
- **Confirmation** : Dialogue de confirmation avant de quitter une session en cours
- **Navigation fluide** : Retour immédiat à l'écran d'accueil depuis n'importe où

#### 4. Améliorations visuelles
- **Carte streak** : Nouvelle carte violette dans les résultats
- **Animation des vies** : Les vies perdues deviennent grisées
- **Header amélioré** : Ajout du conteneur de vies à côté du compteur
- **Design du toggle** : Boutons 3D avec icônes et descriptions

## Structure du projet

```
Jeu Quizz/
├── index.html          # Structure HTML principale
├── css/
│   └── style.css      # Styles CSS (design système Duolingo)
├── js/
│   └── app.js         # Logique JavaScript du jeu
├── data/
│   └── quiz_pool.json # Données des questions (généré automatiquement)
├── scripts/
│   ├── generate_quiz.py       # Script de génération des questions
│   ├── diagnostic.py          # Diagnostic complet du projet
│   ├── quality_filter_questions.py  # Filtre qualité
│   ├── optimize_quiz_pool.py  # Version allégée pour le web
│   ├── backfill_source_text.py # Ajout des sources
│   ├── fix_source_links.py    # Correction des ancres
│   └── restore_sections.py    # Restauration des sections
├── requirements.txt   # Dépendances Python
├── .env.example       # Template des variables d'environnement
└── README.md          # Cette documentation
```

## Installation et utilisation

### Lancer l'application
1. Ouvrir un terminal dans le dossier du projet
2. Démarrer un serveur HTTP local :
   ```bash
   python3 -m http.server 8080
   ```
3. Ouvrir http://localhost:8080 dans un navigateur

### Générer de nouvelles questions
1. Installer les dépendances :
   ```bash
   pip install -r requirements.txt
   ```
2. Copier le fichier d'environnement :
   ```bash
   cp .env.example .env
   # Puis éditer .env avec votre clé DEEPSEEK_API_KEY
   ```
3. Exécuter le script de génération :
   ```bash
   python3 scripts/generate_quiz.py
   ```

Options disponibles :
- `--force` : Régénère toutes les questions
- `--chapter env1` : Génère uniquement pour un chapitre spécifique
- `--dry-run` : Test sans écrire les modifications

> **Note :** Le projet est désormais **autonome** — plus besoin de fichier `courses.json` externe.
> Les sections sont lues directement depuis `data/quiz_pool.json` (auto-référencement).

## Améliorations techniques apportées

### 1. État global étendu (`js/app.js`)
Ajout de nouvelles propriétés dans l'objet `state` :
```javascript
lives: 3,                // Nombre de vies (système de streak)
currentStreak: 0,        // Streak actuel de bonnes réponses
maxStreak: 0             // Meilleur streak de la session
```

### 2. Nouvelles fonctions
- `updateLivesDisplay()` : Met à jour l'affichage des vies dans l'en-tête
- `updateStreak(isCorrect)` : Gère la logique du streak et des vies
- Intégration dans `verifyAnswer()` et `showResults()`

### 3. Modifications HTML (`index.html`)
- Ajout du conteneur `#lives-container` dans l'en-tête du quiz
- Ajout de la carte `streak` dans les résultats

### 4. Styles CSS (`css/style.css`)
- Ajout du style pour `.score-card.streak`
- Mise à jour des styles existants pour accommoder les nouvelles fonctionnalités

## Prochaines améliorations possibles

### Court terme
1. **Mode chronométré** : Ajouter un minuteur pour chaque question
2. **Sons et effets** : Feedback audio pour les bonnes/mauvaises réponses
3. **Statistiques détaillées** : Graphiques de progression sur plusieurs sessions

### Moyen terme
1. **Mode multijoueur** : Défis entre utilisateurs
2. **Système de récompenses** : Badges et achievements
3. **Application mobile** : Version PWA pour installation sur mobile

### Long terme
1. **Backend** : Sauvegarde cloud des progrès
2. **Communauté** : Partage de questions entre utilisateurs
3. **Intelligence artificielle** : Recommandations personnalisées de révision

## Technologies utilisées

- **HTML5** : Structure sémantique
- **CSS3** : Design système avec variables CSS (Custom Properties)
- **JavaScript Vanilla** : Pas de framework, compatible GitHub Pages
- **LocalStorage** : Persistance des données côté client
- **Python** : Génération automatique de contenu
- **API Claude** : Génération intelligente des questions

## Design

Inspiré de **Duolingo** avec :
- Palette de couleurs verte/bleue/jaune
- Boutons 3D avec ombres portées
- Typographie Nunito (proche de DIN Next Rounded)
- Animations subtiles (fade, bounce, pop-in)
- Design responsive (mobile-first)

## Licence

Projet éducatif pour la préparation au concours d'Attaché Territorial.