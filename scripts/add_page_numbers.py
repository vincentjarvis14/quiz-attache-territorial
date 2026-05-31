#!/usr/bin/env python3
"""
add_page_numbers.py
===================
Calcule le numéro de page de début (page_start) de chaque section et émet
un JSON {section_id: page_start}.

Réplique EXACTEMENT la logique de découpage de extract_pdf_sections.py,
mais extrait le texte AVEC les sauts de page (form-feed \\f) pour suivre
sur quelle page chaque titre de section apparaît.

Usage:
    python3 scripts/add_page_numbers.py > data/section_pages.json
"""

import json
import re
import subprocess
import unicodedata
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SOURCE_DIR = BASE_DIR / "Source RAG"

MIN_SECTION_CHARS = 300

LIGATURES = {
    "ﬀ": "ff", "ﬁ": "fi", "ﬂ": "fl",
    "ﬃ": "ffi", "ﬄ": "ffl", "ﬅ": "st", "ﬆ": "st",
}

HEADING_RE = re.compile(r"^(\d+(?:\.\d+)*)\.\s+(\S.*)$")


def normalize(text):
    for lig, repl in LIGATURES.items():
        text = text.replace(lig, repl)
    text = text.replace(" ", " ").replace(" ", " ")
    text = unicodedata.normalize("NFC", text)
    text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)
    return text


def extract_lines_with_pages(pdf_path):
    """Retourne une liste de (page, ligne). Le form-feed \\f marque un changement de page."""
    out = subprocess.run(
        ["pdftotext", "-enc", "UTF-8", str(pdf_path), "-"],
        capture_output=True, text=True,
    )
    raw = normalize(out.stdout)
    page = 1
    result = []
    for chunk in raw.split("\n"):
        # Un chunk peut contenir des form-feeds (changement de page)
        ff_count = chunk.count("\f")
        clean = chunk.replace("\f", "")
        result.append((page, clean))
        page += ff_count
    return result


def strip_boilerplate(lines_with_pages):
    return [(p, ln) for (p, ln) in lines_with_pages if not ln.strip().startswith("•")]


def find_body_start(lines_with_pages):
    for i, (p, ln) in enumerate(lines_with_pages):
        if HEADING_RE.match(ln.strip()) and i > 3:
            return i
    return 0


def split_sections(lines_with_pages, pdf_slug):
    lines_with_pages = strip_boilerplate(lines_with_pages)
    start = find_body_start(lines_with_pages)

    sections = []
    current = None
    for (page, ln) in lines_with_pages[start:]:
        m = HEADING_RE.match(ln.strip())
        if m:
            if current:
                sections.append(current)
            num, title = m.group(1), m.group(2).strip()
            current = {"num": num, "title": title, "lines": [], "page": page}
        elif current is not None:
            current["lines"].append(ln)
    if current:
        sections.append(current)

    built = []
    for sec in sections:
        body = "\n".join(sec["lines"]).strip()
        body = re.sub(r"\n{3,}", "\n\n", body)
        content = f"{sec['num']}. {sec['title']}\n{body}".strip()
        built.append({
            "num": sec["num"],
            "title": sec["title"],
            "content": content,
            "page": sec["page"],
        })

    # Repli : aucun titre numéroté détecté → découpage par chunks (page indéterminée → 1)
    if len(built) < 2:
        body_lines = strip_boilerplate(lines_with_pages)
        paras_pages = []
        buf, buf_page = "", None
        for (page, ln) in body_lines:
            if buf_page is None:
                buf_page = page
            if ln.strip() == "":
                if buf.strip():
                    paras_pages.append((buf.strip(), buf_page))
                buf, buf_page = "", None
            else:
                buf += "\n" + ln
        if buf.strip():
            paras_pages.append((buf.strip(), buf_page or 1))

        built, chunk, chunk_page, n = [], "", None, 0
        for (p_text, p_page) in paras_pages:
            if chunk_page is None:
                chunk_page = p_page
            if len(chunk) + len(p_text) > 1500 and chunk:
                n += 1
                built.append({"num": f"c{n}", "title": f"Partie {n}",
                              "content": chunk.strip(), "page": chunk_page})
                chunk, chunk_page = p_text, p_page
            else:
                chunk += "\n\n" + p_text
        if chunk.strip():
            n += 1
            built.append({"num": f"c{n}", "title": f"Partie {n}",
                          "content": chunk.strip(), "page": chunk_page or 1})

    # Fusion des sections trop courtes : la section fusionnée garde la page de son parent
    merged = []
    for sec in built:
        if merged and len(sec["content"]) < MIN_SECTION_CHARS:
            merged[-1]["content"] += "\n\n" + sec["content"]
        else:
            merged.append(sec)

    result = {}
    for sec in merged:
        sid = f"{pdf_slug}__{sec['num'].replace('.', '_')}"
        result[sid] = sec["page"]
    return result


def main():
    pdfs = sorted(SOURCE_DIR.rglob("*.pdf"))
    pages = {}
    for pdf in pdfs:
        slug = pdf.stem
        lines = extract_lines_with_pages(pdf)
        if sum(len(ln) for _, ln in lines) < 200:
            continue
        secs = split_sections(lines, slug)
        pages.update(secs)
    print(json.dumps(pages, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
