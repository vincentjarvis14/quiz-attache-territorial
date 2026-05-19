/* ============================================================
   QUIZ ATTACHÉ TERRITORIAL — app.js
   Point d'entrée : orchestre les modules state, quiz, ui, storage
   Vanilla JS, compatible GitHub Pages
   ============================================================ */
'use strict';

/* ============================================================
   DÉPENDANCES : state.js, quiz.js, ui.js, storage.js
   Chargés AVANT app.js dans index.html
   ============================================================ */

/* ============================================================
   INITIALISATION
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  // Charger les IDs vues depuis localStorage
  Store.loadSeenIds();

  // Charger le pool de questions
  try {
    UI.showLoading(true);
    const resp = await fetch('data/quiz_pool.json');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const pool = await resp.json();
    Store.set('pool', pool);
    UI.showLoading(false);
  } catch (err) {
    UI.showLoading(false);
    console.error('Erreur chargement quiz_pool.json:', err);
    document.getElementById('themes-grid').innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--red);">
        <p style="font-size:1.2rem; font-weight:700;">😵 Impossible de charger les questions</p>
        <p style="font-size:0.9rem; margin-top:0.5rem;">Vérifie que le fichier <code>data/quiz_pool.json</code> est présent.</p>
        <button class="btn btn-green" style="margin-top:1rem;" onclick="location.reload()">
          🔄 Réessayer
        </button>
      </div>
    `;
    return;
  }

  // Initialiser l'écran d'accueil
  initHome();
});

/* ============================================================
   ÉCRAN ACCUEIL
   ============================================================ */

function initHome() {
  const pool = Store.get('pool');
  if (!pool || !pool.chapters || pool.chapters.length === 0) return;

  // Sélectionner le premier chapitre par défaut
  const firstChapter = pool.chapters[0];
  Store.set('selectedChapterId', firstChapter.id);

  renderHome();
  bindHomeEvents();
}

function renderHome() {
  const pool = Store.get('pool');
  const selectedId = Store.get('selectedChapterId');
  if (!pool) return;

  UI.renderThemes(pool.chapters, selectedId, (chId) => Store.unseenCount(chId));

  const chapter = Store.getChapter(selectedId);
  if (chapter) {
    const count = Math.min(Store.get('questionCount'), chapter.questions.length);
    UI.updateAvailableCounter(chapter.questions.length);
    UI.setStartButton(chapter.questions.length > 0);
  }
}

function bindHomeEvents() {
  // Sélection de thème (délégation)
  const grid = document.getElementById('themes-grid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      const chip = e.target.closest('.theme-chip');
      if (!chip) return;
      const chId = chip.dataset.chapter;
      Store.set('selectedChapterId', chId);
      renderHome();
    });
  }

  // Sélection du nombre de questions
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.qty-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const qty = btn.dataset.qty;
      Store.set('questionCount', qty === 'all' ? 999 : parseInt(qty));
    });
  });

  // Mode de jeu
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      Store.set('gameMode', btn.dataset.mode);
    });
  });

  // Bouton Commencer
  const startBtn = document.getElementById('btn-start');
  if (startBtn) {
    startBtn.addEventListener('click', startQuiz);
  }

  // Bouton Changelog
  const changelogBtn = document.getElementById('btn-changelog');
  if (changelogBtn) {
    changelogBtn.addEventListener('click', () => {
      UI.showScreen('screen-changelog');
    });
  }
}

/* ============================================================
   LANCEMENT DU QUIZ
   ============================================================ */

function startQuiz() {
  const chapter = Store.getChapter(Store.get('selectedChapterId'));
  if (!chapter) return;

  const count = Store.get('questionCount');
  const seenIds = Store.get('seenIds');
  const questions = Quiz.buildQueue(chapter.questions, count, seenIds);

  if (questions.length === 0) return;

  Store.resetSession();
  Store.setAll({
    queue: questions,
    index: 0,
    score: 0,
    answered: false,
    lives: Store.get('gameMode') === 'lives' ? 3 : 3
  });

  UI.showScreen('screen-quiz');
  renderQuestion();
  bindQuizEvents();
}

/* ============================================================
   ÉCRAN QUIZ
   ============================================================ */

function renderQuestion() {
  const queue = Store.get('queue');
  const index = Store.get('index');
  const question = queue[index];
  if (!question) return;

  UI.renderQuestion(question, index, queue.length);
  UI.renderOptions(question.options, null);
  UI.setVerifyButton(false, 'Vérifier');
  UI.updateLives(Store.get('lives'));

  // Cacher la source
  document.getElementById('source-block').style.display = 'none';
}

function bindQuizEvents() {
  // Options (délégation — un seul listener)
  const container = document.getElementById('quiz-options');
  if (container) {
    // Nettoyer l'ancien listener pour éviter les doublons
    const newContainer = container.cloneNode(true);
    container.parentNode.replaceChild(newContainer, container);
    newContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.option-btn');
      if (!btn || btn.disabled) return;

      document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      UI.setVerifyButton(true);
    });
  }

  // Bouton Vérifier — un seul listener, pas de clonage
  const verifyBtn = document.getElementById('btn-verify');
  if (verifyBtn) {
    verifyBtn.replaceWith(verifyBtn.cloneNode(true));
    document.getElementById('btn-verify').addEventListener('click', handleVerify);
  }

  // Bouton Fermer
  const closeBtn = document.getElementById('btn-close-quiz');
  if (closeBtn) {
    closeBtn.replaceWith(closeBtn.cloneNode(true));
    document.getElementById('btn-close-quiz').addEventListener('click', () => {
      if (confirm('Quitter le quiz ? Ta progression sera perdue.')) {
        UI.showScreen('screen-home');
        renderHome();
      }
    });
  }
}

