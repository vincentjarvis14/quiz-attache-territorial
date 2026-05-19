#!/usr/bin/env python3
"""
randomize_answers.py — Randomise les positions des options dans quiz_pool.json

Corrige le biais de réponse : si la bonne réponse est toujours à l'index 0,
l'utilisateur peut "tricher". Ce script mélange les options de chaque question
et met à jour l'index answer en conséquence.

Usage:
  python3 scripts/randomize_answers.py              # Randomise tout
  python3 scripts/randomize_answers.py --dry-run    # Test sans écrire
  python3 scripts/randomize_answers.py --seed 42    # Seed reproductible
"""

import json
import random
import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POOL_PATH = os.path.join(BASE_DIR, 'data', 'quiz_pool.json')


def randomize_question(q: dict, rng: random.Random) -> dict:
    """Mélange les options d'une question et met à jour answer."""
    options = q.get('options', [])
    answer = q.get('answer', 0)

    if not options or answer < 0 or answer >= len(options):
        return q  # Question invalide, on ignore

    # Associer chaque option à son index original
    indexed = list(enumerate(options))
    rng.shuffle(indexed)

    new_options = [opt for _, opt in indexed]
    new_answer = next(i for i, (orig_idx, _) in enumerate(indexed) if orig_idx == answer)

    q['options'] = new_options
    q['answer'] = new_answer
    return q


def main():
    dry_run = '--dry-run' in sys.argv

    seed = None
    for arg in sys.argv:
        if arg.startswith('--seed='):
            seed = int(arg.split('=')[1])

    rng = random.Random(seed)

    if not os.path.exists(POOL_PATH):
        print(f"❌ {POOL_PATH} introuvable.")
        sys.exit(1)

    with open(POOL_PATH, 'r', encoding='utf-8') as f:
        pool = json.load(f)

    total_questions = 0
    total_randomized = 0
    bias_before = {'0': 0, '1': 0, '2': 0, '3': 0}
    bias_after = {'0': 0, '1': 0, '2': 0, '3': 0}

    for ch in pool.get('chapters', []):
        for q in ch.get('questions', []):
            total_questions += 1
            old_answer = q.get('answer', 0)
            bias_before[str(old_answer)] = bias_before.get(str(old_answer), 0) + 1

            randomize_question(q, rng)

            new_answer = q.get('answer', 0)
            bias_after[str(new_answer)] = bias_after.get(str(new_answer), 0) + 1

            if old_answer != new_answer:
                total_randomized += 1

    # Stats
    print(f"\n📊 Statistiques de randomisation")
    print(f"{'=' * 40}")
    print(f"  Questions traitées : {total_questions}")
    print(f"  Questions randomisées : {total_randomized}")
    print()
    print(f"  Répartition AVANT :")
    for i in range(4):
        pct = (bias_before[str(i)] / total_questions * 100) if total_questions else 0
        bar = '█' * int(pct / 5) + '░' * (20 - int(pct / 5))
        print(f"    Option {i} : {bias_before[str(i)]:4d} ({pct:5.1f}%) {bar}")
    print()
    print(f"  Répartition APRÈS :")
    for i in range(4):
        pct = (bias_after[str(i)] / total_questions * 100) if total_questions else 0
        bar = '█' * int(pct / 5) + '░' * (20 - int(pct / 5))
        print(f"    Option {i} : {bias_after[str(i)]:4d} ({pct:5.1f}%) {bar}")

    if dry_run:
        print(f"\n🔍 DRY-RUN : aucune modification écrite.")
    else:
        with open(POOL_PATH, 'w', encoding='utf-8') as f:
            json.dump(pool, f, ensure_ascii=False, indent=2)
        print(f"\n✅ {total_randomized} questions randomisées → {POOL_PATH}")


if __name__ == '__main__':
    main()
