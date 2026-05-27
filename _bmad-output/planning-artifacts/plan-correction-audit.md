# 🏗️ Plan de Correction — Audit Userflow Quiz Attaché Territorial

> Généré le 19/05/2026
> Par Winston (System Architect)

---

## Stratégie générale

L'audit a révélé **34 problèmes** (7 critiques, 15 moyens, 12 mineurs). La stratégie de correction suit 3 principes :

1. **Stabilité d'abord** : Corriger les bugs et les failles de sécurité avant les améliorations cosmétiques
2. **Périmètre maîtrisé** : Chaque correction est indépendante et testable
3. **Pas de réécriture** : On améliore le code existant, on ne le réécrit pas

---

## 📦 LOT 1 — CORRECTIONS IMMÉDIATES (sécurité & stabilité)

Ces corrections sont **indépendantes** et peuvent être appliquées dans n'importe quel ordre. Chacune prend < 15 minutes.

### 1.1 Supprimer `storage.js` (dead code)

**Fichiers** : `js/storage.js`, `index.html`
**Problème** : Module `Storage` défini mais jamais utilisé. La persistance est gérée par `state.js`.
**Action** :
1. Supprimer le fichier `js/storage.js`
2. Supprimer la ligne `<script src="js/storage.js?v=2"></script>` dans `index.html`

### 1.2 Échapper les injections HTML

**Fichier** : `js/ui.js`
**Problème** : `renderThemes()`, `renderOptions()`, `openSourceModal()` injectent des données sans `escapeHtml()`.
**Action** : Appliquer `escapeHtml()` sur toutes les variables injectées dans les template strings :
- `renderThemes` : `ch.title`, `ch.icon`
- `renderOptions` : `opt`
- `openSourceModal` : `kw.term`, `kw.ref`, `kw.type`
- `showSource` : `question.sectionTitle`, `question.sourceLink`

**Code à ajouter** dans chaque template literal :
```js
// Au lieu de ${ch.title}
${escapeHtml(ch.title)}
```

### 1.3 Remplacer le clonage DOM par de la délégation d'événements

**Fichier** : `js/app.js`
**Problème** : `cloneNode(true)` + `replaceChild()` dans `bindQuizEvents()` et `bindResultsEvents()`.
**Action** : Remplacer par un seul listener par conteneur persistant :

```js
// Au lieu de cloner les boutons :
function bindQuizEvents() {
  // Un seul listener sur le conteneur du quiz
  document.getElementById('screen-quiz').addEventListener('click', (e) => {
    const btn = e.target.closest('.option-btn');
    if (btn && !btn.disabled) {
      document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      UI.setVerifyButton(true);
      return;
    }
    
    const verifyBtn = e.target.closest('#btn-verify');
    if (verifyBtn) {
      if (Store.get('answered')) {
        // Mode "Suivant"
        const queue = Store.get('queue');
        const index = Store.get('index');
        if (index >= queue.length - 1) {
          showResults();
        } else {
          Store.set('index', index + 1);
          Store.set('answered', false);
          renderQuestion();
        }
      } else {
        handleVerify();
      }
      return;
    }
    
    const closeBtn = e.target.closest('#btn-close-quiz');
    if (closeBtn) {
      if (confirm('Quitter le quiz ? Ta progression sera perdue.')) {
        UI.showScreen('screen-home');
        renderHome();
      }
    }
  });
}
```

### 1.4 Uniformiser les ombres 3D des boutons

**Fichier** : `css/style.css`
**Problème** : Incohérence des ombres 3D entre les boutons.
**Action** : Remplacer toutes les ombres par le pattern standard :

```css
/* Pattern standard pour TOUS les boutons */
.btn {
  box-shadow: 0 4px 0 var(--shadow-color);
}
.btn:hover {
  box-shadow: 0 6px 0 var(--shadow-color);
  transform: translateY(-2px);
}
.btn:active {
  transform: translateY(4px);
  box-shadow: none !important;
}
```

Et ajouter `--shadow-color` comme variable pour chaque variante.

