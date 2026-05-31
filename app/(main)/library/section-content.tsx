import type { Block } from "@/lib/clean-section";
import { ArticlePopover } from "@/components/library/article-popover";
import { Scale } from "lucide-react";

// Met en relief montants (150 €) et références d'articles inline (article L131-3).
const EMPHASIS =
  /(\d[\d   ]*\s?€|articles?\s+[LRDAlrda]?\.?\s?\d+(?:[-–]\d+)*)/g;

function extractRef(label: string): string | null {
  const m = label.match(/(L|R|D|A)\.?\s*\*?\s*(\d+(?:[-–]\d+)*)/i);
  if (!m) return null;
  return `${m[1].toUpperCase()}${m[2].replace(/–/g, "-")}`;
}

function emphasize(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(EMPHASIS);
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const ref = extractRef(m[0]);
    if (ref) {
      nodes.push(
        <ArticlePopover
          key={`${keyBase}-${m.index}`}
          articleRef={ref}
          className="mx-0.5 align-baseline"
        />,
      );
    } else {
      nodes.push(
        <strong key={`${keyBase}-${m.index}`} className="font-semibold text-ink">
          {m[0]}
        </strong>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

// Détecte et découpe une énumération collée par l'extraction PDF.
// Pattern : "Intro : item A (2.1), item B (2.2), item C (2.3)."
// Condition : ≥ 2 références de la forme (X.Y) après le ":"
function splitEnumParagraph(
  text: string,
): { intro: string; items: string[] } | null {
  const colonIdx = text.indexOf(":");
  if (colonIdx === -1) return null;

  const afterColon = text.slice(colonIdx + 1).trim();
  const refs = [...afterColon.matchAll(/\(\d+\.\d+(?!\.\d)\)/g)];
  if (refs.length < 2) return null;

  const intro = text.slice(0, colonIdx).trim();
  // Split sur "), " — le ")" est consommé par le split pour tous sauf le dernier
  const rawParts = afterColon.split(/\)\s*,\s*/);
  const items = rawParts
    .map((part, i) => {
      const t = part.trim().replace(/[.…]+$/, "").trim();
      return i < rawParts.length - 1 ? `${t})` : t;
    })
    .filter(Boolean);

  return items.length >= 2 ? { intro, items } : null;
}

// Détecte un paragraphe de définition : "Le/La/Les X est/désigne/correspond..."
const DEF_RE =
  /^(?:L[ae]s?\s+|L'|Un[e]?\s+|Des?\s+)[^.;]{3,60}\s+(?:est\s|sont\s|désigne(?:nt)?\s|correspond(?:ent)?\s|constitue(?:nt)?\s|représente(?:nt)?\s|s'entend\s|se définit?\s)/;

function isDefinition(text: string): boolean {
  return DEF_RE.test(text.trim()) && text.length < 400;
}

function ReferenceBlock({ articles }: { articles: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-ink/10 bg-ink/[0.025] px-4 py-3">
      <Scale className="h-3.5 w-3.5 shrink-0 text-coral-500/70" strokeWidth={2} />
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-coral-600/80">
        Textes de référence
      </span>
      {articles.map((art, i) => {
        const ref = extractRef(art);
        return ref ? (
          <ArticlePopover key={i} articleRef={ref} />
        ) : (
          <span
            key={i}
            className="rounded-md bg-white px-2 py-1 font-mono text-[12.5px] font-medium text-ink/70 ring-1 ring-inset ring-ink/10"
          >
            {art}
          </span>
        );
      })}
    </div>
  );
}

function ReadingBlock({ block, isLead }: { block: Block; isLead: boolean }) {
  if (block.type === "heading") {
    return (
      <div className="flex items-center gap-3">
        <span className="h-5 w-[3px] shrink-0 rounded-full bg-coral-400" aria-hidden />
        <h3 className="scroll-mt-28 font-display text-[1.1rem] font-bold leading-snug tracking-tight text-ink">
          {block.text}
        </h3>
      </div>
    );
  }

  if (block.type === "list") {
    return (
      <ul className="space-y-3 pl-1">
        {block.items.map((it, i) => (
          <li key={i} className="flex items-baseline gap-3 leading-relaxed">
            <span
              className="mt-[0.45em] h-[7px] w-[7px] shrink-0 rounded-full bg-coral-400"
              aria-hidden
            />
            <span>{emphasize(it, `l${i}`)}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "reference") {
    return <ReferenceBlock articles={block.articles} />;
  }

  // Énumération numérotée collée (2.1), (2.2)… → intro + liste visuelle
  const enumData = splitEnumParagraph(block.text);
  if (enumData) {
    const introClass = isLead
      ? "text-[18px] font-medium leading-[1.65] text-ink/85 md:text-[19px]"
      : "leading-[1.7]";
    return (
      <div>
        <p className={introClass}>{enumData.intro}&nbsp;:</p>
        <ul className="mt-3 space-y-2.5 pl-1">
          {enumData.items.map((item, i) => (
            <li key={i} className="flex items-baseline gap-3 leading-relaxed">
              <span
                className="mt-[0.45em] h-[7px] w-[7px] shrink-0 rounded-full bg-coral-400"
                aria-hidden
              />
              <span>{emphasize(item, `enum${i}`)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Paragraphe définition → encadré à bordure gauche
  if (isDefinition(block.text)) {
    return (
      <div className="rounded-r-xl border-l-[3px] border-coral-400 bg-coral-50/60 px-5 py-4 text-[16.5px] italic leading-[1.75] text-ink/85">
        {emphasize(block.text, "def")}
      </div>
    );
  }

  // Premier paragraphe d'une section ou sous-section → chapô
  if (isLead) {
    return (
      <p className="text-[18px] font-medium leading-[1.65] text-ink/85 md:text-[19px]">
        {emphasize(block.text, "lead")}
      </p>
    );
  }

  return <p>{emphasize(block.text, "p")}</p>;
}

export function SectionContent({ blocks }: { blocks: Block[] }) {
  // Marque le premier paragraphe après chaque début de section ou h3
  let nextParagraphIsLead = true;

  const enriched = blocks.map((block) => {
    if (block.type === "heading") {
      nextParagraphIsLead = true;
      return { block, isLead: false };
    }
    if (block.type === "paragraph") {
      const isLead = nextParagraphIsLead;
      nextParagraphIsLead = false;
      return { block, isLead };
    }
    nextParagraphIsLead = false;
    return { block, isLead: false };
  });

  return (
    <div className="text-[17px] leading-[1.7] text-ink/90 md:text-[18px] [&>*+*]:mt-5 [&>ul]:mt-5 [&>div]:mt-5 [&>div+*]:mt-5 [&>h3]:mt-9 [&>h3+*]:mt-3">
      {enriched.map(({ block, isLead }, i) => (
        <ReadingBlock key={i} block={block} isLead={isLead} />
      ))}
    </div>
  );
}
