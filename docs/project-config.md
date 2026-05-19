# Configuration du Projet — Quiz Attaché Territorial

## Structure des dossiers

```
Jeu Quizz/
├── index.html              # Point d'entrée unique (SPA)
├── CLAUDE.md               # Contexte projet pour l'IA
├── README.md               # Documentation utilisateur
├── .gitignore
│
├── _bmad/                  # Framework BMAD (ne pas modifier directement)
├── _bmad-output/           # Artéfacts BMAD (planning, implémentation)
│
├── src/                    # Sources organisées
│   ├── css/
│   │   └── style.css       # Design system Duolingo
│   ├── js/
│   │   ├── app.js          # Logique applicative (SPA)
│   │   ├── supabase-client.js  # Auth Supabase (à venir)
│   │   ├── supabase-sync.js    # Sync Supabase (à venir)
│   │   └── utils/
│   │       └── helpers.js  # Fonctions utilitaires (à venir)
│   └── assets/
│       └── icons/          # Icônes SVG
│
├── public/                 # Fichiers servis statiquement
│   └── data/
│       └── quiz_pool.json  # Base de questions (format chapitres/sections)
│
├── scripts/                # Scripts Python
│   ├── generate_quiz.py    # Génération QCM via API Deepseek
│   ├── extract_figma_design.py  # Extraction design Figma
│   └── embed_sections.py   # Obsolète
│
├── docs/                   # Documentation
│   ├── project-config.md   # Ce fichier
│   ├── design-system-duolingo.md  # Design system Figma
│   ├── UPDATES_A_PREVOIR.md       # Roadmap fonctionnalités
│   └── DEMARRAGE_RAPIDE_MCP_FIGMA.md  # Guide Figma MCP
│
├── tests/                  # Tests automatisés
│   └── ... (à venir)
│
└── skills/                 # Skills BMAD Builder
    └── reports/            # Rapports de génération
```

## Chemins importants

| Ressource | Chemin |
|---|---|
| Point d'entrée | `/index.html` |
| Styles CSS | `src/css/style.css` |
| JS principal | `src/js/app.js` |
| Données quiz | `public/data/quiz_pool.json` |
| Script génération | `scripts/generate_quiz.py` |
| Documentation | `docs/` |
| Tests | `tests/` |

## Commandes utiles

```bash
# Lancer le serveur de développement
python3 -m http.server 8080

# Générer des questions (depuis la racine)
python3 scripts/generate_quiz.py

# Générer un chapitre spécifique
python3 scripts/generate_quiz.py --chapter env1

# Forcer la régénération
python3 scripts/generate_quiz.py --force

# Test sans écrire
python3 scripts/generate_quiz.py --dry-run
```

## Architecture technique

- **SPA** (Single Page Application) — tout dans `index.html`
- **Vanilla JS** — aucun framework, zéro dépendance
- **Compatible GitHub Pages** (statique)
- **Design system Duolingo** — variables CSS, boutons 3D, animations
- **Persistance** — localStorage (`quiz_seen_ids`)
- **2 modes de jeu** : `chill` (sans limite) et `lives` (3 vies)

## État d'avancement

- [x] Structure HTML complète
- [x] Design Duolingo implémenté
- [x] Système de quiz fonctionnel
- [x] Modes chill et lives
- [x] Persistance des questions vues
- [x] Projet autonome
- [ ] Génération massive des 9 chapitres
- [ ] Auth Supabase + Google
- [ ] Mode révision
- [ ] PWA
- [ ] Stats cross-session
