// Nettoyage du texte de section extrait des PDF → blocs structurés lisibles.
//
// Le texte brut contient : boilerplate "Centre National… — Page N", titre de
// document répété en en-tête courant, numéros de section (1.1.2.3), puces
// cassées, listes aplaties en prose, et retours à la ligne PDF arbitraires.
//
// On reconstruit des blocs typés : titres, listes à puces, paragraphes.

export type Block =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "reference"; articles: string[] };

// Ligne "Référence : L. 321-1 du Code de l'urbanisme" → bloc dédié.
const REFERENCE_PREFIX = /^Références?\s*:\s*/i;

// Extrait les citations légales multiples séparées par " et ".
function parseArticleRefs(text: string): string[] {
  // Retire le préfixe "article(s) " optionnel
  const t = text.replace(/^articles?\s+/i, "").trim();
  return t
    .split(/\s+et\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const BOILERPLATE =
  /^centre national de la fonction publique territoriale.*page\s*\d+\s*$/i;
const PAGE_TAG = /—\s*page\s*\d+\s*$/i;
const NUMBER_PREFIX = /^\s*\d+(?:\.\d+)*\.?\s+/;
// Une ligne qui n'est QUE un numéro de section (ex: "1.1.2.3.1.4").
const PURE_NUMBER = /^\d+(?:\.\d+)*\.?$/;
// Préfixe numéro de sous-section au début d'un bloc (ex: "1.1.2 Titre…").
const INLINE_NUMBER = /^\d+(?:\.\d+){1,}\.?\s+/;
// Ponctuation forte de fin (hors ":" qui annonce souvent une liste).
const TERMINAL = /[.!?»"”)\]…]\s*$/;

// Découpe un bloc en phrases (garde la ponctuation finale).
// Protège les numéros d'articles de loi (L. 321, R. 421, art. 12…) pour
// éviter que le point abréviatif soit pris pour une fin de phrase.
function splitSentences(text: string): string[] {
  const safe = text.replace(/\b(art|[LRDA])\.\s*(\d)/gi, "$1\x00$2");
  const parts = safe.match(/[^.!?»]+(?:[.!?»]+|$)/g);
  if (!parts) return [text];
  return parts
    .map((s) => s.replace(/(art|[LRDA])\x00(\d)/gi, "$1. $2").trim())
    .filter(Boolean);
}

// Regroupe ~2-3 phrases par paragraphe pour aérer les longs blocs sans saut.
function chunkLongBlock(block: string, maxLen = 600): string[] {
  if (block.length <= maxLen) return [block];
  const sentences = splitSentences(block);
  const out: string[] = [];
  let buf = "";
  for (const s of sentences) {
    const candidate = buf ? `${buf} ${s}` : s;
    if (candidate.length > maxLen && buf) {
      out.push(buf);
      buf = s;
    } else {
      buf = candidate;
    }
  }
  if (buf) out.push(buf);
  return out;
}

const isHeadingLike = (s: string) =>
  s.length <= 80 && !/[.!?:;,]$/.test(s.trim());

// Découpe un bloc « énumération » en items. Sépare sur virgules si plusieurs,
// sinon renvoie l'item unique (en retirant la ponctuation de fin).
function splitItems(b: string): string[] {
  const t = b.replace(/\s*[.,…]+\s*$/, "").trim();
  if ((t.match(/,/g) || []).length >= 2) {
    return t
      .split(/\s*,\s*/)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return t ? [t] : [];
}

// Un bloc ressemble-t-il à un item de liste (dans un contexte de liste) ?
// "continue" = item + la liste continue ; "last" = item final ; "no" = prose.
function itemKind(b: string): "continue" | "last" | "no" {
  const t = b.trim();
  if (/[,…]$/.test(t)) return "continue";
  if (t.length <= 120) return "last";
  return "no";
}

export function cleanToBlocks(
  raw: string,
  opts: { title?: string } = {},
): Block[] {
  if (!raw) return [];

  const lines = raw.replace(/\r\n?/g, "\n").split("\n");

  // 1. Repère le titre courant du document : la 1ʳᵉ ligne non vide après un
  //    boilerplate. On supprimera toutes ses occurrences.
  let runningHeader: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    if (BOILERPLATE.test(lines[i].trim())) {
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === "") j++;
      if (j < lines.length) runningHeader = lines[j].trim();
      break;
    }
  }

  const sectionTitle = opts.title?.trim();

  // 2. Filtre le bruit ligne par ligne, en préservant les lignes vides
  //    (séparateurs de paragraphes).
  const cleaned: string[] = [];
  let firstContentSeen = false;
  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line === "") {
      cleaned.push("");
      continue;
    }
    if (BOILERPLATE.test(line) || PAGE_TAG.test(line)) continue;
    if (runningHeader && line === runningHeader) continue;

    // Retire la ligne de titre en tête (préfixe numéroté ou égale au titre).
    if (!firstContentSeen) {
      const stripped = line.replace(NUMBER_PREFIX, "").trim();
      if (
        (sectionTitle && stripped === sectionTitle) ||
        (NUMBER_PREFIX.test(line) && stripped.length < 90)
      ) {
        firstContentSeen = true;
        continue;
      }
    }
    firstContentSeen = true;

    // Force un bloc isolé pour les lignes "Référence : …" qui apparaissent
    // souvent sans ligne vide après le paragraphe précédent.
    if (REFERENCE_PREFIX.test(line)) {
      cleaned.push("", line, "");
      continue;
    }

    // Isole les lignes-numéros (souvent collées au texte voisin) pour qu'elles
    // soient détectées comme marqueurs de titre.
    if (PURE_NUMBER.test(line)) {
      cleaned.push("", line, "");
      continue;
    }

    // Répare les puces cassées : "Les• services" → "Les\n• services".
    cleaned.push(line.replace(/\s*•\s*/g, " • "));
  }

  // 3. Regroupe en blocs bruts séparés par lignes vides ; au sein d'un bloc,
  //    recolle les retours à la ligne PDF en un seul flux.
  const rawBlocks: string[] = [];
  let current: string[] = [];
  const flush = () => {
    if (current.length) {
      rawBlocks.push(current.join(" ").replace(/\s+/g, " ").trim());
      current = [];
    }
  };
  for (const line of cleaned) {
    if (line === "") flush();
    else current.push(line);
  }
  flush();

  // 4. Assemble des blocs typés : titres (lignes-numéros), listes (après ":"),
  //    paragraphes (avec recollage des faux sauts et découpe des longs blocs).
  const out: Block[] = [];
  let expectHeading = false;

  // Ajoute un paragraphe en recollant un faux saut si le précédent paragraphe
  // ne se termine pas par une ponctuation forte (artefact PDF).
  const pushParagraph = (text: string) => {
    const last = out[out.length - 1];
    if (last && last.type === "paragraph" && !TERMINAL.test(last.text)) {
      last.text = `${last.text} ${text}`.replace(/\s+/g, " ").trim();
    } else {
      out.push({ type: "paragraph", text });
    }
  };

  for (let b of rawBlocks.filter(Boolean)) {
    // Bloc "Référence : L. 321-1 …" → bloc typé dédié.
    if (REFERENCE_PREFIX.test(b)) {
      const refText = b.replace(REFERENCE_PREFIX, "").trim();
      out.push({ type: "reference", articles: parseArticleRefs(refText) });
      continue;
    }

    // Ligne-numéro seule → annonce un titre, on la retire.
    if (PURE_NUMBER.test(b)) {
      expectHeading = true;
      continue;
    }
    // Préfixe numéro inline (ex: "1.1.2 Titre…") → on retire le numéro.
    if (INLINE_NUMBER.test(b)) {
      b = b.replace(INLINE_NUMBER, "").trim();
      expectHeading = true;
    }

    // Titre attendu et le bloc en a la forme (court, sans ponctuation finale).
    if (expectHeading) {
      expectHeading = false;
      if (isHeadingLike(b)) {
        out.push({ type: "heading", text: b });
        continue;
      }
    }

    // Contexte de liste : le bloc précédent finit par ":" ou est déjà une liste.
    const prev = out[out.length - 1];
    const afterColon =
      prev && prev.type === "paragraph" && /:$/.test(prev.text.trim());
    const inList = prev && prev.type === "list";

    if (afterColon || inList) {
      const kind = itemKind(b);
      if (kind !== "no") {
        const items = splitItems(b);
        if (inList) prev.items.push(...items);
        else out.push({ type: "list", items });
        continue;
      }
    }

    // Paragraphe normal (découpé si trop long).
    for (const chunk of chunkLongBlock(b)) pushParagraph(chunk);
  }

  // 5. Nettoyage final : une « liste » d'un seul item terminé par un point n'en
  //    est pas une → on la reconvertit en paragraphe (évite les faux positifs).
  return out.map((blk) =>
    blk.type === "list" &&
    blk.items.length === 1 &&
    !/[,…]$/.test(blk.items[0])
      ? { type: "paragraph" as const, text: blk.items[0] }
      : blk,
  );
}
