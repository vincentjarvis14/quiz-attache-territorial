// Extraction du code source RÉEL des requêtes, au build (Server Component only).
// On lit les fichiers .ts du dépôt et on découpe chaque fonction par équilibrage
// des délimiteurs { } ( ) [ ] (en neutralisant chaînes et commentaires).
// → le code affiché dans le rapport est exactement celui qui tourne, sans recopie.

import fs from "node:fs";
import path from "node:path";

const FILES = {
  q: "db/queries.ts",
  ans: "actions/answers.ts",
  sm: "actions/self-mastery.ts",
  up: "actions/user-progress.ts",
  rag: "lib/rag.ts",
} as const;

type FileKey = keyof typeof FILES;
type Matcher = { file: FileKey; prefix: string };

// name (identique au catalogue) → fonction(s) source à extraire, dans l'ordre.
const MATCHERS: Record<string, Matcher[]> = {
  "getThemes()": [{ file: "q", prefix: "export const getThemes = cache(" }],
  "getThemeById(id)": [{ file: "q", prefix: "export const getThemeById = cache(" }],
  "getSousThemes()": [{ file: "q", prefix: "export const getSousThemes = cache(" }],
  "getSousThemesWithProgress()": [{ file: "q", prefix: "export const getSousThemesWithProgress = cache(" }],
  "getLesson(id?)": [{ file: "q", prefix: "export const getLesson = cache(" }],
  "getCourseProgress()": [{ file: "q", prefix: "export const getCourseProgress = cache(" }],
  "getQuestionsPool(ids, limit)": [{ file: "q", prefix: "export async function getQuestionsPool(" }],
  "getQuestionsForSousTheme(…)": [{ file: "q", prefix: "export async function getQuestionsForSousTheme(" }],
  "createQuizSession(…)": [{ file: "q", prefix: "export async function createQuizSession(" }],
  "getActiveSession(userId)": [{ file: "q", prefix: "export async function getActiveSession(" }],
  "updateQuizSession(…)": [{ file: "q", prefix: "export async function updateQuizSession(" }],
  "getDueCards(limit)": [{ file: "q", prefix: "export async function getDueCards(" }],
  "getRevisionCount()": [{ file: "q", prefix: "export async function getRevisionCount(" }],
  "getWeaknessQuestions(userId)": [{ file: "q", prefix: "export async function getWeaknessQuestions(" }],
  "getMostMissedQuestions()": [{ file: "q", prefix: "export const getMostMissedQuestions = cache(" }],
  "getUserProgress()": [{ file: "q", prefix: "export const getUserProgress = cache(" }],
  "getThemeProgress(userId)": [{ file: "q", prefix: "export async function getThemeProgress(" }],
  "getProgressionBySousTheme()": [{ file: "q", prefix: "export const getProgressionBySousTheme = cache(" }],
  "getSousThemeStats(id)": [{ file: "q", prefix: "export const getSousThemeStats = cache(" }],
  "getSelfMastery() · getSelfMasteryMap()": [
    { file: "q", prefix: "export async function getSelfMasteryMap(" },
    { file: "q", prefix: "export async function getSelfMastery(" },
  ],
  "getLibraryCatalog()": [{ file: "q", prefix: "export const getLibraryCatalog = unstable_cache(" }],
  "getLibraryTheme(slug)": [{ file: "q", prefix: "export const getLibraryTheme = unstable_cache(" }],
  "getSousThemeReading(…)": [{ file: "q", prefix: "export const getSousThemeReading = unstable_cache(" }],
  "searchLegalChunks(query)": [{ file: "rag", prefix: "export async function searchLegalChunks(" }],
  "searchQuestionsByText(search)": [{ file: "q", prefix: "export async function searchQuestionsByText(" }],
  "recordAnswer(…) → saveUserAnswer(…)": [
    { file: "ans", prefix: "export async function recordAnswer(" },
    { file: "q", prefix: "export async function saveUserAnswer(" },
  ],
  "setSelfMastery(id, niveau)": [{ file: "sm", prefix: "export async function setSelfMastery(" }],
  "upsertUserProgress(themeId)": [{ file: "up", prefix: "export const upsertUserProgress = async (" }],
  "getMarketingStats()": [{ file: "q", prefix: "export const getMarketingStats = unstable_cache(" }],
};

// Neutralise chaînes ('...', "...", `...`) et commentaires // pour ne compter
// que les vrais délimiteurs de structure.
function maskLine(line: string): string {
  let out = "";
  let str: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (str) {
      out += " ";
      if (c === str) str = null;
      continue;
    }
    if (c === "/" && line[i + 1] === "/") break;
    if (c === '"' || c === "'" || c === "`") {
      str = c;
      out += " ";
      continue;
    }
    out += c;
  }
  return out;
}

function delta(masked: string): number {
  let d = 0;
  for (const c of masked) {
    if (c === "{" || c === "(" || c === "[") d++;
    else if (c === "}" || c === ")" || c === "]") d--;
  }
  return d;
}

function sliceFunction(src: string, prefix: string): string {
  const lines = src.split("\n");
  const start = lines.findIndex((l) => l.startsWith(prefix));
  if (start === -1) return "";
  let depth = 0;
  let seenBrace = false;
  const out: string[] = [];
  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    out.push(line);
    const masked = maskLine(line);
    if (masked.includes("{")) seenBrace = true;
    depth += delta(masked);
    if (seenBrace && depth <= 0) break;
  }
  return out.join("\n");
}

const fileCache = new Map<FileKey, string>();
function readFile(key: FileKey): string {
  if (!fileCache.has(key)) {
    try {
      fileCache.set(key, fs.readFileSync(path.join(process.cwd(), FILES[key]), "utf8"));
    } catch {
      fileCache.set(key, "");
    }
  }
  return fileCache.get(key)!;
}

export type QuerySource = { file: string; code: string };

export function getQuerySource(): Record<string, QuerySource> {
  const result: Record<string, QuerySource> = {};
  for (const [name, matchers] of Object.entries(MATCHERS)) {
    const parts: string[] = [];
    const files = new Set<string>();
    for (const m of matchers) {
      const code = sliceFunction(readFile(m.file), m.prefix);
      if (code) {
        parts.push(code);
        files.add(FILES[m.file]);
      }
    }
    if (parts.length) {
      result[name] = { file: [...files].join(" · "), code: parts.join("\n\n") };
    }
  }
  return result;
}
