/**
 * semantic-search.ts — Recherche sémantique 100% locale (navigateur).
 *
 * Le modèle d'embedding (multilingual-e5-small) est exécuté côté client via
 * Transformers.js (runtime ONNX WASM/WebGPU). La requête de l'utilisatrice est
 * encodée dans le navigateur puis comparée par similarité cosinus aux vecteurs
 * pré-calculés (public/rag/challenge-embeddings.json). Aucun appel API facturé.
 *
 * À n'importer que depuis du code client ("use client").
 */

const MODEL = "Xenova/multilingual-e5-small";
const EMBEDDINGS_URL = "/rag/challenge-embeddings.json";

export type ChallengeItem = {
  id: number;
  question: string;
  explanation: string;
  sectionId: string | null;
  sousThemeId: number;
  sousTheme: string;
  theme: string;
  matiere: string;
  vec: number[];
};

export type SearchResult = Omit<ChallengeItem, "vec"> & { score: number };

type ProgressCb = (p: { status: string; progress?: number }) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let extractorPromise: Promise<any> | null = null;
let itemsPromise: Promise<ChallengeItem[]> | null = null;

/** Charge (une seule fois) le pipeline d'extraction de features. */
function getExtractor(onProgress?: ProgressCb) {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const { pipeline, env } = await import("@huggingface/transformers");
      // Les poids sont récupérés depuis le CDN Hugging Face (fichiers statiques),
      // puis mis en cache par le navigateur. Pas de modèle local embarqué.
      env.allowLocalModels = false;
      return pipeline("feature-extraction", MODEL, {
        progress_callback: (p: { status: string; progress?: number }) =>
          onProgress?.(p),
      });
    })();
  }
  return extractorPromise;
}

/** Charge (une seule fois) les embeddings pré-calculés des questions. */
function getItems() {
  if (!itemsPromise) {
    itemsPromise = fetch(EMBEDDINGS_URL)
      .then((r) => {
        if (!r.ok) throw new Error("Embeddings introuvables");
        return r.json();
      })
      .then((data) => data.items as ChallengeItem[]);
  }
  return itemsPromise;
}

/** Précharge modèle + index en tâche de fond (à appeler au montage). */
export async function warmUp(onProgress?: ProgressCb) {
  await Promise.all([getExtractor(onProgress), getItems()]);
}

function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

/**
 * Recherche sémantique : encode la requête puis renvoie les questions les plus
 * proches par cosinus. Les vecteurs sont normalisés → cosinus = produit scalaire.
 */
export async function search(
  query: string,
  topK = 8,
  onProgress?: ProgressCb
): Promise<SearchResult[]> {
  const [extractor, items] = await Promise.all([
    getExtractor(onProgress),
    getItems(),
  ]);

  // e5 demande le préfixe "query:" pour les requêtes.
  const output = await extractor(`query: ${query}`, {
    pooling: "mean",
    normalize: true,
  });
  const qVec = Array.from(output.data as Float32Array);

  return items
    .map((it) => {
      const { vec, ...rest } = it;
      return { ...rest, score: dot(qVec, vec) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
