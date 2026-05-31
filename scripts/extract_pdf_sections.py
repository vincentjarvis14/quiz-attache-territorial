#!/usr/bin/env python3
"""
extract_pdf_sections.py
=======================
Extrait le texte des PDF de cours (Source RAG/) et le découpe en sections
exploitables par le générateur de QCM (generate_questions_deepseek.py).

Non destructif : écrit dans un fichier de sortie dédié, ne touche PAS
quiz_pool.json. L'injection dans le pool est une étape séparée.

Usage:
    python3 scripts/extract_pdf_sections.py --domain urbanisme
    python3 scripts/extract_pdf_sections.py --domain urbanisme --out data/sections_urbanisme.json
    python3 scripts/extract_pdf_sections.py --domain urbanisme --stats   # juste le découpage
"""

import argparse
import json
import re
import subprocess
import unicodedata
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SOURCE_DIR = BASE_DIR / "Source RAG"

# Seuils de taille de section (caractères)
MIN_SECTION_CHARS = 300      # en dessous : fusion avec la section précédente
MAX_SECTION_CHARS = 4000     # au dessus : on laisse tel quel (le générateur gère)

LIGATURES = {
    "ﬀ": "ff", "ﬁ": "fi", "ﬂ": "fl",
    "ﬃ": "ffi", "ﬄ": "ffl", "ﬅ": "st", "ﬆ": "st",
}

HEADING_RE = re.compile(r"^(\d+(?:\.\d+)*)\.\s+(\S.*)$")


def normalize(text):
    """Normalise ligatures, espaces insécables et césures."""
    for lig, repl in LIGATURES.items():
        text = text.replace(lig, repl)
    text = text.replace(" ", " ").replace(" ", " ")
    text = unicodedata.normalize("NFC", text)
    # Recolle les mots coupés en fin de ligne (césure "-\n")
    text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)
    return text


def extract_text(pdf_path):
    out = subprocess.run(
        ["pdftotext", "-enc", "UTF-8", "-nopgbrk", str(pdf_path), "-"],
        capture_output=True, text=True,
    )
    return normalize(out.stdout)


def strip_boilerplate(lines):
    """Retire le sommaire (lignes '•') et l'entête (titre/auteur/date/ordonnance)."""
    body = []
    for ln in lines:
        s = ln.strip()
        if s.startswith("•"):          # ligne de sommaire
            continue
        body.append(ln)
    return body


def find_body_start(lines):
    """Trouve l'index du premier vrai titre de corps (après l'intro)."""
    for i, ln in enumerate(lines):
        if HEADING_RE.match(ln.strip()) and i > 3:
            return i
    return 0


def split_sections(text, pdf_slug):
    lines = text.split("\n")
    lines = strip_boilerplate(lines)
    start = find_body_start(lines)

    sections = []
    current = None
    for ln in lines[start:]:
        m = HEADING_RE.match(ln.strip())
        if m:
            if current:
                sections.append(current)
            num, title = m.group(1), m.group(2).strip()
            current = {"num": num, "title": title, "lines": []}
        elif current is not None:
            current["lines"].append(ln)
    if current:
        sections.append(current)

    # Construction du contenu + nettoyage
    built = []
    for sec in sections:
        body = "\n".join(sec["lines"]).strip()
        body = re.sub(r"\n{3,}", "\n\n", body)
        content = f"{sec['num']}. {sec['title']}\n{body}".strip()
        built.append({
            "num": sec["num"],
            "title": sec["title"],
            "content": content,
        })

    # Repli : aucun titre numéroté détecté (PDF d'un autre format) → découpage par chunks
    if len(built) < 2:
        body = "\n".join(strip_boilerplate(text.split("\n"))).strip()
        body = re.sub(r"\n{3,}", "\n\n", body)
        paras = [p.strip() for p in body.split("\n\n") if p.strip()]
        built, chunk, n = [], "", 0
        for p in paras:
            if len(chunk) + len(p) > 1500 and chunk:
                n += 1
                built.append({"num": f"c{n}", "title": f"Partie {n}", "content": chunk.strip()})
                chunk = p
            else:
                chunk += "\n\n" + p
        if chunk.strip():
            n += 1
            built.append({"num": f"c{n}", "title": f"Partie {n}", "content": chunk.strip()})

    # Fusion des sections trop courtes avec la précédente
    merged = []
    for sec in built:
        if merged and len(sec["content"]) < MIN_SECTION_CHARS:
            merged[-1]["content"] += "\n\n" + sec["content"]
        else:
            merged.append(sec)

    # ID finaux
    result = {}
    for sec in merged:
        sid = f"{pdf_slug}__{sec['num'].replace('.', '_')}"
        result[sid] = {
            "id": sid,
            "title": sec["title"],
            "content": sec["content"],
            "source_pdf": pdf_slug,
        }
    return result


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--domain", required=True, help="Sous-dossier de Source RAG (ex: urbanisme)")
    ap.add_argument("--out", default=None, help="Fichier JSON de sortie")
    ap.add_argument("--stats", action="store_true", help="Affiche le découpage sans écrire")
    args = ap.parse_args()

    domain_dir = SOURCE_DIR / args.domain
    if not domain_dir.exists():
        print(f"❌ Dossier introuvable: {domain_dir}")
        return

    pdfs = sorted(domain_dir.glob("*.pdf"))
    all_sections = {}
    print(f"📚 Domaine: {args.domain} — {len(pdfs)} PDF\n")

    total_chars = 0
    skipped = []
    for pdf in pdfs:
        slug = pdf.stem
        text = extract_text(pdf)
        if len(text.strip()) < 200:
            skipped.append(slug)
            print(f"⚠️  {slug}: {len(text.strip())} chars — ignoré (PDF image ? OCR requis)")
            continue
        secs = split_sections(text, slug)
        all_sections.update(secs)
        chars = sum(len(s["content"]) for s in secs.values())
        total_chars += chars
        print(f"✅ {slug:<40} {len(secs):>2} sections | {chars:>6} chars")

    print(f"\n{'='*60}")
    print(f"TOTAL: {len(all_sections)} sections | {total_chars} chars")
    if skipped:
        print(f"IGNORÉS (OCR requis): {', '.join(skipped)}")

    if args.stats:
        print(f"\n--- Détail des sections ---")
        for sid, s in all_sections.items():
            print(f"  {sid:<45} [{len(s['content']):>5}] {s['title'][:50]}")
        return

    out_path = Path(args.out) if args.out else BASE_DIR / "data" / f"sections_{args.domain}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({"domain": args.domain, "sections": all_sections}, f, ensure_ascii=False, indent=2)
    print(f"\n💾 Écrit: {out_path}")


if __name__ == "__main__":
    main()
