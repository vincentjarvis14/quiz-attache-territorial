#!/usr/bin/env python3
"""
quality_filter_questions.py — Filtre qualité du pool de questions.

Lit : data/quiz_pool.json
Analyse chaque question sur plusieurs critères de qualité.
Supprime les questions faibles, les doublons, les questions vagues.
Produit un rapport détaillé et sauvegarde le pool filtré.

Usage:
  python3 scripts/quality_filter_questions.py              # Analyse + filtre
  python3 scripts/quality_filter_questions.py --dry-run    # Analyse seulement, ne filtre pas
  python3 scripts/quality_filter_questions.py --target 300 # Cible un nombre spécifique
"""

import json
import re
import sys
import os
from collections import Counter, defaultdict
from difflib import SequenceMatcher

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POOL_PATH = os.path.join(BASE_DIR, 'data', 'quiz_pool.json')

# ─── Patterns de questions faibles ──────────────────────────────────────────

# Mots-clés indiquant une réponse vague ou une non-réponse
VAGUE_ANSWER_PATTERNS = [
    r'aucun détail',
    r'non précisé',
    r'pas détaillé',
    r'mentionné sans',
    r'sans détail',
    r'non mentionné',
    r'pas mentionné',
    r'aucune information',
    r'pas d\'information',
    r'ne précise pas',
    r'ne donne pas',
    r'non spécifié',
    r'pas spécifié',
    r'aucune précision',
    r'pas de précision',
    r'le texte ne',
    r'le document ne',
    r'la source ne',
    r'pas de détail',
    r'pas de mention',
    r'pas de référence',
    r'pas de source',
    r'pas de texte',
    r'pas de contenu',
    r'pas de réponse',
    r'pas de bonne réponse',
    r'aucune bonne réponse',
    r'toutes ces réponses',
    r'aucune de ces réponses',
    r'toutes les réponses',
    r'aucune des réponses',
]

# Mots-clés indiquant une question trop générique / devinable sans cours
GENERIC_QUESTION_PATTERNS = [
    r'quel est le rôle',
    r'quel est le but',
    r'quel est l\'objectif',
    r'quelle est la fonction',
    r'à quoi sert',
    r'pourquoi',
    r'est-ce que',
    r'peut-on',
    r'peut-il',
    r'peut-elle',
]

# Mots-clés indiquant une explication faible
WEAK_EXPLANATION_PATTERNS = [
    r'^le texte mentionne',
    r'^le texte indique',
    r'^le texte cite',
    r'^le texte précise',
    r'^le texte dit',
    r'^selon le texte',
    r'^d\'après le texte',
    r'^la réponse est',
    r'^la bonne réponse est',
    r'^il est mentionné',
    r'^il est indiqué',
    r'^il est précisé',
    r'^c\'est la',
    r'^c\'est le',
    r'^c\'est une',
    r'^c\'est un',
]

# Patterns de questions "piège" ou mal formulées
TRAP_QUESTION_PATTERNS = [
    r'ne sont pas',
    r'n\'est pas',
    r'sauf',
    r'excepté',
    r'à l\'exception',
    r'faux',
    r'incorrect',
    r'pas vrai',
]

# Patterns de questions trop faciles (réponse évidente)
TOO_EASY_PATTERNS = [
    r'est vrai',
    r'est correct',
    r'est exact',
    r'est juste',
    r'est bonne',
    r'est la bonne',
    r'est la réponse',
    r'est le bon',
    r'est la bonne réponse',
]


