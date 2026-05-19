/* ============================================================
   QUIZ ATTACHÉ TERRITORIAL — state.test.js
   Tests unitaires pour le Store (state.js)
   Usage : node tests/state.test.js
   ============================================================ */
'use strict';

// Simuler localStorage avant d'importer state.js
global.localStorage = {
  _data: {},
  getItem(key) { return this._data[key] || null; },
  setItem(key, val) { this._data[key] = String(val); },
  removeItem(key) { delete this._data[key]; },
  clear() { this._data = {}; }
};

const { Store } = require('../js/state.js');

const MOCK_POOL = {
  chapters: [{
    id: 'test-chapter',
    title: 'Chapitre Test',
    icon: '📚',
    questions: [
      { id: 'q1', q: 'Question 1 ?', options: ['A', 'B', 'C', 'D'], answer: 0, bloom: 'rappel' },
      { id: 'q2', q: 'Question 2 ?', options: ['A', 'B', 'C', 'D'], answer: 1, bloom: 'comprehension' },
      { id: 'q3', q: 'Question 3 ?', options: ['A', 'B', 'C', 'D'], answer: 2, bloom: 'application' },
      { id: 'q4', q: 'Question 4 ?', options: ['A', 'B', 'C', 'D'], answer: 3, bloom: 'rappel' },
      { id: 'q5', q: 'Question 5 ?', options: ['A', 'B', 'C', 'D'], answer: 0, bloom: 'comprehension' }
    ]
  }]
};

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) { passed++; console.log(`  ✅ ${label}`); }
  else { failed++; console.error(`  ❌ ${label}`); }
}

function assertEqual(actual, expected, label) {
  const ok = actual === expected;
  if (ok) { passed++; console.log(`  ✅ ${label}`); }
  else { failed++; console.error(`  ❌ ${label} — attendu: ${JSON.stringify(expected)}, reçu: ${JSON.stringify(actual)}`); }
}

/* ============================================================
   TESTS
   ============================================================ */

console.log('\n📋 Tests Store — get/set');
assertEqual(Store.get('gameMode'), 'chill', 'gameMode par défaut = chill');
assertEqual(Store.get('questionCount'), 10, 'questionCount par défaut = 10');
assertEqual(Store.get('lives'), 3, 'lives par défaut = 3');
assertEqual(Store.get('score'), 0, 'score par défaut = 0');

Store.set('gameMode', 'lives');
assertEqual(Store.get('gameMode'), 'lives', 'set gameMode → lives');
Store.set('gameMode', 'chill');

console.log('\n📋 Tests Store — setAll');
Store.setAll({ score: 5, index: 2, answered: true });
assertEqual(Store.get('score'), 5, 'setAll score = 5');
assertEqual(Store.get('index'), 2, 'setAll index = 2');
assertEqual(Store.get('answered'), true, 'setAll answered = true');

console.log('\n📋 Tests Store — resetSession');
Store.resetSession();
assertEqual(Store.get('score'), 0, 'resetSession score = 0');
assertEqual(Store.get('index'), 0, 'resetSession index = 0');
assertEqual(Store.get('answered'), false, 'resetSession answered = false');
assertEqual(Store.get('lives'), 3, 'resetSession lives = 3');

console.log('\n📋 Tests Store — getChapter');
Store.set('pool', MOCK_POOL);
const ch = Store.getChapter('test-chapter');
assert(ch !== null, 'getChapter trouve le chapitre');
assertEqual(ch.title, 'Chapitre Test', 'getChapter retourne le bon titre');
const missing = Store.getChapter('inexistant');
assert(missing === null, 'getChapter retourne null pour chapitre inconnu');

console.log('\n📋 Tests Store — unseenCount');
assertEqual(Store.unseenCount('test-chapter'), 5, 'unseenCount = 5 (aucune vue)');
Store.addSeenId('q1');
assertEqual(Store.unseenCount('test-chapter'), 4, 'unseenCount = 4 après avoir vu q1');
Store.addSeenId('q2');
assertEqual(Store.unseenCount('test-chapter'), 3, 'unseenCount = 3 après avoir vu q1, q2');

console.log('\n📋 Tests Store — resetSeenIdsForChapter');
Store.resetSeenIdsForChapter('test-chapter');
assertEqual(Store.unseenCount('test-chapter'), 5, 'resetSeenIds → unseenCount = 5');

console.log('\n📋 Tests Store — subscribe');
let notified = null;
const unsub = Store.subscribe('score', (newVal) => { notified = newVal; });
Store.set('score', 42);
assertEqual(notified, 42, 'subscribe notifie sur set score');
unsub();
notified = null;
Store.set('score', 10);
assert(notified === null, 'unsubscribe fonctionne');

console.log('\n📋 Tests Store — subscribe * (wildcard)');
let wildcardKey = null;
const unsubWild = Store.subscribe('*', (key) => { wildcardKey = key; });
Store.set('lives', 2);
assertEqual(wildcardKey, 'lives', 'subscribe * notifie sur lives');
unsubWild();

console.log('\n📋 Tests Store — immutabilité get');
Store.set('pool', MOCK_POOL);
const poolCopy = Store.get('pool');
poolCopy.chapters = [];
const poolAfter = Store.get('pool');
assert(poolAfter.chapters.length === 1, 'get retourne une copie, pas de mutation externe');

console.log('\n📋 Tests Store — immutabilité seenIds');
Store.addSeenId('q3');
const ids = Store.get('seenIds');
ids.add('q4');
const idsAfter = Store.get('seenIds');
assert(!idsAfter.has('q4'), 'get seenIds retourne une copie');

/* ============================================================
   RÉSULTATS
   ============================================================ */
console.log(`\n${'='.repeat(40)}`);
console.log(`  Résultats : ${passed} ✅ / ${failed} ❌`);
console.log(`${'='.repeat(40)}\n`);

process.exit(failed > 0 ? 1 : 0);
