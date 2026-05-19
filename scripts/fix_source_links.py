#!/usr/bin/env python3
"""
fix_source_links.py — Corrige les sourceLink pour qu'ils pointent vers les vraies ancres HTML.

Les sourceLink ont été générés par Deepseek avec des slugs arbitraires.
Ce script les recalcule à partir des vrais titres de sections dans le pool.

Usage:
  python3 scripts/fix_source_links.py
"""

import json
import re
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POOL_PATH = os.path.join(BASE_DIR, 'data', 'quiz_pool.json')


def load_pool():
    with open(POOL_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_pool(pool):
    with open(POOL_PATH, 'w', encoding='utf-8') as f:
        json.dump(pool, f, ensure_ascii=False, indent=2)


def make_slug(title):
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


def fix_links(pool):
    """Corrige les sourceLink de toutes les questions."""
    
    # Construire un mapping sectionId → vrai slug
    section_slugs = {}
    for ch in pool['chapters']:
        if 'sections' in ch:
            for section_key, section_data in ch['sections'].items():
                title = section_data['title']
                section_slugs[section_key] = make_slug(title)
    
    fixed = 0
    total = 0
    
    for ch in pool['chapters']:
        for q in ch.get('questions', []):
            total += 1
            section_id = q.get('sectionId', '')
            old_link = q.get('sourceLink', '')
            
            # Nouveau link à partir du mapping
            new_link = section_slugs.get(section_id, old_link)
            
            if new_link != old_link:
                q['sourceLink'] = new_link
                fixed += 1
    
    print(f"📊 Correction des sourceLink :")
    print(f"   Total questions : {total}")
    print(f"   Corrigées       : {fixed}")
    print(f"   Inchangées      : {total - fixed}")
    
    return pool


def main():
    pool = load_pool()
    pool = fix_links(pool)
    save_pool(pool)
    print(f"\n✅ Pool mis à jour → {POOL_PATH}")


if __name__ == '__main__':
    main()