### 1.5 Rendre le bouton changelog dynamique

**Fichier** : `index.html`
**Problème** : Date hardcodée "17/05".
**Action** : Remplacer le texte statique par :
```html
<button id="btn-changelog" class="btn btn-gray btn-full" style="margin-top:8px; font-size:0.85rem;">
  📋 Nouveautés
</button>
```

---

## 📦 LOT 2 — ROBUSTESSE (prochaine session)

Ces corrections améliorent la résilience de l'application. Prévoir 1-2h.

### 2.1 Ajouter une validation du JSON chargé

**Fichier** : `js/app.js`
**Action** : Après le fetch, valider la structure avant de l'utiliser :

```js
function validatePool(pool) {
  if (!pool || !Array.isArray(pool.chapters)) throw new Error('Format invalide');
  for (const ch of pool.chapters) {
    if (!ch.id || !ch.title || !Array.isArray(ch.questions)) throw new Error(`Chapitre invalide: ${ch.id}`);
    for (const q of ch.questions) {
      if (!q.id || !q.q || !Array.isArray(q.options) || typeof q.answer !== 'number') {
        throw new Error(`Question invalide: ${q.id}`);
      }
    }
  }
  return true;
}
```

### 2.2 Ajouter un cache localStorage du pool

**Fichier** : `js/app.js`
**Action** : Sauvegarder le pool dans localStorage après un chargement réussi, et le restaurer si le fetch échoue :

```js
async function loadPool() {
  try {
    const resp = await fetch('data/quiz_pool.json');
    const pool = await resp.json();
    validatePool(pool);
    localStorage.setItem('quiz_pool_cache', JSON.stringify(pool));
    return pool;
  } catch (err) {
    const cached = localStorage.getItem('quiz_pool_cache');
    if (cached) return JSON.parse(cached);
    throw err;
  }
}
```

### 2.3 Ajouter `prefers-reduced-motion`

**Fichier** : `css/style.css`
**Action** : Ajouter à la fin du fichier :

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 2.4 Feedback visuel pour la perte de vies

**Fichier** : `js/ui.js` (updateLives)
**Action** : Ajouter une animation shake sur le cœur perdu :

```js
function updateLives(lives) {
  const container = document.getElementById('lives-container');
  if (!container) return;
  container.innerHTML = Array.from({ length: 3 }, (_, i) =>
    `<span class="life${i < lives ? '' : ' lost'}">❤️</span>`
  ).join('');
  
  // Animation shake si une vie a été perdue
  const lostLife = container.querySelector('.life.lost');
  if (lostLife) {
    lostLife.style.animation = 'shake 0.4s var(--ease)';
  }
}
```

### 2.5 Sauvegarder l'état de session dans sessionStorage

**Fichier** : `js/state.js`
**Action** : Ajouter la persistance de session :

```js
function persistSession() {
  try {
    sessionStorage.setItem('quiz_session', JSON.stringify({
      queue: _state.queue,
      index: _state.index,
      score: _state.score,
      answered: _state.answered,
      lives: _state.lives,
      currentStreak: _state.currentStreak,
      maxStreak: _state.maxStreak,
      selectedChapterId: _state.selectedChapterId,
      questionCount: _state.questionCount,
      gameMode: _state.gameMode
    }));
  } catch (_) {}
}

function restoreSession() {
  try {
    const raw = sessionStorage.getItem('quiz_session');
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.queue && data.queue.length > 0) return data;
  } catch (_) {}
  return null;
}
```

Appeler `persistSession()` après chaque `set()` ou `setAll()` qui modifie l'état de la session.
Appeler `restoreSession()` dans `initHome()` et proposer de reprendre.

---

## 📦 LOT 3 — POLISH (quand le temps le permet)

### 3.1 Supprimer les classes CSS inutilisées

