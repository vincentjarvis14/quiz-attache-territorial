#!/usr/bin/env python3
"""
generate_quiz.py — Génère le pool de QCM pour le Jeu Quiz Attaché Territorial.

Lit : data/quiz_pool.json (auto-référencement — les sections sont déjà dans le pool)
Écrit : data/quiz_pool.json

Usage:
  python3 generate_quiz.py                        # Tout générer (skip si déjà présent)
  python3 generate_quiz.py --force                # Régénère tout
  python3 generate_quiz.py --chapter env1         # Un seul chapitre
  python3 generate_quiz.py --dry-run              # Test sans écrire

Prérequis:
  pip install openai
  export DEEPSEEK_API_KEY=sk-...
"""

import json
import re
import sys
import time
import argparse
import os

try:
    from openai import OpenAI
except ImportError:
    print("❌ Package 'openai' manquant. Lance : pip install openai")
    sys.exit(1)

# ─── Chemins relatifs (projet autonome) ─────────────────────────────────────
BASE_DIR      = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POOL_PATH     = os.path.join(BASE_DIR, 'data', 'quiz_pool.json')
MAX_CONTENT   = 3000        # Caractères max envoyés à l'API (limité pour fiabilité JSON)
MODEL         = 'deepseek-chat'
API_BASE_URL  = 'https://api.deepseek.com'
SLEEP_BETWEEN = 1.0         # Pause entre les appels API
MAX_RETRIES   = 2           # Nombre de tentatives en cas d'échec de parsing

# Angles de génération pour chaque passe (diversité maximale)
ANGLES = [
    "Privilégie les définitions, concepts fondamentaux et la terminologie précise. Exploite chaque notion clé.",
    "Privilégie les DATES, CHIFFRES, SEUILS et TEXTES DE LOI. Exploite chaque nombre présent dans le texte.",
    "Privilégie les distinctions entre concepts voisins (ex: déconcentration vs décentralisation, EPCI vs collectivité territoriale, etc.).",
    "Privilégie les mécanismes, procédures, le rôle des institutions et les relations entre acteurs.",
    "Privilégie les cas pratiques, mises en situation et applications des règles à des scénarios concrets.",
    "Privilégie les exceptions, les cas particuliers et les évolutions historiques mentionnées dans le texte.",
    "Privilégie les comparaisons (avant/après une loi, différence entre deux régimes juridiques, etc.).",
    "Privilégie les questions qui mélangent plusieurs concepts du texte pour tester la compréhension globale."
]

