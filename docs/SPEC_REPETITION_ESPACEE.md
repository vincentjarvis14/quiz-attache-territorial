# Spec — Répétition espacée & rappel actif

> Statut : **validée pour la Phase 1** (cadrage, pas encore implémenté).
> Contrainte clé : **zéro appel LLM au runtime**. La génération de contenu (rationale, cloze)
> se fait **hors-ligne par Opus** au moment du seed, comme les questions actuelles (Option A).
> Concours cible : **septembre** (≈ 3 mois de préparation à partir de fin mai).

## Principe directeur

Une **« carte »** = une question vue par un utilisateur. Chaque carte possède un **calendrier**
(`dueAt` = date de prochaine révision). Le mode « révision » devient **« les cartes dues aujourd'hui »**.
Tout le calcul se fait en base + JS au runtime — aucune IA en production.

---

## 1. Répétition espacée — algorithme Leitner

Réponses binaires (juste / faux) → **Leitner** (transparent, simple à déboguer).
SM-2 reste une évolution possible si on ajoute plus tard un ressenti « facile / moyen / dur ».

**Échelle de boîtes (intervalle en jours) — plafonnée à 30 j (adaptée à septembre) :**

```
boîte :    0   1   2   3   4    5    6
jours :    0   1   2   4   8   16   30
```

