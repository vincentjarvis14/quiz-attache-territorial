#!/usr/bin/env python3
"""
backfill_source_text.py — Ajoute le champ sourceText à chaque question.

Pour chaque question du pool, le script :
1. Prend l'explication (qui mentionne le texte source)
2. Cherche dans le contenu de la section correspondante le paragraphe qui matche
3. Assigne ce paragraphe comme sourceText

Usage:
  python3 scripts/backfill_source_text.py              # Applique
  python3 scripts/backfill_source_text.py --dry-run    # Analyse seulement
"""

import json
import re
import os
import sys
from difflib import SequenceMatcher

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POOL_PATH = os.path.join(BASE_DIR, 'data', 'quiz_pool.json')


def load_pool():
    with open(POOL_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_pool(pool):
    with open(POOL_PATH, 'w', encoding='utf-8') as f:
        json.dump(pool, f, ensure_ascii=False, indent=2)


def normalize(text):
    """Normalise un texte pour la comparaison."""
    text = text.lower()
    text = re.sub(r'[«»""]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def normalize_id(section_id):
    """Normalise un sectionId pour la comparaison (ignore accents, troncature)."""
    nid = section_id.lower()
    nid = nid.replace('é', 'e').replace('è', 'e').replace('ê', 'e')
    nid = nid.replace('à', 'a').replace('â', 'a')
    nid = nid.replace('ù', 'u').replace('û', 'u')
    nid = nid.replace('ç', 'c')
    nid = nid.replace('ô', 'o').replace('î', 'i').replace('ï', 'i')
    return nid


def extract_key_phrases(explanation):
    """Extrait les phrases-clés de l'explication pour chercher dans le source."""
    # Enlever les préfixes génériques
    prefixes = [
        r'^le texte (indique|mentionne|cite|précise|dit|explique|conclut|définit|affirme|souligne|rappelle|note|présente|décrit|énumère|distingue|compare|oppose) ',
        r'^la source ',
        r'^le document ',
        r'^la fiche ',
        r'^selon le texte ',
        r"^d'après le texte ",
        r'^il est (mentionné|indiqué|précisé|dit|expliqué|noté|souligné|rappelé) ',
        r'^c\'est ',
        r'^la réponse est ',
        r'^la bonne réponse est ',
        r'^la phrase ',
        r'^le passage ',
    ]
    
    text = explanation
    for prefix in prefixes:
        text = re.sub(prefix, '', text, flags=re.IGNORECASE)
    
    # Nettoyer
    text = text.strip().strip('.,;:!?')
    
    # Découper en phrases
    sentences = re.split(r'(?<=[.!?])\s+', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 15]
    
    if sentences:
        return sentences
    return [text]


def find_best_match(explanation, content):
    """Trouve le meilleur paragraphe dans le contenu qui correspond à l'explication.
    
    Stratégie en 3 niveaux :
    1. Match exact : la phrase de l'explication est textuellement dans un paragraphe
    2. Match de mots-clés : les mots importants de l'explication sont dans le paragraphe
    3. Similarité de séquence : SequenceMatcher
    """
    if not content or not explanation:
        return None
    
    # Découper le contenu en paragraphes (sauts de ligne doubles)
    paragraphs = re.split(r'\n\s*\n', content)
    paragraphs = [p.strip() for p in paragraphs if len(p.strip()) > 20]
    
    if not paragraphs:
        return None
    
    # Extraire les phrases-clés de l'explication
    key_phrases = extract_key_phrases(explanation)
    
    best_score = 0
    best_para = None
    
    for para in paragraphs:
        para_norm = normalize(para)
        
        for phrase in key_phrases:
            phrase_norm = normalize(phrase)
            if len(phrase_norm) < 10:
                continue
            
            # Niveau 1 : Match exact (la phrase est textuellement dans le paragraphe)
            if phrase_norm in para_norm:
                score = 1.0 + (len(phrase_norm) / len(para_norm)) * 0.5  # Bonus de longueur
                if score > best_score:
                    best_score = score
                    best_para = para
                continue  # Pas besoin d'aller plus loin pour cette phrase
            
            # Niveau 2 : Mots-clés importants
            # Extraire les mots significatifs (>= 4 lettres, pas des mots vides)
            stop_words = {'cette', 'dans', 'avec', 'sans', 'pour', 'sur', 'tout', 'tous', 
                         'toute', 'toutes', 'leur', 'leurs', 'entre', 'chez', 'donc',
                         'mais', 'alors', 'bien', 'fait', 'faire', 'être', 'avoir',
                         'texte', 'source', 'fiche', 'document', 'selon', 'dans'}
            phrase_words = set(re.findall(r'\b[a-zéèêëàâîïôùûç]{4,}\b', phrase_norm))
            phrase_words = phrase_words - stop_words
            para_words = set(re.findall(r'\b[a-zéèêëàâîïôùûç]{4,}\b', para_norm))
            
            if phrase_words and para_words:
                common = phrase_words & para_words
                word_score = len(common) / len(phrase_words)
                
                # Bonus si les mots sont dans le même ordre
                if word_score >= 0.5:
                    score = 0.5 + word_score * 0.3
                    if score > best_score:
                        best_score = score
                        best_para = para
            
            # Niveau 3 : Similarité de séquence
            seq_score = SequenceMatcher(None, phrase_norm, para_norm).ratio()
            if seq_score > 0.4:
                score = seq_score
                if score > best_score:
                    best_score = score
                    best_para = para
    
    # Seuil : on accepte si score >= 0.4
    if best_score >= 0.4:
        return best_para
    
    # Dernier recours : chercher mot par mot
    # Prendre les 3 mots les plus longs de l'explication
    all_words = re.findall(r'\b[a-zéèêëàâîïôùûç]{5,}\b', normalize(explanation))
    all_words = [w for w in all_words if w not in stop_words]
    if len(all_words) >= 3:
        top_words = sorted(set(all_words), key=len, reverse=True)[:3]
        for para in paragraphs:
            para_norm = normalize(para)
            matches = sum(1 for w in top_words if w in para_norm)
            if matches >= 2:
                return para
    
    return None


def find_section_content(pool, question_section_id):
    """Trouve le contenu de la section correspondant à un sectionId de question.
    
    Gère les différences d'encodage (accents) et les troncatures.
    """
    # Normaliser le sectionId de la question
    q_norm = normalize_id(question_section_id)
    
    for ch in pool['chapters']:
        if 'sections' in ch:
            for section_key, section_data in ch['sections'].items():
                s_norm = normalize_id(section_key)
                # Vérifier si l'un contient l'autre (gère les troncatures)
                if q_norm in s_norm or s_norm in q_norm:
                    return section_data.get('content', '')
    return ''


def backfill(pool, dry_run=True):
    """Ajoute sourceText à chaque question qui en manque."""
    
    total = sum(len(ch.get('questions', [])) for ch in pool['chapters'])
    found = 0
    not_found = 0
    already_have = 0
    
    for ch in pool['chapters']:
        for q in ch.get('questions', []):
            # Si déjà un sourceText, on passe
            if 'sourceText' in q and q['sourceText']:
                already_have += 1
                continue
            
            explanation = q.get('explanation', '')
            section_id = q.get('sectionId', '')
            
            if not explanation:
                not_found += 1
                continue
            
            # Chercher dans le contenu de la section
            content = find_section_content(pool, section_id)
            
            if not content:
                not_found += 1
                continue
            
            best_para = find_best_match(explanation, content)
            
            if best_para:
                if not dry_run:
                    q['sourceText'] = best_para
                found += 1
            else:
                not_found += 1
    
    print(f"\n📊 Résultats du backfill sourceText:")
    print(f"   Total questions : {total}")
    print(f"   Déjà présents   : {already_have}")
    print(f"   Trouvés         : {found}")
    print(f"   Non trouvés     : {not_found}")
    
    if not_found > 0:
        print(f"\n⚠️  {not_found} questions sans sourceText")
    
    return pool


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Backfill sourceText dans le pool')
    parser.add_argument('--dry-run', action='store_true', help='Analyse seulement')
    args = parser.parse_args()
    
    pool = load_pool()
    
    if args.dry_run:
        print("🔍 Mode DRY-RUN : analyse uniquement\n")
        backfill(pool, dry_run=True)
        print("\n✅ Analyse terminée. Lance sans --dry-run pour appliquer.")
    else:
        print("✂️  Backfill sourceText en cours...\n")
        pool = backfill(pool, dry_run=False)
        save_pool(pool)
        print(f"\n✅ Pool mis à jour → {POOL_PATH}")


if __name__ == '__main__':
    main()
