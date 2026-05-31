import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { Block } from "@/lib/clean-section";

// ─── Énumérations ───────────────────────────────────────────────

export const sousThemeStatusEnum = pgEnum("sous_theme_status", [
  "not_started",
  "in_progress",
  "needs_review",
  "mastered",
]);

// Niveau de maîtrise auto-déclaré par le lecteur (3 niveaux).
export const masteryLevelEnum = pgEnum("mastery_level", [
  "a_revoir",
  "en_cours",
  "maitrise",
]);

export const quizModeEnum = pgEnum("quiz_mode", ["free", "challenge"]);

export const matiereEnum = pgEnum("matiere", [
  "environnement_territorial",
  "urbanisme",
]);

export const challengeTypeEnum = pgEnum("challenge_type", ["SELECT"]);

// ─── Thèmes (matières) ──────────────────────────────────────────
// Correspond à "Course" dans le modèle Duolingo

export const themes = pgTable("themes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageSrc: text("image_src"),
  order: integer("order").notNull(),
  matiere: matiereEnum("matiere").notNull(),
});

export const themesRelations = relations(themes, ({ many }) => ({
  sousThemes: many(sousThemes),
  userProgress: many(userProgress),
}));

// ─── Sous-thèmes (correspondent aux PDFs) ───────────────────────
// Correspond à "Unit" dans le modèle Duolingo

export const sousThemes = pgTable("sous_themes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  themeId: integer("theme_id")
    .references(() => themes.id, { onDelete: "cascade" })
    .notNull(),
  order: integer("order").notNull(),
  pdfFileName: text("pdf_file_name").notNull(),
  pdfPath: text("pdf_path"),
});

export const sousThemesRelations = relations(sousThemes, ({ one, many }) => ({
  theme: one(themes, {
    fields: [sousThemes.themeId],
    references: [themes.id],
  }),
  lessons: many(lessons),
  userProgress: many(userSousThemeProgress),
}));

// ─── Leçons (groupes de questions) ──────────────────────────────
// Correspond à "Lesson" dans le modèle Duolingo
// Chaque sous-thème peut avoir 2-3 leçons de ~6-8 questions

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  sousThemeId: integer("sous_theme_id")
    .references(() => sousThemes.id, { onDelete: "cascade" })
    .notNull(),
  order: integer("order").notNull(),
});

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  sousTheme: one(sousThemes, {
    fields: [lessons.sousThemeId],
    references: [sousThemes.id],
  }),
  challenges: many(challenges),
}));

// ─── Sections sources (texte intégral extrait des PDF) ──────────
// Une section = un bloc thématique du cours, source des extraits de questions

export const sections = pgTable("sections", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  contentClean: jsonb("content_clean").$type<Block[]>(),
  sourcePdf: text("source_pdf"),
  pageStart: integer("page_start"),
});

export const sectionsRelations = relations(sections, ({ many }) => ({
  challenges: many(challenges),
}));

// ─── Challenges (questions) ─────────────────────────────────────
// Correspond à "Challenge" dans le modèle Duolingo

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id")
    .references(() => lessons.id, { onDelete: "cascade" })
    .notNull(),
  type: challengeTypeEnum("type").notNull().default("SELECT"),
  question: text("question").notNull(),
  order: integer("order").notNull(),
  explanation: text("explanation").notNull(),
  sourceChunk: text("source_chunk").notNull(),
  sourceSection: text("source_section"),
  sourceSectionId: text("source_section_id").references(() => sections.id, {
    onDelete: "set null",
  }),
  difficulty: integer("difficulty").default(2),
});

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [challenges.lessonId],
    references: [lessons.id],
  }),
  section: one(sections, {
    fields: [challenges.sourceSectionId],
    references: [sections.id],
  }),
  challengeOptions: many(challengeOptions),
  challengeProgress: many(challengeProgress),
}));

// ─── Options de challenge (réponses possibles) ──────────────────
// Correspond à "ChallengeOption" dans le modèle Duolingo

export const challengeOptions = pgTable("challenge_options", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
  text: text("text").notNull(),
  correct: boolean("correct").notNull(),
  imageSrc: text("image_src"),
  audioSrc: text("audio_src"),
});

export const challengeOptionsRelations = relations(challengeOptions, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeOptions.challengeId],
    references: [challenges.id],
  }),
}));

// ─── Progression des challenges (réponses utilisateur) ──────────
// Correspond à "ChallengeProgress" dans le modèle Duolingo

export const challengeProgress = pgTable("challenge_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const challengeProgressRelations = relations(challengeProgress, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeProgress.challengeId],
    references: [challenges.id],
  }),
}));

// ─── Progression utilisateur ────────────────────────────────────
// Points, coeurs, thème actif

export const userProgress = pgTable("user_progress", {
  userId: text("user_id").primaryKey(),
  userName: text("user_name").notNull().default("Utilisateur"),
  userImageSrc: text("user_image_src").notNull().default("/mascot.svg"),
  activeThemeId: integer("active_theme_id")
    .references(() => themes.id, { onDelete: "set null" }),
  hearts: integer("hearts").notNull().default(5),
  points: integer("points").notNull().default(0),
  // Date du concours (réglage utilisateur) — sert au plafond de planification SRS.
  examDate: timestamp("exam_date"),
});

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  activeTheme: one(themes, {
    fields: [userProgress.activeThemeId],
    references: [themes.id],
  }),
}));

