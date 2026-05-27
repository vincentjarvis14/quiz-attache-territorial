CREATE TYPE "public"."challenge_type" AS ENUM('SELECT');--> statement-breakpoint
CREATE TYPE "public"."matiere" AS ENUM('environnement_territorial', 'urbanisme');--> statement-breakpoint
CREATE TYPE "public"."quiz_mode" AS ENUM('free', 'challenge');--> statement-breakpoint
CREATE TYPE "public"."sous_theme_status" AS ENUM('not_started', 'in_progress', 'needs_review', 'mastered');--> statement-breakpoint
CREATE TABLE "challenge_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"challenge_id" integer NOT NULL,
	"text" text NOT NULL,
	"correct" boolean NOT NULL,
	"image_src" text,
	"audio_src" text
);
--> statement-breakpoint
CREATE TABLE "challenge_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"challenge_id" integer NOT NULL,
	"completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer NOT NULL,
	"type" "challenge_type" DEFAULT 'SELECT' NOT NULL,
	"question" text NOT NULL,
	"order" integer NOT NULL,
	"explanation" text NOT NULL,
	"source_chunk" text NOT NULL,
	"source_section" text,
	"difficulty" integer DEFAULT 2
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"sous_theme_id" integer NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"nom" text,
	"prenom" text,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"sous_theme_id" integer NOT NULL,
	"mode" "quiz_mode" DEFAULT 'free' NOT NULL,
	"hearts_remaining" integer DEFAULT 5,
	"total_questions" integer DEFAULT 0,
	"correct_answers" integer DEFAULT 0,
	"completed" boolean DEFAULT false,
	"current_question_index" integer DEFAULT 0,
	"question_ids" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sous_themes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"theme_id" integer NOT NULL,
	"order" integer NOT NULL,
	"pdf_file_name" text NOT NULL,
	"pdf_path" text
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"image_src" text,
	"order" integer NOT NULL,
	"matiere" "matiere" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"question_id" integer NOT NULL,
	"session_id" integer,
	"selected_answer" integer NOT NULL,
	"correct" boolean NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"user_id" text PRIMARY KEY NOT NULL,
	"user_name" text DEFAULT 'Utilisateur' NOT NULL,
	"user_image_src" text DEFAULT '/mascot.svg' NOT NULL,
	"active_theme_id" integer,
	"hearts" integer DEFAULT 5 NOT NULL,
	"points" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sous_theme_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"sous_theme_id" integer NOT NULL,
	"total_answered" integer DEFAULT 0,
	"correct_count" integer DEFAULT 0,
	"last_reviewed_at" timestamp,
	"status" "sous_theme_status" DEFAULT 'not_started'
);
--> statement-breakpoint
ALTER TABLE "challenge_options" ADD CONSTRAINT "challenge_options_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_progress" ADD CONSTRAINT "challenge_progress_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_sous_theme_id_sous_themes_id_fk" FOREIGN KEY ("sous_theme_id") REFERENCES "public"."sous_themes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_sous_theme_id_sous_themes_id_fk" FOREIGN KEY ("sous_theme_id") REFERENCES "public"."sous_themes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sous_themes" ADD CONSTRAINT "sous_themes_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_question_id_challenges_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_session_id_quiz_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."quiz_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_active_theme_id_themes_id_fk" FOREIGN KEY ("active_theme_id") REFERENCES "public"."themes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sous_theme_progress" ADD CONSTRAINT "user_sous_theme_progress_sous_theme_id_sous_themes_id_fk" FOREIGN KEY ("sous_theme_id") REFERENCES "public"."sous_themes"("id") ON DELETE cascade ON UPDATE no action;