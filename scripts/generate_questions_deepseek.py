#!/usr/bin/env python3
"""
generate_questions_deepseek.py
==============================
Génère des QCM pour le concours d'attaché territorial via l'API DeepSeek.

Remplace l'ancien script regex (generate_questions_from_sources.py) par un
pipeline LLM produisant des questions de qualité professionnelle.

Usage:
    python3 scripts/generate_questions_deepseek.py                          # Génère tout le pool
    python3 scripts/generate_questions_deepseek.py --dry-run                # Aperçu sans écrire
    python3 scripts/generate_questions_deepseek.py --resume                 # Reprend là où on s'est arrêté
    python3 scripts/generate_questions_deepseek.py --chapter env1           # Un seul chapitre
    python3 scripts/generate_questions_deepseek.py --section <section_id>   # Une seule section
    python3 scripts/generate_questions_deepseek.py --questions 5            # Questions par section (défaut: 5)
"""

import json
import os
import re
import sys
import time
import argparse
from datetime import datetime
from pathlib import Path

import requests
from dotenv import load_dotenv

# ─── Configuration ───────────────────────────────────────────────────────────

load_dotenv()
API_KEY = os.getenv("DEEPSEEK_API_KEY")
API_URL = "https://api.deepseek.com/v1/chat/completions"
MODEL = "deepseek-chat"

DATA_DIR = Path("data")
POOL_PATH = DATA_DIR / "quiz_pool.json"
LOG_DIR = Path("_bmad-output/implementation-artifacts")
LOG_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_QUESTIONS_PER_SECTION = 5
MAX_RETRIES = 3
RETRY_DELAY = 5
REQUEST_TIMEOUT = 120

# ─── Prompt système ──────────────────────────────────────────────────────────

SYSTEM_PROMPT = """Tu es un générateur de QCM expert pour le concours d'attaché territorial français.
Tu produis des questions de qualité professionnelle à partir d'extraits de cours de droit administratif.

RÈGLES STRICTES À RESPECTER ABSOLUMENT :
1. JAMAIS de questions sur une année, date, chiffre, nombre ou millésime.
2. JAMAIS de questions de type "Quelle année", "Quel chiffre", "Combien", "Quel nombre".
3. Les 4 options doivent TOUTES être plausibles dans le contexte juridique.
4. La bonne réponse doit être littéralement présente dans le texte source.
5. Le sourceText ne doit JAMAIS être tronqué — copie la phrase COMPLÈTE du cours, du début à la fin, sans coupure.
6. Chaque question doit tester une VRAIE connaissance du droit administratif.
7. Varie les niveaux Bloom : rappel, compréhension, application.
8. Les distracteurs (mauvaises réponses) doivent être crédibles mais faux.
9. Le sourceText DOIT être recopié textuellement depuis le cours. Ne le reformule PAS. Si tu ne trouves pas d'extrait pertinent dans le cours, ne génère PAS la question.
10. Pour les questions d'application, mets en situation concrète : "Un maire souhaite...", "Un conseil municipal délibère...", "Un administré conteste..."

EXEMPLE DE QUESTION BIEN FORMÉE :
{
  "bloom": "application",
  "q": "Un conseil municipal souhaite délibérer sur un sujet d'intérêt local non prévu par un texte. Selon le cours, cela est-il possible ?",
  "options": [
    "Non, car les communes n'ont que des compétences d'attribution",
    "Oui, grâce à la clause générale de compétence qui permet de se saisir de toute question d'intérêt local",
    "Non, car seul le préfet peut décider de nouvelles compétences",
    "Oui, mais uniquement avec l'accord du conseil départemental"
  ],
  "answer": 1,
  "sourceText": "Cette « clause générale » se conjugue avec les compétences d'attribution ; elle permet aux collectivités de se saisir de toute question d'intérêt local, même en l'absence de texte lui en donnant explicitement compétence, dès lors qu'elle n'empiète pas sur une compétence relevant d'une autre collectivité.",
  "explanation": "Le texte indique que la clause générale de compétence permet aux collectivités de se saisir de toute question d'intérêt local, même sans texte explicite."
}"""