// ─── Progression par sous-thème ─────────────────────────────────

export const userSousThemeProgress = pgTable("user_sous_theme_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  sousThemeId: integer("sous_theme_id")
    .references(() => sousThemes.id, { onDelete: "cascade" })
    .notNull(),
  totalAnswered: integer("total_answered").default(0),
  correctCount: integer("correct_count").default(0),
  lastReviewedAt: timestamp("last_reviewed_at"),
  status: sousThemeStatusEnum("status").default("not_started"),
  // Niveau auto-déclaré par le lecteur (null = non évalué).
  selfMastery: masteryLevelEnum("self_mastery"),
});

export const userSousThemeProgressRelations = relations(
  userSousThemeProgress,
  ({ one }) => ({
    sousTheme: one(sousThemes, {
      fields: [userSousThemeProgress.sousThemeId],
      references: [sousThemes.id],
    }),
  })
);

// ─── Sessions de quiz (pour le mode libre) ──────────────────────

export const quizSessions = pgTable("quiz_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  sousThemeId: integer("sous_theme_id")
    .references(() => sousThemes.id, { onDelete: "cascade" })
    .notNull(),
  mode: quizModeEnum("mode").notNull().default("free"),
  heartsRemaining: integer("hearts_remaining").default(5),
  totalQuestions: integer("total_questions").default(0),
  correctAnswers: integer("correct_answers").default(0),
  completed: boolean("completed").default(false),
  currentQuestionIndex: integer("current_question_index").default(0),
  questionIds: jsonb("question_ids").$type<number[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quizSessionsRelations = relations(quizSessions, ({ one, many }) => ({
  sousTheme: one(sousThemes, {
    fields: [quizSessions.sousThemeId],
    references: [sousThemes.id],
  }),
  answers: many(userAnswers),
}));

// ─── Réponses de l'utilisateur (mode libre) ─────────────────────

export const userAnswers = pgTable("user_answers", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  questionId: integer("question_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
  sessionId: integer("session_id")
    .references(() => quizSessions.id, { onDelete: "cascade" }),
  selectedAnswer: integer("selected_answer").notNull(),
  correct: boolean("correct").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAnswersRelations = relations(userAnswers, ({ one }) => ({
  question: one(challenges, {
    fields: [userAnswers.questionId],
    references: [challenges.id],
  }),
  session: one(quizSessions, {
    fields: [userAnswers.sessionId],
    references: [quizSessions.id],
  }),
}));

// ─── Répétition espacée (Leitner) ───────────────────────────────
// État courant de planification d'une "carte" = (utilisateur, question).
// Le journal brut des réponses reste user_answers ; cette table est dérivée.

export const userQuestionSrs = pgTable(
  "user_question_srs",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    questionId: integer("question_id")
      .references(() => challenges.id, { onDelete: "cascade" })
      .notNull(),
    box: integer("box").notNull().default(0), // boîte Leitner 0..6
    dueAt: timestamp("due_at").notNull(), // prochaine révision (normalisée minuit)
    lastReviewedAt: timestamp("last_reviewed_at").notNull().defaultNow(),
    lapses: integer("lapses").notNull().default(0), // nb d'oublis (diagnostic)
  },
  (t) => [
    // une seule carte par (utilisateur, question)
    uniqueIndex("uqs_user_question_unique").on(t.userId, t.questionId),
    // récupération rapide des cartes dues
    index("uqs_user_due_idx").on(t.userId, t.dueAt),
  ]
);

export const userQuestionSrsRelations = relations(userQuestionSrs, ({ one }) => ({
  question: one(challenges, {
    fields: [userQuestionSrs.questionId],
    references: [challenges.id],
  }),
}));

// ─── Chunks du Code de l'urbanisme (RAG BM25) ───────────────────
// Chaque ligne = un article ou groupe d'articles du Code de l'urbanisme
// Indexé avec tsvector français pour la recherche full-text

export const legalChunks = pgTable("legal_chunks", {
  id: serial("id").primaryKey(),
  sourceDoc: text("source_doc").notNull().default("code_urbanisme"),
  articleRef: text("article_ref"),   // ex: "L111-1", "R*420-1"
  title: text("title"),
  headingPath: text("heading_path"), // fil d'Ariane: "Titre V › Chapitre III › Section 4"
  content: text("content").notNull(),
  pageNumber: integer("page_number"),
  chunkIndex: integer("chunk_index"),
});

// ─── Mapping section de cours → articles du Code (RAG) ──────────
// Pré-calculé : pour chaque section (urbanisme), les articles du Code
// de l'urbanisme les plus pertinents. Alimente les encarts pédagogiques.

export const sectionLegalRefs = pgTable("section_legal_refs", {
  id: serial("id").primaryKey(),
  sectionId: text("section_id")
    .references(() => sections.id, { onDelete: "cascade" })
    .notNull(),
  chunkId: integer("chunk_id")
    .references(() => legalChunks.id, { onDelete: "cascade" })
    .notNull(),
  articleRef: text("article_ref"),
  position: integer("position").notNull(), // 0 = plus pertinent
});

// ─── Profil utilisateur (étendu Supabase) ───────────────────────

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  nom: text("nom"),
  prenom: text("prenom"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});
