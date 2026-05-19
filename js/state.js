/* ============================================================
   QUIZ ATTACHÉ TERRITORIAL — state.js
   Mini-store pub/sub pour l'état global
   ============================================================ */
'use strict';

const Store = (() => {
  const LS_KEY = 'quiz_seen_ids';

  /** État interne (privé) */
  const _state = {
    pool: null,              // données complètes depuis quiz_pool.json
    selectedChapterId: null, // chapitre sélectionné
    questionCount: 10,       // nombre de questions
    gameMode: 'chill',       // 'chill' | 'lives'
    queue: [],               // questions de la session
    index: 0,                // index question courante
    score: 0,                // bonnes réponses
    answered: false,         // true après clic "Vérifier"
    seenIds: new Set(),      // IDs vues (localStorage)
    lives: 3,                // vies restantes
    currentStreak: 0,        // streak actuel
    maxStreak: 0             // meilleur streak
  };

  /** Abonnés aux changements : { key: [fn, fn, ...] } */
  const _subscribers = {};

  /* ---- Gestion des abonnements ---- */

  /**
   * S'abonner à un changement de clé.
   * @param {string} key  — '*' pour tout écouter
   * @param {Function} fn — callback(newValue, oldValue)
   * @returns {Function}  — unsubscribe
   */
  function subscribe(key, fn) {
    if (!_subscribers[key]) _subscribers[key] = [];
    _subscribers[key].push(fn);
    return () => {
      _subscribers[key] = _subscribers[key].filter(f => f !== fn);
    };
  }

  function _notify(key, newVal, oldVal) {
    (_subscribers[key] || []).forEach(fn => fn(newVal, oldVal));
    (_subscribers['*'] || []).forEach(fn => fn(key, newVal, oldVal));
  }

  /* ---- Getters ---- */

  function get(key) {
    const val = _state[key];
    // Retourner une copie pour les objets/tableaux (immutabilité)
    if (Array.isArray(val)) return [...val];
    if (val instanceof Set) return new Set(val);
    if (val && typeof val === 'object') return { ...val };
    return val;
  }

  function getAll() {
    return {
      pool: _state.pool ? { ..._state.pool } : null,
      selectedChapterId: _state.selectedChapterId,
      questionCount: _state.questionCount,
      gameMode: _state.gameMode,
      queue: [..._state.queue],
      index: _state.index,
      score: _state.score,
      answered: _state.answered,
      seenIds: new Set(_state.seenIds),
      lives: _state.lives,
      currentStreak: _state.currentStreak,
      maxStreak: _state.maxStreak
    };
  }

  /* ---- Setters ---- */

  function set(key, value) {
    const old = _state[key];
    if (old === value) return;
    _state[key] = value;
    _notify(key, value, old);
  }

  /** Setter multiple atomique : une seule notification '*' */
  function setAll(updates) {
    const changed = {};
    for (const [key, value] of Object.entries(updates)) {
      if (_state[key] !== value) {
        changed[key] = { old: _state[key], new: value };
        _state[key] = value;
      }
    }
    for (const [key, { old, new: val }] of Object.entries(changed)) {
      _notify(key, val, old);
    }
  }

  /* ---- Actions métier ---- */

  function resetSession() {
    setAll({
      queue: [],
      index: 0,
      score: 0,
      answered: false,
      lives: 3,
      currentStreak: 0,
      maxStreak: 0
    });
  }

  function addSeenId(id) {
    _state.seenIds.add(id);
    _notify('seenIds', new Set(_state.seenIds), null);
    _persistSeenIds();
  }

  function resetSeenIdsForChapter(chapterId) {
    const chapter = getChapter(chapterId);
    if (!chapter) return;
    chapter.questions.forEach(q => _state.seenIds.delete(q.id));
    _notify('seenIds', new Set(_state.seenIds), null);
    _persistSeenIds();
  }

  function unseenCount(chapterId) {
    const chapter = getChapter(chapterId);
    if (!chapter) return 0;
    return chapter.questions.filter(q => !_state.seenIds.has(q.id)).length;
  }

  function getChapter(chapterId) {
    if (!_state.pool) return null;
    return _state.pool.chapters.find(c => c.id === chapterId) || null;
  }

  /* ---- Persistance localStorage ---- */

  function _persistSeenIds() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify([..._state.seenIds]));
    } catch (_) { /* quota ou mode privé */ }
  }

  function loadSeenIds() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          _state.seenIds = new Set(arr);
        }
      }
    } catch (_) {
      _state.seenIds = new Set();
    }
  }

  /* ---- Initialisation ---- */
  loadSeenIds();

  // Exposer l'API publique
  const api = {
    get,
    getAll,
    set,
    setAll,
    subscribe,
    resetSession,
    addSeenId,
    resetSeenIdsForChapter,
    unseenCount,
    getChapter,
    loadSeenIds
  };

  // Compatibilité navigateur + Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Store: api };
  }
  return api;
})();