**Fichier** : `css/style.css`
**Classes à supprimer** : `.btn-icon`, `.btn-auto`, `.btn-lg`, `.empty-state`, `.source-extract-inner`, `.source-extract-ctx`, `.source-extract-hl`, `.source-section-full`, `.modal-empty`, `.results-title.perfect`, `.results-title.good`, `.results-title.retry`, `.shake`, `.pop-in`, `.pulse`, `.source-block-enter`

### 3.2 Ajouter un breakpoint pour très petits écrans

**Fichier** : `css/style.css`
**Action** : Ajouter avant le breakpoint 640px :

```css
@media (max-width: 380px) {
  .screen-home { padding: 24px 16px 80px; gap: 16px; }
  .quiz-body { padding: 16px 16px 12px; }
  .action-bar { padding: 12px 16px; }
  .home-logo-text { font-size: var(--fs-lg); }
  .quiz-question { font-size: var(--fs-lg); }
  .score-card { padding: 12px 16px; min-width: 70px; }
  .score-card-value { font-size: var(--fs-xl); }
}
```

### 3.3 Ajouter des tests unitaires pour ui.js

**Fichier** : `tests/ui.test.js`
**Tests à ajouter** :
- `escapeHtml()` échappe `<>&"'`
- `extractContext()` trouve le bon paragraphe
- `highlightKeywordsInHtml()` surligne correctement
- `splitParagraphs()` découpe correctement
- `normalizeText()` normalise correctement

### 3.4 Ajouter le mode sombre

**Fichier** : `css/style.css`
**Action** : Ajouter un bloc de variables pour le dark mode :

```css
@media (prefers-color-scheme: dark) {
  :root {
    --gray-1: #E0E0E0;
    --gray-2: #AAAAAA;
    --gray-3: #888888;
    --gray-4: #333333;
    --gray-5: #1A1A1A;
    --white: #222222;
    --shadow-card: 0 4px 12px rgba(0, 0, 0, 0.3);
    --shadow-modal: 0 8px 32px rgba(0, 0, 0, 0.4);
  }
}
```

### 3.5 Ajouter des confettis sur score > 80%

**Fichier** : `js/ui.js` (renderResults)
**Action** : Ajouter une animation CSS de confettis quand `pct >= 80` :

```js
if (pct >= 80) {
  showConfetti();
}

function showConfetti() {
  const container = document.getElementById('screen-results');
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.animationDelay = Math.random() * 2 + 's';
    confetti.style.backgroundColor = ['#58CC02','#1CB0F6','#FFC800','#FF4B4B','#CE82FF'][Math.floor(Math.random() * 5)];
    container.appendChild(confetti);
    setTimeout(() => confetti.remove(), 3000);
  }
}
```

CSS associé :
```css
.confetti {
  position: fixed;
  top: -10px;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  animation: confettiFall 3s ease-in forwards;
  z-index: 1000;
}
@keyframes confettiFall {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}
```

---

## 📋 RÉCAPITULATIF DES CORRECTIONS PAR FICHIER

| Fichier | Lot | Corrections |
|---------|-----|-------------|
| `js/storage.js` | 1 | Supprimer le fichier |
| `index.html` | 1 | Supprimer ref storage.js, changer texte bouton |
| `js/ui.js` | 1, 2, 3 | Échapper HTML, animation perte vies, confettis |
| `js/app.js` | 1, 2 | Délégation événements, validation JSON, cache pool |
| `css/style.css` | 1, 2, 3 | Ombres uniformes, prefers-reduced-motion, classes inutilisées, breakpoint, dark mode |
| `js/state.js` | 2 | sessionStorage persist/restore |
| `tests/ui.test.js` | 3 | Nouveau fichier de tests |

---

## ⏱ ESTIMATION

| Lot | Temps | Impact |
|-----|-------|--------|
| Lot 1 — Immédiat | ~45 min | 🔴 Sécurité + stabilité |
| Lot 2 — Robustesse | ~1h30 | 🟠 Résilience + UX |
| Lot 3 — Polish | ~2h | 🔵 Qualité + accessibilité |
| **Total** | **~4h** | **34 problèmes résolus** |

---

*Plan établi par Winston (System Architect) — BMAD Builder*
