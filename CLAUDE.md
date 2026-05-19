# Quiz Attaché Territorial

## Stack technique
- **HTML/CSS/JS vanilla** — Aucun framework, zéro dépendance
- Compatible **GitHub Pages** (statique)
- Design system inspiré de **Duolingo**

## Structure du projet
```
/
├── index.html              # Point d'entrée unique (SPA)
├── css/style.css           # Design system Duolingo
├── js/
│   ├── app.js              # Orchestrateur (point d'entrée)
│   ├── state.js            # Mini-store pub/sub (état global)
│   ├── quiz.js             # Logique métier (shuffle, scoring, buildQueue)
│   ├── ui.js               # Rendu DOM (écrans, options, résultats)
│   └── storage.js          # Persistance localStorage
├── assets/icons/           # Icônes SVG
├── data/quiz_pool.json     # Base de questions
├── data/quiz_pool.light.json  # Version allégée (sourceContext tronqué)
├── scripts/                # Scripts Python (génération, diagnostic, etc.)
├── docs/                   # Documentation
├── tests/                  # Tests unitaires
├── skills/                 # Skills BMAD Builder
├── _bmad/                  # Framework BMAD
└── _bmad-output/           # Artéfacts BMAD
```

## Architecture
- **SPA** (Single Page Application) — tout dans `index.html`
- Écrans : Accueil → Quiz → Résultats
- **Modules séparés** : state (store pub/sub), quiz (logique métier), ui (rendu DOM), storage (localStorage)
- State global encapsulé dans `Store` (getters/setters/subscribe)
- Questions persistées en localStorage (`quiz_seen_ids`)
- 2 modes de jeu : `chill` (sans limite) et `lives` (3 vies)

## Design System (Duolingo-like)
- Vert principal : `#58CC02`
- Police : Nunito
- Boutons 3D, ombres, animations fluides

## Données (quiz_pool.json)
- Structure : `chapters[]` → `sections{}` + `questions[]`
- Chapitres actuels : institutions françaises, fonction publique, collectivités territoriales, etc.

## État d'avancement
- [x] Structure HTML complète
- [x] Design Duolingo implémenté
- [x] Système de quiz fonctionnel
- [x] Modes chill et lives
- [x] Persistance des questions vues
- [x] Projet autonome
- [x] Modules JS séparés (state, quiz, ui, storage)
- [x] Tests unitaires (Store)
- [ ] Génération massive des 9 chapitres
- [ ] Auth Supabase + Google
- [ ] Mode révision
- [ ] PWA
- [ ] Stats cross-session

## Agents BMAD disponibles
- 📊 **Mary** — Business Analyst
- 📚 **Paige** — Technical Writer
- 📋 **John** — Product Manager
- 🎨 **Sally** — UX Designer
- 🏗️ **Winston** — System Architect
- 💻 **Amelia** — Développeuse
- 📋 **Pierre** — Chef de Projet
- 🤖 **Alex** — Spécialiste Product Builder IA
- 🎮 **Luna** — Spécialiste Jeu

## Commandes utiles
```bash
python3 -m http.server 8080          # Lancer le serveur
node tests/state.test.js              # Lancer les tests unitaires
python3 scripts/generate_quiz.py      # Générer des questions
python3 scripts/generate_quiz.py --force  # Tout régénérer
python3 scripts/diagnostic.py         # Diagnostic complet
```