USER_TEMPLATE = """À partir du texte de cours ci-dessous, génère EXACTEMENT {count} questions de QCM.

Format EXIGÉ : un tableau JSON valide. Chaque objet DOIT contenir :
- "bloom": "rappel" | "comprehension" | "application"
- "q": la question (max 200 caractères)
- "options": tableau de 4 chaînes
- "answer": index de la bonne réponse (0-3)
- "sourceText": extrait COMPLET du cours contenant la réponse
- "explanation": pourquoi c'est la bonne réponse (1 phrase)

Titre de la section : {title}

Cours :
{content}

JSON :"""


# ─── Post-filtres qualité ────────────────────────────────────────────────────

def is_visual_spotting_question(q_text):
    """Détecte les questions de type 'repérage visuel' (année, chiffre, nombre)."""
    patterns = [
        r"quelle\s+ann[eé]e",
        r"quel\s+chiffre",
        r"quel\s+nombre",
        r"combien\s+(d['e]|y a)",
        r"en\s+quelle\s+ann[eé]e",
        r"qu['e]est-ce qu['e]un\s+chiffre",
    ]
    q_lower = q_text.lower()
    for p in patterns:
        if re.search(p, q_lower):
            return True
    return False


def is_source_truncated(source_text):
    """Détecte si un sourceText est tronqué (coupé en plein milieu)."""
    if not source_text:
        return True
    # Si ça finit par "..." ou par un mot sans point final
    if source_text.rstrip().endswith("..."):
        return True
    # Si le dernier caractère n'est pas un point, point d'exclamation, etc.
    last_char = source_text.rstrip()[-1] if source_text.rstrip() else ""
    if last_char not in ".!?»\"":
        return True
    # Si le dernier mot fait moins de 3 lettres (signe de coupure)
    words = source_text.rstrip().split()
    if words and len(words[-1]) < 3 and not words[-1] in {"un", "une", "des", "les", "aux", "ces", "ses", "son", "sa"}:
        return True
    return False


def validate_question(q, section_content):
    """Valide une question générée. Retourne (valide, raison)."""
    checks = []

    # Structure
    required_fields = ["bloom", "q", "options", "answer", "sourceText", "explanation"]
    for field in required_fields:
        if field not in q:
            checks.append(f"Champ manquant: {field}")

    if checks:
        return False, "; ".join(checks)

    # Bloom valide
    if q["bloom"] not in ("rappel", "comprehension", "application"):
        return False, f"Bloom invalide: {q['bloom']}"

    # Options
    if not isinstance(q["options"], list) or len(q["options"]) != 4:
        return False, f"Nombre d'options invalide: {len(q.get('options', []))}"

    # Answer dans les bornes
    if not isinstance(q["answer"], int) or q["answer"] < 0 or q["answer"] > 3:
        return False, f"Answer invalide: {q['answer']}"

    # Pas de repérage visuel
    if is_visual_spotting_question(q["q"]):
        return False, "Question de repérage visuel détectée"

    # SourceText non tronqué
    if is_source_truncated(q["sourceText"]):
        return False, "SourceText tronqué"

    # SourceText présent dans le cours (vérification souple : 80% du texte doit s'y trouver)
    st_clean = q["sourceText"].strip()
    if len(st_clean) > 50:
        # Vérifie que les 50 premiers caractères sont dans le cours
        if st_clean[:50] not in section_content:
            return False, "SourceText introuvable dans le cours (hallucination possible)"
    elif st_clean not in section_content:
        return False, "SourceText introuvable dans le cours (hallucination possible)"

    return True, "OK"


# ─── Appel API DeepSeek ──────────────────────────────────────────────────────