- Boîte 0 = rejouée dans la même session.
- Boîte 6 = revue tous les 30 j (plafond : une carte maîtrisée repasse quand même ~2-3× avant l'examen).

**Règles de transition :**
- Réponse **correcte** → la carte **monte d'une boîte** (max 6). `dueAt = maintenant + jours[nouvelle boîte]`.
- Réponse **fausse** → la carte **retombe en boîte 0**, `dueAt = maintenant` (revue très vite). `lapses += 1`.

**Garde-fous liés à la date du concours :**
- **Plafond examen** : si `dueAt` calculé tombe **après la date du concours**, on le ramène à `min(dueAt, dateConcours - 1j)` → tout est revu au moins une fois avant l'épreuve.
- **Sprint final** (optionnel, dernière semaine) : on ignore les boîtes et on repasse l'ensemble (révision intensive).

---

## 2. Oubli simulé (decay)

Aucun champ supplémentaire — déduit du temps écoulé :

- **Niveau carte** : une carte est « à revoir » dès que `dueAt < maintenant` (mécanique naturelle du SRS).
- **Niveau sous-thème** : un sous-thème « maîtrisé » repasse en `needs_review` si :
  - il a **≥ X cartes en retard** (`dueAt` dépassé), ou
  - **aucune révision depuis N jours** (`lastReviewedAt`, colonne déjà présente).
  - Valeurs de départ proposées : `X = 3`, `N = 14`. Calculé à l'affichage du tableau de bord (dérivé, non stocké).

---

## 3. Modèle de données

### Nouvelle table `user_question_srs`
État courant du planning (le journal brut reste `user_answers`).

| colonne | type | rôle |
|---|---|---|
| `id` | serial PK | |
| `userId` | text | utilisateur / invité |
| `questionId` | int → `challenges.id` (cascade) | la question |
| `box` | int (0–6), défaut 0 | boîte Leitner actuelle |
| `dueAt` | timestamp | prochaine révision |
| `lastReviewedAt` | timestamp | dernière vue |
| `lapses` | int, défaut 0 | nb d'oublis (diagnostic) |
| contrainte | UNIQUE (`userId`, `questionId`) | une carte par couple |

Index conseillé : `(userId, dueAt)` pour récupérer vite les cartes dues.

### Réglage : date du concours
Stocker la **date du concours** par utilisateur (ex. colonne `examDate` sur `user_progress`,
ou table de réglages). Utilisée par le plafond examen et la future « prévision de couverture ».

---

## 4. Intégration au code existant

| Existant | Évolution Phase 1 |
|---|---|
| `getRevisionQuestions()` (db/queries.ts) | devient `getDueCards()` : `WHERE dueAt <= now ORDER BY dueAt`, complété par les questions jamais vues si peu de cartes dues. |
| `getRevisionCount()` | = nombre de cartes dues aujourd'hui. |
| `saveUserAnswer()` | après le log de la réponse → **upsert `user_question_srs`** (monte/descend la boîte, recalcule `dueAt` avec plafond examen). |
| Tableau de bord `/progression` | applique la règle de decay du sous-thème. |
| Mode `/lesson?mode=revision` | s'appuie sur `getDueCards()`. |

---

## 5. Runtime sans LLM (rappel)

- Calcul des boîtes / `dueAt` : arithmétique de dates.
- Decay : comparaison de timestamps.
- (Phases suivantes) correction des cloze : normalisation de chaîne (minuscules, sans accents, trim)
  + comparaison à la réponse et ses variantes.

Aucune de ces opérations n'appelle un LLM.

---

## 6. Découpage en phases

- **Phase 1 — SRS + oubli simulé** ✅ (à implémenter en premier)
  Table `user_question_srs`, logique de boîtes dans `saveUserAnswer`, `getDueCards`,
  réglage date concours + plafond examen, decay du tableau de bord.
  *Fonctionne avec les QCM existants, sans nouveau contenu.*
- **Phase 2 — Explication par option (rationale)**
  Colonne `challenge_options.rationale` + génération Opus hors-ligne + affichage après réponse.
- **Phase 3 — Rappel actif**
  (a) QCM en deux temps (front, sans schéma) ; (b) cloze : valeur d'enum `CLOZE`,
  colonnes `challenges.clozeAnswer` + `clozeAlternatives`, correction par comparaison de chaînes,
  génération Opus hors-ligne. Les cloze entrent dans la même boucle SRS.

---

## 7. Migrations (Phase 1, non destructives)

1. `CREATE TABLE user_question_srs (...)` + index `(userId, dueAt)`.
2. Ajout du réglage date concours (`user_progress.examDate` ou table dédiée).

> À pousser via `npm run db:generate` puis `npm run db:migrate` (revue du SQL avant).
> **Ne pas** utiliser `db:push` à l'aveugle (diff destructif possible).

---

## 8. Tests de validation (Phase 1)

- Répondre juste à une carte plusieurs fois → vérifier la montée des boîtes et les `dueAt` attendus
  (J+1, J+2, J+4, J+8, J+16, J+30).
- Répondre faux → retour boîte 0, `dueAt ≈ maintenant`, `lapses` incrémenté.
- `getDueCards()` ne renvoie que les cartes dont `dueAt <= now`.
- Plafond examen : une carte qui dépasserait septembre est ramenée avant la date du concours.
- Decay : un sous-thème maîtrisé avec ≥3 cartes en retard repasse « à revoir ».

---

# Revue de conception — Phase 1 (avant code)

Analyse des chemins réels (`actions/answers.ts`, `db/queries.ts`, `app/lesson/*`). Décisions
prises pour éviter les pièges identifiés.

## 🔴 Pièges critiques

1. **La mise à jour SRS doit tourner même en mode révision.**
   `recordAnswer({…, revision})` appelle `saveUserAnswer(…, updateProgress = !revision)`, et
   `saveUserAnswer` fait un `return` anticipé quand `updateProgress === false` (ligne ~906).
   → L'upsert SRS doit être placé **juste après l'insert dans `user_answers`**, **AVANT** le
   garde-fou `if (!updateProgress) return;`. Sinon réviser ne replanifie rien (bug fatal).
   La SRS se met à jour à **chaque** réponse (mode normal ET révision) ; le flag `revision` ne
   pilote que les compteurs de sous-thème, pas la planification.

2. **Granularité = le JOUR, pas l'horodatage.**
   Si `dueAt` = 14:00 et qu'on révise à 10:00, la carte semblerait « pas encore due » → frustrant.
   → On normalise `dueAt` à **minuit (début de journée)**. « Due » = `dueAt <= aujourd'hui (fin de journée)`.
   Une carte programmée pour un jour est disponible toute la journée.

## 🟠 Décisions de conception

3. **Upsert atomique par carte.** Les `recordAnswer` sont tirés en parallèle (fire-and-forget,
   `pending.current.push(...)` sans `await`). Chaque appel concerne une **question distincte** dans
   un quiz → pas de conflit sur la même ligne. On fait read-then-write simple par carte
   (lecture de la boîte courante → calcul JS → upsert `ON CONFLICT (userId, questionId)`).
   Hypothèse documentée : une même question n'est pas répondue deux fois en parallèle.

4. **Carte neuve (pas de ligne SRS).** Première réponse à une question :
   - correcte → `box = 1`, `dueAt = aujourd'hui + 1 j`.
   - fausse → `box = 0`, `dueAt = aujourd'hui`.

5. **`getDueCards()` garde EXACTEMENT la forme de retour de `getRevisionQuestions`**
   (`challenges` + `with: { challengeOptions: true }`) pour que `toQuizQuestion()` (app/lesson/page.tsx)
   et le mapping ne changent pas. Sélection : `WHERE dueAt <= now ORDER BY dueAt ASC LIMIT n`,
   complétée par des questions **jamais vues** (sans ligne SRS) si moins de `n` cartes dues.
   Révision reste **inter-matières** (comportement actuel conservé).

6. **`getRevisionCount()` = nombre de cartes dues aujourd'hui.** Sur un compte neuf (aucune ligne
   SRS), le compteur vaut 0 → le badge « révision » signifie bien « cartes à revoir aujourd'hui ».
   L'utilisateur étudie alors via les autres modes (libre/leçon) qui créeront les cartes.