function handleVerify() {
  const queue = Store.get('queue');
  const index = Store.get('index');
  const question = queue[index];
  if (!question) return;

  const selected = document.querySelector('.option-btn.selected');
  if (!selected) return;

  const selectedIndex = parseInt(selected.dataset.index);
  const correct = Quiz.isCorrect(question, selectedIndex);

  // Feedback visuel
  UI.showFeedback(correct, question, selectedIndex);

  // Afficher la source
  UI.showSource(question);

  // Mettre à jour le score
  if (correct) {
    Store.set('score', Store.get('score') + 1);
  }

  // Mettre à jour le streak
  const streak = Quiz.updateStreak(correct, Store.get('currentStreak'), Store.get('maxStreak'));
  Store.setAll({
    currentStreak: streak.currentStreak,
    maxStreak: streak.maxStreak
  });

  // Marquer comme vue
  Store.addSeenId(question.id);
  Store.set('answered', true);

  // Mode Challenge : perdre une vie
  if (Store.get('gameMode') === 'lives' && !correct) {
    const newLives = Store.get('lives') - 1;
    Store.set('lives', newLives);
    UI.updateLives(newLives);

    if (newLives <= 0) {
      UI.setVerifyButton(false, 'Vies épuisées !');
      setTimeout(showResults, 1500);
      return;
    }
  }

  // Changer le bouton pour "Suivant"
  const isLast = index >= queue.length - 1;
  UI.setVerifyButton(true, isLast ? 'Voir les résultats' : 'Suivant');

  // Remplacer le listener du bouton Vérifier/Suivant
  const verifyBtn = document.getElementById('btn-verify');
  if (verifyBtn) {
    verifyBtn.replaceWith(verifyBtn.cloneNode(true));
    document.getElementById('btn-verify').addEventListener('click', () => {
      if (isLast) {
        showResults();
      } else {
        Store.set('index', Store.get('index') + 1);
        Store.set('answered', false);
        renderQuestion();
        bindQuizEvents();
      }
    });
  }
}

/* ============================================================
   ÉCRAN RÉSULTATS
   ============================================================ */

function showResults() {
  const score = Store.get('score');
  const total = Store.get('queue').length;
  const wrong = total - score;
  const maxStreak = Store.get('maxStreak');

  UI.renderResults(score, wrong, total, maxStreak);
  UI.showScreen('screen-results');

  // Vérifier si toutes les questions du chapitre ont été vues
  const chapter = Store.getChapter(Store.get('selectedChapterId'));
  if (chapter) {
    const unseen = Store.unseenCount(chapter.id);
    UI.showPoolDoneBanner(unseen === 0);
  }

  bindResultsEvents();
}

function bindResultsEvents() {
  const replayBtn = document.getElementById('btn-replay');
  if (replayBtn) {
    replayBtn.replaceWith(replayBtn.cloneNode(true));
    document.getElementById('btn-replay').addEventListener('click', () => {
      UI.showScreen('screen-home');
      renderHome();
      setTimeout(startQuiz, 100);
    });
  }

  const changeBtn = document.getElementById('btn-change-theme');
  if (changeBtn) {
    changeBtn.replaceWith(changeBtn.cloneNode(true));
    document.getElementById('btn-change-theme').addEventListener('click', () => {
      UI.showScreen('screen-home');
      renderHome();
    });
  }

  const resetBtn = document.getElementById('btn-reset-pool');
  if (resetBtn) {
    resetBtn.replaceWith(resetBtn.cloneNode(true));
    document.getElementById('btn-reset-pool').addEventListener('click', () => {
      const chId = Store.get('selectedChapterId');
      Store.resetSeenIdsForChapter(chId);
      UI.showPoolDoneBanner(false);
    });
  }
}

/* ============================================================
   MODALE SOURCE
   ============================================================ */

function bindModalEvents() {
  const backdrop = document.getElementById('modal-backdrop');
  if (backdrop) backdrop.addEventListener('click', closeModal);

  const closeBtn = document.getElementById('modal-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  const footerBtn = document.getElementById('modal-close-footer-btn');
  if (footerBtn) footerBtn.addEventListener('click', closeModal);

  // Bouton "Voir la fiche complète" dans le bloc source
  const seeSourceBtn = document.getElementById('btn-see-source');
  if (seeSourceBtn) {
    seeSourceBtn.replaceWith(seeSourceBtn.cloneNode(true));
    document.getElementById('btn-see-source').addEventListener('click', openModal);
  }

  // Bouton retour du Changelog
  const closeChangelogBtn = document.getElementById('btn-close-changelog');
  if (closeChangelogBtn) {
    closeChangelogBtn.addEventListener('click', () => {
      UI.showScreen('screen-home');
    });
  }
}

function openModal() {
  const queue = Store.get('queue');
  const index = Store.get('index');
  const question = queue[index];
  if (!question) return;
  UI.openSourceModal(question);
}

function closeModal() {
  UI.closeSourceModal();
}

// Initialiser les events de la modale au chargement
document.addEventListener('DOMContentLoaded', bindModalEvents);