def call_deepseek(section_title, section_content, count=5):
    """Appelle DeepSeek pour générer des questions. Retourne la liste ou None."""
    user_msg = USER_TEMPLATE.format(title=section_title, content=section_content, count=count)

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = requests.post(
                API_URL,
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": MODEL,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_msg},
                    ],
                    "temperature": 0.3,
                    "max_tokens": 8000,
                },
                timeout=REQUEST_TIMEOUT,
            )

            if response.status_code == 200:
                content = response.json()["choices"][0]["message"]["content"]
                return content
            elif response.status_code == 429:
                print(f"  ⚠ Rate limit (tentative {attempt}/{MAX_RETRIES}), attente {RETRY_DELAY}s...")
                time.sleep(RETRY_DELAY)
            else:
                print(f"  ⚠ Erreur HTTP {response.status_code} (tentative {attempt}/{MAX_RETRIES})")
                if attempt < MAX_RETRIES:
                    time.sleep(RETRY_DELAY)

        except requests.exceptions.Timeout:
            print(f"  ⚠ Timeout (tentative {attempt}/{MAX_RETRIES})")
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY)
        except Exception as e:
            print(f"  ⚠ Erreur: {e} (tentative {attempt}/{MAX_RETRIES})")
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY)

    return None


def parse_questions(raw_content):
    """Extrait et parse le JSON de la réponse DeepSeek."""
    # Enlever les blocs de code markdown
    content = re.sub(r"```(?:json)?\s*", "", raw_content).strip()

    # Trouver le tableau JSON
    json_match = re.search(r"\[.*\]", content, re.DOTALL)
    if not json_match:
        return None

    try:
        questions = json.loads(json_match.group())
        return questions
    except json.JSONDecodeError:
        return None


# ─── Chargement / Sauvegarde du pool ─────────────────────────────────────────

