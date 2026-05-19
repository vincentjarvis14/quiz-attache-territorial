#!/usr/bin/env python3
"""
embed_sections.py — ⚠️ OBSOLÈTE

Ce script n'est plus nécessaire car quiz_pool.json contient déjà
les sections embarquées directement.

Le projet est désormais autonome : generate_quiz.py lit les sections
depuis quiz_pool.json lui-même (auto-référencement).

Pour ajouter une nouvelle section, éditez directement data/quiz_pool.json
ou utilisez le script dédié d'import.
"""

import sys

def main():
    print("=" * 60)
    print("  ⚠️  embed_sections.py est OBSOLÈTE")
    print("=" * 60)
    print()
    print("  Ce script n'est plus nécessaire car le projet est")
    print("  désormais autonome.")
    print()
    print("  Les sections sont déjà embarquées dans quiz_pool.json.")
    print("  generate_quiz.py lit directement depuis ce fichier.")
    print()
    print("  Pour ajouter une nouvelle section :")
    print("    1. Éditez data/quiz_pool.json")
    print("    2. Ajoutez la section dans le chapitre concerné")
    print("    3. Lancez generate_quiz.py pour générer les questions")
    print()
    print("  Pour importer depuis courses.json :")
    print("    python3 embed_sections.py --import-from courses.json")
    print()
    print("=" * 60)
    
    if len(sys.argv) > 1 and sys.argv[1] == '--import-from':
        import json
        import os
        
        courses_path = sys.argv[2] if len(sys.argv) > 2 else None
        if not courses_path or not os.path.exists(courses_path):
            print("❌ Fichier courses.json introuvable.")
            sys.exit(1)
        
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        pool_path = os.path.join(base_dir, 'data', 'quiz_pool.json')
        
        with open(courses_path, 'r', encoding='utf-8') as f:
            courses = json.load(f)
        
        if not os.path.exists(pool_path):
            print(f"❌ {pool_path} introuvable.")
            sys.exit(1)
        
        with open(pool_path, 'r', encoding='utf-8') as f:
            pool = json.load(f)
        
        pool_by_id = {ch['id']: ch for ch in pool.get('chapters', [])}
        injected = 0
        
        for ch in courses.get('chapters', []):
            ch_id = ch['id']
            if ch_id not in pool_by_id:
                print(f"  ⏭  Chapitre {ch_id} absent du pool, ignoré")
                continue
            
            pool_ch = pool_by_id[ch_id]
            if 'sections' not in pool_ch:
                pool_ch['sections'] = {}
            
            for s in ch.get('sections', []):
                content = s.get('content', '').strip()
                if not content:
                    continue
                section_key = f"{ch_id}__{s['id']}"
                pool_ch['sections'][section_key] = {
                    "id": s['id'],
                    "title": s['title'],
                    "content": content
                }
                injected += 1
            
            print(f"  ✓ {ch_id}: {len(pool_ch['sections'])} sections")
        
        with open(pool_path, 'w', encoding='utf-8') as f:
            json.dump(pool, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ {injected} sections importées depuis {courses_path}")
    else:
        print()
        print("  Rien à faire. Le projet est autonome ! 🎉")


if __name__ == '__main__':
    main()