PROMPT = """Tu es un expert en préparation au concours d'Attaché Territorial (CNFPT).

Voici le contenu d'une fiche intitulée « {section_title} » (chapitre : « {chapter_title} ») :

---
{content}
---

Génère le MAXIMUM de questions à choix multiples (QCM) possible basées UNIQUEMENT sur ce contenu.
Ne te limite PAS à un nombre fixe. Exploite chaque alinéa, chaque concept, chaque loi, chaque date,
chaque distinction. Si le texte est dense, tu peux générer 30, 40, 50 questions ou plus.
L'objectif est de couvrir TOUT le contenu sans rien laisser de côté.

Répartis les questions sur tous les niveaux cognitifs (Taxonomie de Bloom) :
- rappel : définitions, chiffres clés, noms d'institutions
- comprehension : expliquer un mécanisme, distinguer deux concepts
- application/analyse : appliquer une règle à un cas, identifier une conséquence

{angle}

Règles absolues :
- Questions en français, formulées clairement et précisément
- 4 options de réponse PLAUSIBLES — les mauvaises réponses doivent être crédibles, pas triviales
- 1 seule bonne réponse (jamais "Toutes ces réponses", "Aucune de ces réponses")
- Pas de double négation, pas de pièges syntaxiques
- Exploite les DATES, CHIFFRES et ARTICLES DE LOI présents dans le texte (ex: dates de lois, pourcentages, montants, seuils, effectifs, délais)
- Ne pas inventer de données absentes du texte fourni
- Explication courte de la bonne réponse (1-2 phrases, ancrée dans le texte)
- IMPORTANT: Dans les champs "q", "options", "explanation" et "sourceText", n'utilise JAMAIS de guillemets doubles (") à l'interieur du texte. Utilise des apostrophes ou des guillemets français « ». Les guillemets doubles sont reserves a la structure JSON.
- IMPORTANT: Le champ "sourceText" doit contenir la phrase ou le paragraphe EXACT extrait mot pour mot du contenu fourni ci-dessus qui justifie la bonne réponse. Ne reformule PAS, ne résume PAS — recopie textuellement le passage source.

NOUVEAU : Pour chaque question, tu dois aussi fournir :
1. "keywords" : un tableau de 2 à 4 mots-clés associés à la question, chaque mot-clé étant un objet avec :
   - "term" : le mot ou concept clé (ex: "personne morale", "déconcentration")
   - "type" : "concept" | "legal" | "institution" | "date" | "chiffre"
   - "ref" : (optionnel) une référence courte (ex: "Loi NOTRe", "Art. 72")
2. "wrongExplanation" : (optionnel) une phrase expliquant pourquoi les mauvaises réponses sont fausses, pour aider l'utilisateur à comprendre ses erreurs.

Format JSON strict — réponds UNIQUEMENT avec ce JSON valide, aucun texte autour :
[
  {{
    "bloom": "rappel",
    "q": "Question en francais sans guillemets doubles internes",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0,
    "explanation": "Explication sans guillemets doubles internes.",
    "sourceText": "Recopie ici mot pour mot le passage du contenu fourni qui justifie la bonne réponse.",
    "keywords": [
      {{"term": "Mot-clé 1", "type": "concept", "ref": "Référence"}},
      {{"term": "Mot-clé 2", "type": "legal"}}
    ],
    "wrongExplanation": "Option A est fausse car... Option B est fausse car..."
  }}
]

"bloom" : "rappel" | "comprehension" | "application"
"answer" : index (0, 1, 2 ou 3) de la bonne réponse dans "options"
"sourceText" : texte extrait mot pour mot du contenu fourni
"keywords" : tableau optionnel de mots-clés
"wrongExplanation" : texte optionnel expliquant les erreurs
"""


def truncate(content: str, max_chars: int) -> str:
    if len(content) <= max_chars:
        return content
    return content[:max_chars] + '\n[…contenu tronqué…]'


def repair_json(text: str) -> str:
    """Répare un JSON mal formé produit par un LLM.
    
    Problèmes fréquents avec Deepseek :
    - Guillemets doubles non échappés dans les chaînes (ex: "loi "NOTRe"")
    - Apostrophes dans les chaînes (ex: "l'État")
    - Caractères de contrôle
    """
    # Étape 1 : extraire le tableau JSON
    match = re.search(r'\[.*\]', text, re.DOTALL)
    if match:
        text = match.group()
    
    # Étape 2 : échapper tous les guillemets doubles qui sont DÉJÀ à l'intérieur de chaînes
    result = []
    in_string = False
    prev_char = ''
    i = 0
    while i < len(text):
        ch = text[i]
        if ch == '"' and (i == 0 or text[i-1] != '\\'):
            if in_string:
                # Vérifier si ce " est un vrai délimiteur ou un guillemet dans le texte
                next_chars = text[i+1:i+5].strip()
                if next_chars and next_chars[0] in ',]}':
                    in_string = False
                    result.append(ch)
                else:
                    # C'est un guillemet dans le texte → l'échapper
                    result.append('\\"')
            else:
                in_string = True
                result.append(ch)
        else:
            result.append(ch)
        i += 1
    
    return ''.join(result)


