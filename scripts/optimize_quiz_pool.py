#!/usr/bin/env python3
"""
optimize_quiz_pool.py — Génère quiz_pool.light.json (version allégée pour le web)
à partir de quiz_pool.json (version maître avec sections).

Usage :
    python3 scripts/optimize_quiz_pool.py

Effet :
    - Lit quiz_pool.json (fichier maître avec sections)
    - Pour chaque question, extrait le contexte autour du sourceText
    - Garde les sections dédupliquées (une seule copie par section)
    - Garde les sectionId dans les questions
    - Écrit quiz_pool.light.json (sans indentation)
"""

import json
import re
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
SRC = DATA_DIR / "quiz_pool.json"
DST = DATA_DIR / "quiz_pool.light.json"

CTX_CHARS = 200  # nb de caractères de contexte avant/après


def extract_context(content: str, source_text: str) -> str | None:
    """Cherche source_text dans content et retourne le contexte autour.

    Gère les cas où source_text est tronqué (phrase incomplète) :
    - Cherche d'abord la correspondance exacte
    - Si introuvable, cherche les 30 premiers caractères significatifs
    - Si toujours introuvable, cherche mot par mot les 5 premiers mots
    """
    if not content or not source_text:
        return None

    clean = re.sub(r'\s+', ' ', source_text).strip()
    text = re.sub(r'\s+', ' ', content).strip()

    # Stratégie 1 : correspondance exacte
    idx = text.find(clean)

    # Stratégie 2 : correspondance partielle (début de phrase)
    if idx == -1:
        # Prendre les 60 premiers caractères non vides
        partial = clean[:60].strip()
        if partial:
            idx = text.find(partial)

    # Stratégie 3 : correspondance mot par mot (5 premiers mots)
    if idx == -1:
        words = clean.split()[:5]
        if words:
            partial = " ".join(words)
            idx = text.find(partial)

    if idx == -1:
        return None

    # On cherche la fin de la phrase qui contient le match.
    # On cherche le 2e point après idx pour éviter de couper trop tôt
    # (le premier point peut être dans le sourceText lui-même)
    first_dot = text.find(".", idx)
    if first_dot != -1:
        # Chercher un second point après le premier
        second_dot = text.find(".", first_dot + 1)
        if second_dot != -1:
            actual_end = second_dot + 1
        else:
            # Un seul point trouvé → fin de phrase = point + 100 chars max
            actual_end = min(len(text), first_dot + 1 + 100)
    else:
        # Pas de point trouvé → prendre jusqu'à 100 chars après
        actual_end = min(len(text), idx + len(clean) + 100)

    start = max(0, idx - CTX_CHARS)
    end = min(len(text), actual_end + CTX_CHARS)

    before = text[start:idx].strip()
    # Prendre le texte depuis idx jusqu'à la fin de la phrase (2e point)
    highlight = text[idx:actual_end].strip()
    after = text[actual_end:end].strip()

    if start > 0:
        before = "…" + before
    if end < len(text):
        after = after + "…"

    parts = []
    if before:
        parts.append(before)
    parts.append(f"💚 {highlight}")
    if after:
        parts.append(after)

    return " ".join(parts)


def main():
    print(f"📖 Lecture de {SRC}...")
    with open(SRC, "r", encoding="utf-8") as f:
        data = json.load(f)

    total_questions = 0
    found = 0
    not_found = 0
    no_source = 0
    total_sections_before = 0

    for ch in data["chapters"]:
        sections = ch.get("sections", {})
        total_sections_before += len(sections)

        for q in ch.get("questions", []):
            total_questions += 1
            st = (q.get("sourceText") or "").strip()
            ex = (q.get("explanation") or "").strip()
            sid = q.get("sectionId")

            source_to_find = st or ex
            if not source_to_find:
                no_source += 1
                continue

            if sid and sid in sections:
                content = sections[sid].get("content", "")
                ctx = extract_context(content, source_to_find)
                if ctx:
                    q["sourceContext"] = ctx
                    found += 1
                else:
                    fallback = content[:CTX_CHARS * 2].strip()
                    if fallback:
                        q["sourceContext"] = f"💚 {source_to_find}\n\n{fallback}…"
                    not_found += 1
            else:
                q["sourceContext"] = f"💚 {source_to_find}"
                not_found += 1

            # ✅ On GARDE sectionId (nécessaire pour retrouver la section dans la modale)

        # ✅ On GARDE les sections (dédupliquées)

    print(f"\n📊 Résultat :")
    print(f"   Questions traitées : {total_questions}")
    print(f"   ✅ Contexte extrait : {found}")
    print(f"   ⚠️  Fallback utilisé : {not_found}")
    print(f"   ❌ Sans sourceText   : {no_source}")
    print(f"   📄 Sections conservées : {total_sections_before} (dédupliquées)")

    print(f"\n💾 Écriture de {DST}...")
    with open(DST, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    new_size = DST.stat().st_size
    src_size = SRC.stat().st_size
    print(f"   ✅ Fichier écrit : {new_size / 1024:.1f} Ko")
    print(f"   📊 Gain : {src_size / 1024:.1f} Ko → {new_size / 1024:.1f} Ko ({100 - (new_size / src_size * 100):.0f}% de réduction)")
    print(f"   ✅ Terminé !")


if __name__ == "__main__":
    main()
