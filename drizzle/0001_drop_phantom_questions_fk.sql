-- Migration manuelle — 2026-05-30
-- Contexte : la table user_answers portait DEUX clés étrangères sur question_id :
--   * user_answers_question_id_questions_id_fk   -> questions (table vestige, vide)
--   * user_answers_question_id_challenges_id_fk  -> challenges (correcte)
-- L'ancienne FK vers `questions` (héritée d'un schéma antérieur, jamais migré)
-- bloquait 100 % des INSERT puisque tout id de challenge est absent de `questions`.
-- Le schéma Drizzle (db/schema.ts) ne référence que challenges.id : cette contrainte
-- était un artefact présent uniquement en base. On la supprime.
--
-- Appliqué en production le 2026-05-30 (Neon). Idempotent.
--
-- Rollback (déconseillé — recasse les INSERT) :
--   ALTER TABLE user_answers
--     ADD CONSTRAINT user_answers_question_id_questions_id_fk
--     FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE;

ALTER TABLE user_answers
  DROP CONSTRAINT IF EXISTS user_answers_question_id_questions_id_fk;
