#!/usr/bin/env python3
"""
validate_generated.py
=====================
Valide un fichier de questions rédigées à la main (par Opus) contre les
sections sources. Plus strict que le validateur DeepSeek : vérifie que le
sourceText COMPLET (et pas seulement ses 50 premiers caractères) est bien
présent dans la section, après normalisation des espaces.

Usage:
    python3 scripts/validate_generated.py --questions data/generated_urbanisme.json \
                                           --sections data/sections_urbanisme.json
"""

import argparse
import json
import re
import sys

VISUAL_PATTERNS = [
    r"quelle\s+ann[eé]e", r"quel\s+chiffre", r"quel\s+nombre",
    r"combien\s+(d['e]|y a)", r"en\s+quelle\s+ann[eé]e",
]

# Niveaux Bloom acceptés : 1-3 (existant) + 4-5 + cas pratique sourcé.
VALID_BLOOM = {
    "rappel", "comprehension", "application",   # niveaux 1-3
    "analyse", "evaluation",                     # niveaux 4-5
    "cas_pratique",                              # cas pratique ancré dans la source
}

# Marqueurs de référence juridique : autorisés UNIQUEMENT s'ils figurent
# littéralement dans le sourceText. Sinon = hallucination probable (arrêt,
# décision, numéro de loi inventés par le modèle).
# Chaque entrée : (pattern, label, flags). Le pattern "nom d'arrêt" est
# sensible à la casse : la majuscule distingue "arrêt Nicolo" (jurisprudence)
# de "arrêt du projet" / "arrêts de la cour" (usage générique).
HALLUCINATION_MARKERS = [
    (r"\bCE\b[\s,]+(?:ass\.|sect\.|n°|\d{1,2}\s+\w+\s+\d{4})", "arrêt Conseil d'État", re.I),
    (r"\bCAA\b[\s,]", "arrêt Cour administrative d'appel", re.I),
    (r"\bC\.?\s*cass\b", "arrêt Cour de cassation", re.I),
    (r"\bn°\s*\d{2,}[-/.]\d+\b", "numéro de décision/loi", re.I),
    (r"\b[Aa]rr[eê]ts?\s+[«\"]?[A-ZÉÈ][a-zà-ÿ]+", "nom d'arrêt", 0),
]


def norm_ws(s):
    """Normalise espaces + apostrophes/guillemets typographiques pour comparaison."""
    s = s or ""
    for a, b in [("’", "'"), ("‘", "'"), ("“", '"'),
                 ("”", '"'), (" ", " "), ("–", "-"), ("—", "-")]:
        s = s.replace(a, b)
    return re.sub(r"\s+", " ", s).strip()


def is_visual(q):
    ql = q.lower()
    return any(re.search(p, ql) for p in VISUAL_PATTERNS)


def is_truncated(src):
    s = norm_ws(src)
    if not s:
        return True
    if s.endswith("..."):
        return True
    return s[-1] not in ".!?»\""


def hallucination_risks(q):
    """Détecte les références juridiques (arrêt, décision, n° de loi) présentes
    dans la question/explication mais ABSENTES du sourceText : signal fort
    d'une référence inventée par le modèle."""
    src = norm_ws(q.get("sourceText", ""))
    haystack = norm_ws(q.get("q", "") + " " + q.get("explanation", ""))
    risks = []
    for pat, label, flags in HALLUCINATION_MARKERS:
        for m in re.finditer(pat, haystack, flags):
            frag = norm_ws(m.group(0))
            if frag not in src:
                risks.append(f"référence non ancrée ({label}) : « {frag} »")
    return risks


def validate(q, sections):
    errs = []
    for f in ["bloom", "q", "options", "answer", "sourceText", "explanation", "sectionId"]:
        if f not in q:
            errs.append(f"champ manquant: {f}")
    if errs:
        return errs

    if q["bloom"] not in VALID_BLOOM:
        errs.append(f"bloom invalide: {q['bloom']}")
    if not isinstance(q["options"], list) or len(q["options"]) != 4:
        errs.append(f"options != 4 ({len(q.get('options', []))})")
    if not isinstance(q["answer"], int) or not (0 <= q["answer"] <= 3):
        errs.append(f"answer hors bornes: {q['answer']}")
    if len(set(q["options"])) != len(q["options"]):
        errs.append("options dupliquées")
    if is_visual(q["q"]):
        errs.append("question de repérage visuel (année/chiffre/nombre)")
    if is_truncated(q["sourceText"]):
        errs.append("sourceText tronqué")

    sid = q.get("sectionId")
    if sid not in sections:
        errs.append(f"sectionId inconnu: {sid}")
    else:
        content_norm = norm_ws(sections[sid]["content"])
        src_norm = norm_ws(q["sourceText"])
        if src_norm not in content_norm:
            errs.append("sourceText ABSENT de la section (ancrage KO)")

    errs.extend(hallucination_risks(q))

    return errs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--questions", required=True)
    ap.add_argument("--sections", required=True)
    args = ap.parse_args()

    qfile = json.load(open(args.questions, encoding="utf-8"))
    questions = qfile["questions"] if isinstance(qfile, dict) else qfile
    sections = json.load(open(args.sections, encoding="utf-8"))["sections"]

    ok = 0
    from collections import Counter
    bloom = Counter()
    for i, q in enumerate(questions):
        errs = validate(q, sections)
        if errs:
            print(f"❌ [{i}] {q.get('q','')[:70]}")
            for e in errs:
                print(f"      → {e}")
        else:
            ok += 1
            bloom[q["bloom"]] += 1

    print(f"\n{'='*60}")
    print(f"VALIDES: {ok}/{len(questions)}")
    print(f"Bloom: {dict(bloom)}")
    if ok != len(questions):
        sys.exit(1)


if __name__ == "__main__":
    main()
