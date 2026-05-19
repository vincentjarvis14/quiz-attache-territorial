/* ============================================================
   QUIZ ATTACHÉ TERRITORIAL — quiz.js
   Logique métier du quiz (shuffle, buildQueue, scoring)
   ============================================================ */
'use strict';

const Quiz = (() => {

  /**
   * Mélange un tableau (Fisher-Yates)
   * @param {Array} arr
   * @returns {Array} nouveau tableau mélangé
   */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /**
   * Construit la file de questions pour une session
   * @param {Array} questions — toutes les questions du chapitre
   * @param {number} count    — nombre demandé
   * @param {Set} seenIds     — IDs déjà vues
   * @returns {Array} questions sélectionnées et mélangées
   */
  function buildQueue(questions, count, seenIds) {
    const unseen = questions.filter(q => !seenIds.has(q.id));
    const pool = unseen.length >= count ? unseen : questions;
    const shuffled = shuffle(pool);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Vérifie si la réponse est correcte
   * @param {Object} question
   * @param {number} selectedIndex
   * @returns {boolean}
   */
  function isCorrect(question, selectedIndex) {
    return selectedIndex === question.answer;
  }

  /**
   * Calcule le pourcentage de score
   * @param {number} correct
   * @param {number} total
   * @returns {number} 0-100
   */
  function scorePercent(correct, total) {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  }

  /**
   * Met à jour le streak
   * @param {boolean} correct
   * @param {number} currentStreak
   * @param {number} maxStreak
   * @returns {{ currentStreak: number, maxStreak: number }}
   */
  function updateStreak(correct, currentStreak, maxStreak) {
    const newStreak = correct ? currentStreak + 1 : 0;
    return {
      currentStreak: newStreak,
      maxStreak: Math.max(maxStreak, newStreak)
    };
  }

  /**
   * Récupère le label Bloom en français
   * @param {string} bloom
   * @returns {string}
   */
  function bloomLabel(bloom) {
    const labels = {
      rappel: 'Rappel',
      comprehension: 'Compréhension',
      application: 'Application'
    };
    return labels[bloom] || bloom;
  }

  return {
    shuffle,
    buildQueue,
    isCorrect,
    scorePercent,
    updateStreak,
    bloomLabel
  };
})();