def load_pool():
    with open(POOL_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_pool(pool):
    with open(POOL_PATH, 'w', encoding='utf-8') as f:
        json.dump(pool, f, ensure_ascii=False, indent=2)


def normalize_text(text):
    """Normalise un texte pour la comparaison."""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def text_similarity(a, b):
    """Calcule la similarité entre deux textes (0-1)."""
    return SequenceMatcher(None, normalize_text(a), normalize_text(b)).ratio()


def has_vague_answer(q):
    """Détecte si la réponse ou l'explication est vague."""
    answer_text = q['options'][q['answer']].lower()
    explanation = q.get('explanation', '').lower()
    
    for pattern in VAGUE_ANSWER_PATTERNS:
        if re.search(pattern, answer_text) or re.search(pattern, explanation):
            return True, f"Réponse vague: correspond au pattern '{pattern}'"
    
    # Détecter les réponses qui disent "mentionné sans détail" etc.
    vague_phrases = [
        'sans détail', 'sans précision', 'sans explication',
        'mentionné', 'cité', 'évoqué', 'signalé',
    ]
    for phrase in vague_phrases:
        if phrase in answer_text and any(w in answer_text for w in ['non', 'pas', 'sans', 'aucun']):
            return True, f"Réponse évasive: '{phrase}' dans la réponse"
    
    return False, ""


def is_generic_question(q):
    """Détecte si la question est trop générique (devinable sans cours)."""
    question = q['q'].lower()
    
    for pattern in GENERIC_QUESTION_PATTERNS:
        if re.match(pattern, question):
            return True, f"Question générique: commence par '{pattern}'"
    
    return False, ""


def has_weak_explanation(q):
    """Détecte si l'explication est faible."""
    explanation = q.get('explanation', '').lower()
    
    if len(explanation) < 20:
        return True, "Explication trop courte (< 20 caractères)"
    
    for pattern in WEAK_EXPLANATION_PATTERNS:
        if re.match(pattern, explanation):
            return True, f"Explication faible: commence par '{pattern}'"
    
    return False, ""


def has_absurd_distractors(q):
    """Détecte si les distracteurs sont absurdes ou non crédibles."""
    options = q['options']
    answer_idx = q['answer']
    
    # Vérifier la longueur des options
    lengths = [len(o) for o in options]
    avg_len = sum(lengths) / len(lengths)
    
    # Une option beaucoup plus longue ou plus courte que la moyenne
    for i, opt in enumerate(options):
        if abs(len(opt) - avg_len) > avg_len * 1.5 and len(opt) > 10:
            if i != answer_idx:
                return True, f"Distracteur {i} de longueur anormale ({len(opt)} vs moyenne {avg_len:.0f})"
    
    # Vérifier si un distracteur est trop absurde
    for i, opt in enumerate(options):
        if i != answer_idx:
            # Trop court = pas crédible
            if len(opt) < 5:
                return True, f"Distracteur {i} trop court ({len(opt)} caractères)"
            # Contient des mots hors sujet
            if any(word in opt.lower() for word in ['peut-être', 'possiblement', 'probablement']):
                return True, f"Distracteur {i} trop vague"
    
    return False, ""


def is_duplicate(q, other_questions, threshold=0.85):
    """Détecte si une question est un doublon d'une autre."""
    q_norm = normalize_text(q['q'])
    
    for other in other_questions:
        if other.get('_removed'):
            continue
        other_norm = normalize_text(other['q'])
        similarity = text_similarity(q_norm, other_norm)
        if similarity > threshold:
            return True, f"Doublon (similarité {similarity:.0%}) avec: {other['q'][:80]}..."
    
    return False, ""


def is_too_easy(q):
    """Détecte si la question est trop facile."""
    question = q['q'].lower()
    
    for pattern in TOO_EASY_PATTERNS:
        if re.search(pattern, question):
            return True, f"Question trop facile: contient '{pattern}'"
    
    return False, ""


def is_trap_question(q):
    """Détecte les questions piège mal formulées."""
    question = q['q'].lower()
    
    for pattern in TRAP_QUESTION_PATTERNS:
        if re.search(pattern, question):
            return True, f"Question piège: contient '{pattern}'"
    
    return False, ""


def has_good_distractors(q):
    """Vérifie que les distracteurs sont plausibles (même thème)."""
    options = q['options']
    answer_idx = q['answer']
    answer = options[answer_idx].lower()
    
    # Extraire les mots-clés de la bonne réponse
    answer_words = set(normalize_text(answer).split())
    
    for i, opt in enumerate(options):
        if i == answer_idx:
            continue
        opt_words = set(normalize_text(opt).split())
        # Vérifier qu'il y a au moins un mot en commun (même thème)
        common = answer_words & opt_words
        if not common and len(answer_words) > 2:
            return False, f"Distracteur {i} hors sujet: '{opt[:50]}'"
    
    return True, ""


def score_question(q, all_questions, index):
    """Note une question sur 100."""
    score = 100
    reasons = []
    
    # Pénalités
    is_vague, reason = has_vague_answer(q)
    if is_vague:
        score -= 40
        reasons.append(f"🔴 {reason}")
    
    is_gen, reason = is_generic_question(q)
    if is_gen:
        score -= 25
        reasons.append(f"🟡 {reason}")
    
    is_weak, reason = has_weak_explanation(q)
    if is_weak:
        score -= 20
        reasons.append(f"🟡 {reason}")
    
    has_absurd, reason = has_absurd_distractors(q)
    if has_absurd:
        score -= 20
        reasons.append(f"🟠 {reason}")
    
    is_dup, reason = is_duplicate(q, all_questions[:index] + all_questions[index+1:])
    if is_dup:
        score -= 30
        reasons.append(f"🔴 {reason}")
    
    is_easy, reason = is_too_easy(q)
    if is_easy:
        score -= 15
        reasons.append(f"🟡 {reason}")
    
    is_trap, reason = is_trap_question(q)
    if is_trap:
        score -= 10
        reasons.append(f"🟠 {reason}")
    
    has_good, reason = has_good_distractors(q)
    if not has_good:
        score -= 15
        reasons.append(f"🟠 {reason}")
    
    # Bonus
    explanation = q.get('explanation', '')
    if len(explanation) > 80:
        score += 5
    if any(word in explanation.lower() for word in ['article', 'loi', 'décret', 'constitution', 'code']):
        score += 10
        reasons.append(f"🟢 Référence juridique dans l'explication")
    
    bloom = q.get('bloom', '')
    if bloom == 'application':
        score += 5  # Bonus pour les questions d'application (plus rares)
    
    return max(0, min(100, score)), reasons


def analyze_pool(pool, dry_run=True, target_count=300):
    """Analyse complète du pool et filtre les questions."""
    
    print("=" * 60)
    print("🔍 ANALYSE QUALITÉ DU POOL DE QUESTIONS")
    print("=" * 60)
    
    total_before = sum(len(ch.get('questions', [])) for ch in pool['chapters'])
    print(f"\n📊 Pool avant filtre : {total_before} questions")
    
    all_removed = []
    all_kept = []
    
    for ch in pool['chapters']:
        print(f"\n{'─' * 50}")
        print(f"📚 {ch['title']} ({ch['id']})")
        print(f"{'─' * 50}")
        
        questions = ch.get('questions', [])
        print(f"   Questions dans ce chapitre : {len(questions)}")
        
        # Analyser chaque question
        scored = []
        for idx, q in enumerate(questions):
            score, reasons = score_question(q, questions, idx)
            scored.append((score, reasons, q))
        
        # Trier par score
        scored.sort(key=lambda x: x[0])
        
        # Afficher les plus faibles
        print(f"\n   📉 Questions les plus faibles (score < 50):")
        weak_count = 0
        for score, reasons, q in scored:
            if score < 50:
                weak_count += 1
                if weak_count <= 5:  # Afficher les 5 premières seulement
                    print(f"      Score {score:2d} | {q['q'][:80]}...")
                    for r in reasons[:3]:
                        print(f"        {r}")
        
        print(f"      Total faibles: {weak_count}")
        
        # Afficher les meilleures
        print(f"\n   📈 Questions les plus solides (score >= 80):")
        strong_count = sum(1 for s, _, _ in scored if s >= 80)
        print(f"      Total solides: {strong_count}")
        
        # Décider du filtrage
        if not dry_run:
            # Garder les questions avec score >= 50, sauf si on doit réduire davantage
            kept = [(s, r, q) for s, r, q in scored if s >= 50]
            
            # Si on a encore trop de questions, ne garder que les meilleures
            # en fonction de la cible
            sections = defaultdict(list)
            for s, r, q in kept:
                sections[q.get('sectionTitle', '?')].append((s, r, q))
            
            # Répartition cible par section
            target_per_section = max(1, target_count // len(sections))
            
            new_questions = []
            for section, section_qs in sections.items():
                section_qs.sort(key=lambda x: x[0], reverse=True)
                # Garder les meilleures de chaque section
                keep_count = min(len(section_qs), target_per_section)
                kept_section = section_qs[:keep_count]
                new_questions.extend([q for _, _, q in kept_section])
                
                removed_count = len(section_qs) - keep_count
                if removed_count > 0:
                    print(f"      Section '{section}': gardé {keep_count}/{len(section_qs)} (supprimé {removed_count})")
            
            ch['questions'] = new_questions
            
            removed = [q for _, _, q in scored if q not in new_questions]
            all_removed.extend(removed)
            all_kept.extend(new_questions)
    
    total_after = sum(len(ch.get('questions', [])) for ch in pool['chapters'])
    
    print(f"\n{'=' * 60}")
    print(f"📋 RÉSULTATS")
    print(f"{'=' * 60}")
    print(f"   Avant : {total_before} questions")
    print(f"   Après : {total_after} questions")
    print(f"   Supprimées : {total_before - total_after}")
    
    if not dry_run:
        # Statistiques finales
        blooms = Counter()
        sections = Counter()
        for ch in pool['chapters']:
            for q in ch.get('questions', []):
                blooms[q.get('bloom', '?')] += 1
                sections[q.get('sectionTitle', '?')] += 1
        
        print(f"\n   📊 Répartition Bloom finale:")
        for b, c in blooms.most_common():
            pct = c / total_after * 100
            print(f"      {b}: {c} ({pct:.0f}%)")
        
        print(f"\n   📊 Répartition par section:")
        for s, c in sections.most_common():
            print(f"      {s}: {c}")
    
    return pool


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Filtre qualité du pool de questions')
    parser.add_argument('--dry-run', action='store_true', help='Analyse seulement, ne filtre pas')
    parser.add_argument('--target', type=int, default=300, help='Nombre cible de questions')
    args = parser.parse_args()
    
    pool = load_pool()
    
    if args.dry_run:
        print("🔍 Mode DRY-RUN : analyse uniquement, aucun changement\n")
        analyze_pool(pool, dry_run=True, target_count=args.target)
        print("\n✅ Analyse terminée. Aucune modification apportée.")
        print("   Lance sans --dry-run pour appliquer le filtre.")
    else:
        print("✂️  Mode FILTRAGE : les questions faibles vont être supprimées\n")
        pool = analyze_pool(pool, dry_run=False, target_count=args.target)
        save_pool(pool)
        print(f"\n✅ Pool filtré et sauvegardé → {POOL_PATH}")


if __name__ == '__main__':
    main()