def parse_json(text: str) -> list:
    """Parse le JSON de la réponse, avec tolérance maximale aux erreurs de formatage."""
    # Nettoyer les marqueurs de code
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    text = text.strip()

    # Tentative 1 : parsing direct
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Tentative 2 : extraire le tableau et réparer
    repaired = repair_json(text)
    try:
        return json.loads(repaired)
    except json.JSONDecodeError:
        pass

    # Tentative 3 : parsing avec remplacement des guillemets français
    text_fixed = text.replace('«', "'").replace('»', "'").replace('"', "'")
    # Re-encadrer les clés avec des guillemets
    text_fixed = re.sub(r"'([a-zA-Z_]+)'\s*:", r'"\1":', text_fixed)
    try:
        return json.loads(text_fixed)
    except json.JSONDecodeError:
        pass

    # Tentative 4 : extraction ligne par ligne
    lines = text.split('\n')
    json_lines = []
    in_json = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('['):
            in_json = True
        if in_json:
            json_lines.append(line)
        if in_json and stripped.endswith(']'):
            break

    if json_lines:
        try:
            return json.loads('\n'.join(json_lines))
        except json.JSONDecodeError:
            pass

    # Si tout échoue, lever l'erreur
    raise json.JSONDecodeError(f"Impossible de parser la réponse JSON", text[:200], 0)


def validate(questions: list) -> list:
    valid = []
    for q in questions:
        if not isinstance(q, dict):
            continue
        if not all(k in q for k in ['bloom', 'q', 'options', 'answer']):
            continue
        if not isinstance(q['options'], list) or len(q['options']) != 4:
            continue
        if not isinstance(q['answer'], int) or not (0 <= q['answer'] <= 3):
            continue
        if not q['q'].strip():
            continue
        if q.get('bloom') not in ('rappel', 'comprehension', 'application'):
            q['bloom'] = 'comprehension'
        valid.append(q)
    return valid


def make_id(chapter_id: str, section_id: str, idx: int) -> str:
    return f"{chapter_id}__{section_id}__{idx:03d}"


def make_source_link(title: str) -> str:
    """Génère un slug d'ancre HTML à partir d'un titre de section."""
    slug = title.lower()
    slug = slug.replace("'", '-')
    slug = slug.replace('«', '').replace('»', '')
    slug = slug.replace(':', '').replace(',', '').replace('.', '')
    slug = slug.replace('(', '').replace(')', '')
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug.strip())
    slug = re.sub(r'-+', '-', slug)
    slug = slug.strip('-')
    return f'#section-{slug}'


def generate(client, chapter_title: str, section_title: str, content: str, angle: str) -> list:
    prompt = PROMPT.format(
        chapter_title=chapter_title,
        section_title=section_title,
        content=truncate(content, MAX_CONTENT),
        angle=angle,
    )
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = response.choices[0].message.content
    questions = parse_json(raw)
    return validate(questions)


def load_pool() -> dict:
    if os.path.exists(POOL_PATH):
        with open(POOL_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"chapters": []}


def save_pool(pool: dict) -> None:
    os.makedirs(os.path.dirname(POOL_PATH), exist_ok=True)
    with open(POOL_PATH, 'w', encoding='utf-8') as f:
        json.dump(pool, f, ensure_ascii=False, indent=2)


