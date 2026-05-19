#!/usr/bin/env python3
"""
restore_sections.py — Reconstruit les sections ET les sectionId dans quiz_pool.json
à partir des sourceText des questions existantes.

Usage :
    python3 scripts/restore_sections.py

Effet :
    - Pour chaque sectionTitle unique, regroupe tous les sourceText
    - Reconstruit un contenu de section à partir de ces extraits
    - Réinjecte les sections ET les sectionId dans les questions
"""

import json
import re
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
SRC = DATA_DIR / "quiz_pool.json"


def make_section_id(chapter_id: str, title: str) -> str:
    """Génère un section_id à partir du titre (compatible avec le format existant)."""
    slug = title.lower()
    slug = slug.replace("'", "_")
    slug = slug.replace("«", "").replace("»", "")
    slug = slug.replace(":", "").replace(",", "").replace(".", "")
    slug = slug.replace("(", "").replace(")", "")
    slug = slug.replace("-", "_")
    slug = re.sub(r"[^a-z0-9_\s]", "", slug)
    slug = re.sub(r"\s+", "_", slug.strip())
    slug = re.sub(r"_+", "_", slug)
    slug = slug.strip("_")
    return f"{chapter_id}__{slug}"


def main():
    print(f"📖 Lecture de {SRC}...")
    with open(SRC, "r", encoding="utf-8") as f:
        data = json.load(f)

    for ch in data["chapters"]:
        ch_id = ch["id"]
        sections = {}

        # Regrouper les questions par sectionTitle
        sections_by_title = {}
        for q in ch.get("questions", []):
            title = q.get("sectionTitle", "")
            if not title:
                continue
            if title not in sections_by_title:
                sections_by_title[title] = []
            st = q.get("sourceText", "").strip()
            if st:
                sections_by_title[title].append(st)

        # Reconstruire les sections
        for title, source_texts in sections_by_title.items():
            unique_texts = list(dict.fromkeys(source_texts))
            content = "\n\n".join(unique_texts)
            if not content:
                continue

            section_key = make_section_id(ch_id, title)
            sections[section_key] = {
                "id": section_key.split("__", 1)[1] if "__" in section_key else section_key,
                "title": title,
                "content": content
            }

        # Restaurer les sectionId dans les questions
        restored = 0
        for q in ch.get("questions", []):
            title = q.get("sectionTitle", "")
            if not title:
                continue
            section_key = make_section_id(ch_id, title)
            if section_key in sections:
                q["sectionId"] = section_key
                restored += 1

        ch["sections"] = sections
        print(f"  📚 {ch['title']}: {len(sections)} sections, {restored} sectionId restaurés")

    # Écriture
    print(f"\n💾 Écriture de {SRC}...")
    with open(SRC, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    new_size = SRC.stat().st_size
    print(f"   ✅ Fichier écrit : {new_size / 1024:.1f} Ko")
    print(f"   ✅ Terminé !")


if __name__ == "__main__":
    main()