7. **Decay du sous-thème = display-only.** Calculé à l'affichage du tableau de bord (fonction pure
   sur `lastReviewedAt` + nombre de cartes en retard). **On ne réécrit pas** le statut en base
   (pas d'effet de bord en lecture, compatible avec le cache). N'altère donc pas la sélection SRS.

8. **Date du concours.** Colonne `examDate` (timestamp, nullable) sur `user_progress`. Si absente,
   pas de plafond. Défaut applicatif proposé : `2026-09-15` (à confirmer/régler). Sert au plafond
   examen et à la future « prévision de couverture ».

9. **Backfill de l'historique existant.** L'utilisatrice a déjà des réponses dans `user_answers`
   sans ligne SRS. Sans rien faire, ces questions seraient traitées comme « neuves ».
   → Script one-shot : pour chaque (`userId`, `questionId`) répondu, créer une ligne SRS d'après la
   **dernière** réponse (correcte → `box 1`, due +1 j ; fausse → `box 0`, due aujourd'hui).
   Conservateur et adapté aux 3 mois restants.

## 🟡 Robustesse (optionnel, recommandé)

10. **Recalcule `correct` côté serveur.** Aujourd'hui `correct` est calculé côté client
    (`selectedIdx === correctIndex`) et envoyé. Pour fiabiliser la SRS, `saveUserAnswer` peut
    recomparer `selectedAnswer` aux `challenge_options` en base. Non bloquant (app mono-user) mais
    évite qu'un bug client fausse le planning.

11. **Pas de `unstable_cache` sur les requêtes de cartes dues** (sinon comptes/listes périmés).
    Garder `getDueCards`/`getRevisionCount` en requêtes fraîches par requête HTTP.

## Impact fichiers (Phase 1)

- `db/schema.ts` : table `userQuestionSrs` (+ index `(userId, dueAt)`), colonne `userProgress.examDate`.
- `db/queries.ts` : `saveUserAnswer` (upsert SRS avant le garde-fou), `getDueCards`, `getRevisionCount`,
  helper de decay pour le tableau de bord.
- `app/lesson/page.tsx` : brancher `getDueCards` à la place de `getRevisionQuestions` (forme identique).
- `lib/srs.ts` (nouveau) : constantes (échelle de boîtes), calcul `nextBox`/`nextDueAt` + plafond examen
  (logique pure, testable unitairement, zéro I/O).
- `scripts/backfill-srs.ts` (nouveau) : amorçage depuis `user_answers`.
- Migrations : `db:generate` → revue SQL → `db:migrate`.

## Ordre d'implémentation sûr

1. `lib/srs.ts` (pur, testable) → 2. schéma + migration (revue) → 3. `saveUserAnswer` (upsert) →
4. `getDueCards`/`getRevisionCount` → 5. branchement `app/lesson/page.tsx` → 6. decay dashboard →
7. backfill → 8. tests de validation (section 8 ci-dessus).