def load_pool():
    """Charge le quiz_pool.json existant."""
    with open(POOL_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_pool(pool):
    """Sauvegarde le quiz_pool.json."""
    with open(POOL_PATH, "w", encoding="utf-8") as f:
        json.dump(pool, f, ensure_ascii=False, indent=2)
    print(f"  ✅ Pool sauvegardé: {POOL_PATH}")


def load_progress():
    """Charge l'état d'avancement pour --resume."""
    progress_path = LOG_DIR / "generation_progress.json"
    if progress_path.exists():
        with open(progress_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"completed_sections": []}


def save_progress(completed_sections):
    """Sauvegarde l'état d'avancement."""
    progress_path = LOG_DIR / "generation_progress.json"
    with open(progress_path, "w", encoding="utf-8") as f:
        json.dump({"completed_sections": completed_sections}, f, ensure_ascii=False, indent=2)


# ─── Génération ──────────────────────────────────────────────────────────────

def generate_for_section(chapter, section_id, section, count, dry_run=False):
    """Génère des questions pour une section donnée."""
    title = section["title"]
    content = section["content"]

    print(f"\n📝 Section: {title}")
    print(f"   Longueur: {len(content)} caractères")

    raw = call_deepseek(title, content, count)
    if raw is None:
        print(f"  ❌ Échec après {MAX_RETRIES} tentatives")
        return None

    questions = parse_questions(raw)
    if questions is None:
        print(f"  ❌ Impossible de parser le JSON de la réponse")
        print(f"     Réponse brute: {raw[:200]}...")
        return None

    # Validation
    valid_questions = []
    rejected = 0
    for q in questions:
        is_valid, reason = validate_question(q, content)
        if is_valid:
            valid_questions.append(q)
        else:
            rejected += 1
            print(f"  ⚠ Question rejetée: {reason}")

    print(f"   ✅ {len(valid_questions)}/{len(questions)} questions valides" + (f" ({rejected} rejetée(s))" if rejected else ""))

    if dry_run:
        for i, q in enumerate(valid_questions):
            print(f"\n   Q{i+1} [{q['bloom']}]: {q['q'][:80]}...")
            for j, opt in enumerate(q["options"]):
                marker = "✓" if j == q["answer"] else " "
                print(f"     {marker} {opt[:60]}...")
        return valid_questions

    # Construction des questions au format du pool
    pool_questions = []
    for i, q in enumerate(valid_questions):
        section_slug = section_id
        q_id = f"{chapter['id']}__{section_slug}__deepseek_{i+1:03d}"

        pool_questions.append({
            "bloom": q["bloom"],
            "q": q["q"],
            "options": q["options"],
            "answer": q["answer"],
            "explanation": q["explanation"],
            "id": q_id,
            "sectionTitle": title,
            "sourceLink": f"#section-{section_slug}",
            "sourceText": q["sourceText"],
            "sourceContext": q["sourceText"],
            "sectionId": section_id,
            "keywords": [],
        })

    return pool_questions


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Génère des QCM via DeepSeek")
    parser.add_argument("--dry-run", action="store_true", help="Aperçu sans écrire dans le pool")
    parser.add_argument("--resume", action="store_true", help="Reprendre la génération interrompue")
    parser.add_argument("--chapter", type=str, help="ID du chapitre à traiter (ex: env1)")
    parser.add_argument("--section", type=str, help="ID de la section à traiter")
    parser.add_argument("--questions", type=int, default=DEFAULT_QUESTIONS_PER_SECTION, help=f"Questions par section (défaut: {DEFAULT_QUESTIONS_PER_SECTION})")
    args = parser.parse_args()

    if not API_KEY:
        print("❌ DEEPSEEK_API_KEY non trouvée dans .env")
        sys.exit(1)

    print(f"🚀 Générateur de QCM DeepSeek")
    print(f"   Modèle: {MODEL}")
    print(f"   Questions par section: {args.questions}")
    if args.dry_run:
        print(f"   Mode: DRY RUN (aucune écriture)")
    if args.resume:
        print(f"   Mode: REPRISE")

    pool = load_pool()
    progress = load_progress() if args.resume else {"completed_sections": []}
    total_new = 0
    total_sections = 0

    for chapter in pool["chapters"]:
        if args.chapter and chapter["id"] != args.chapter:
            continue

        print(f"\n{'='*60}")
        print(f"📚 Chapitre: {chapter['title']} ({chapter['id']})")
        print(f"{'='*60}")

        if "sections" not in chapter or not chapter["sections"]:
            print(f"  ⚠ Chapitre sans sections structurées")
            # Mode fallback : créer une section synthétique à partir des sourceText existants
            source_texts = []
            for q in chapter.get("questions", []):
                st = q.get("sourceText", "").strip()
                if st and len(st) > 30:
                    source_texts.append(st)
            
            if not source_texts:
                print(f"  ⚠ Aucun sourceText disponible, ignoré")
                continue
            
            # Dédupliquer et concaténer
            unique_texts = list(dict.fromkeys(source_texts))
            synthetic_content = "\n\n".join(unique_texts)
            
            section_id = f"{chapter['id']}__synthese"
            section = {
                "title": f"Synthèse - {chapter['title']}",
                "content": synthetic_content
            }
            
            print(f"  📝 Section synthétique créée ({len(synthetic_content)} chars depuis {len(unique_texts)} sourceTexts)")
            
            questions = generate_for_section(chapter, section_id, section, args.questions, args.dry_run)
            if questions is None:
                print(f"  ⚠ Section ignorée (échec)")
                continue

            if not args.dry_run:
                # Remplacer TOUTES les questions du chapitre
                chapter["questions"] = questions
                progress["completed_sections"].append(section_id)
                save_progress(progress["completed_sections"])

            total_new += len(questions)
            total_sections += 1
            continue

        for section_id, section in chapter["sections"].items():
            if args.section and section_id != args.section:
                continue
            if section_id in progress["completed_sections"]:
                print(f"  ⏭ Section déjà traitée: {section['title']}")
                continue

            questions = generate_for_section(chapter, section_id, section, args.questions, args.dry_run)
            if questions is None:
                print(f"  ⚠ Section ignorée (échec)")
                continue

            if not args.dry_run:
                # Remplacer les questions existantes de cette section
                chapter["questions"] = [q for q in chapter["questions"] if q.get("sectionId") != section_id]
                chapter["questions"].extend(questions)
                progress["completed_sections"].append(section_id)
                save_progress(progress["completed_sections"])

            total_new += len(questions)
            total_sections += 1

    if not args.dry_run:
        save_pool(pool)
        print(f"\n{'='*60}")
        print(f"🎉 Génération terminée !")
        print(f"   Sections traitées: {total_sections}")
        print(f"   Nouvelles questions: {total_new}")
        print(f"{'='*60}")
    else:
        print(f"\n{'='*60}")
        print(f"🔍 DRY RUN terminé")
        print(f"   Sections simulées: {total_sections}")
        print(f"   Questions simulées: {total_new}")
        print(f"   Aucune modification du pool")
        print(f"{'='*60}")


if __name__ == "__main__":
    main()