def get_existing_section_ids(pool: dict) -> set:
    """Retourne les section_ids déjà générés dans le pool."""
    seen = set()
    for ch in pool.get('chapters', []):
        for q in ch.get('questions', []):
            seen.add(q.get('sectionId', ''))
    return seen


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--force',   action='store_true')
    parser.add_argument('--chapter', help='ID du chapitre (ex: env1)')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()

    api_key = os.environ.get('DEEPSEEK_API_KEY')
    if not api_key:
        print("❌ DEEPSEEK_API_KEY non défini.")
        print("   Lance : export DEEPSEEK_API_KEY=sk-...")
        sys.exit(1)

    client = OpenAI(api_key=api_key, base_url=API_BASE_URL)

    # ─── Charger le pool (auto-référencement) ────────────────────────────────
    pool = {} if args.force else load_pool()
    if 'chapters' not in pool:
        pool = {"chapters": []}

    # Index du pool par chapter_id pour accès rapide
    pool_index = {ch['id']: ch for ch in pool['chapters']}

    # Sections déjà générées (pour skip)
    existing_sections = set() if args.force else get_existing_section_ids(pool)

    total_generated = 0
    total_skipped   = 0
    total_errors    = 0

    # ─── Parcourir les chapitres du pool lui-même ────────────────────────────
    for ch in pool['chapters']:
        if args.chapter and ch['id'] != args.chapter:
            continue

        print(f"\n📚 [{ch['id']}] {ch['title']}")

        # S'assurer que le chapitre a un champ 'sections'
        if 'sections' not in ch or not ch['sections']:
            print(f"  ⏭  Aucune section dans ce chapitre")
            continue

        for section_key, section_data in ch['sections'].items():
            content = section_data.get('content', '').strip()
            if len(content) < 80:
                print(f"  ⏭  Contenu insuffisant : {section_data['title']}")
                total_skipped += 1
                continue

            section_title = section_data['title']

            # Si --force, on supprime les anciennes questions de cette section
            if args.force:
                ch['questions'] = [
                    q for q in ch['questions']
                    if q.get('sectionId') != section_key
                ]
                existing_sections.discard(section_key)

            # Compter les questions déjà existantes pour cette section
            existing_count = sum(1 for q in ch['questions'] if q.get('sectionId') == section_key)

            # Déterminer les passes à exécuter
            passes_to_run = range(len(ANGLES))

            for passe_idx in passes_to_run:
                angle = ANGLES[passe_idx]
                passe_label = f"  ⚡ Passe {passe_idx + 1}/{len(ANGLES)} : {section_title[:40]}"

                # Vérifier si cette passe a déjà été générée (si pas --force)
                if not args.force:
                    passe_done = any(
                        q.get('id', '').endswith(f"__p{passe_idx}")
                        for q in ch['questions']
                        if q.get('sectionId') == section_key
                    )
                    if passe_done:
                        print(f"  ✓  Passe {passe_idx + 1} déjà faite : {section_title[:40]}")
                        total_skipped += 1
                        continue

                print(passe_label, end='', flush=True)

                # Tentatives avec retry
                success = False
                for attempt in range(MAX_RETRIES + 1):
                    try:
                        questions = generate(client, ch['title'], section_title, content, angle)

                        # Ajouter les IDs, sectionId, sourceLink et marquer la passe
                        source_link = make_source_link(section_title)
                        for idx, q in enumerate(questions):
                            q['id'] = make_id(ch['id'], section_key.split('__')[-1], existing_count + idx) + f"__p{passe_idx}"
                            q['sectionId'] = section_key
                            q['sectionTitle'] = section_title
                            q['sourceLink'] = source_link
                            # Si Deepseek n'a pas fourni sourceText, alerter et mettre chaîne vide
                            if 'sourceText' not in q or not q['sourceText']:
                                print(f"  ⚠️  sourceText manquant pour {q.get('id', '?')} — mis à vide")
                                q['sourceText'] = ''

                        if args.dry_run:
                            print(f" [DRY-RUN] {len(questions)} Q")
                        else:
                            ch['questions'].extend(questions)
                            save_pool(pool)  # ← Sauvegarde après chaque passe !
                            print(f" {len(questions)} Q ✓")

                        total_generated += len(questions)
                        existing_count += len(questions)
                        success = True
                        break  # Sortir de la boucle de retry

                    except Exception as e:
                        if attempt < MAX_RETRIES:
                            print(f" ⚠ retry {attempt+1}/{MAX_RETRIES}", end='', flush=True)
                            time.sleep(SLEEP_BETWEEN * 2)
                        else:
                            print(f" ERREUR : {e}")
                            total_errors += 1

                time.sleep(SLEEP_BETWEEN)

    if not args.dry_run:
        save_pool(pool)
        print(f"\n💾 Pool sauvegardé → {POOL_PATH}")

    # Statistiques
    total_q = sum(len(ch.get('questions', [])) for ch in pool.get('chapters', []))
    print(f"\n{'=' * 45}")
    print(f"  Questions générées cette session : {total_generated}")
    print(f"  Sections ignorées               : {total_skipped}")
    print(f"  Erreurs                         : {total_errors}")
    print(f"  Total questions dans le pool    : {total_q}")


if __name__ == '__main__':
    main()
