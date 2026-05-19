/* ============================================================
   QUIZ ATTACHÉ TERRITORIAL — storage.js
   Persistance localStorage
   ============================================================ */
'use strict';

const Storage = (() => {
  const LS_KEY = 'quiz_seen_ids';

  function saveSeenIds(ids) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify([...ids]));
    } catch (_) { /* quota ou mode privé */ }
  }

  function loadSeenIds() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return new Set(arr);
      }
    } catch (_) { /* ignore */ }
    return new Set();
  }

  function clearSeenIds() {
    try {
      localStorage.removeItem(LS_KEY);
    } catch (_) { /* ignore */ }
  }

  return { saveSeenIds, loadSeenIds, clearSeenIds };
})();
