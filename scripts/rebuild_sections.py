#!/usr/bin/env python3
"""
rebuild_sections.py
===================
Reconstruit les sections manquantes dans quiz_pool.json à partir des
sourceText des questions existantes.

Problème : les chapitres env2 à env8 et urb1 n'ont pas de sections dans
quiz_pool.json. Les questions ont sectionId = "envX__synthese" (fallback).
La modale source (openSourceModal) ne peut donc pas afficher le contexte.

Solution : regrouper les sourceText par similarité thématique pour créer
des sections cohérentes, puis injecter ces sections dans le pool.

Usage :
    python3 scripts/rebuild_sections.py              # Reconstruit et sauvegarde
    python3 scripts/rebuild_sections.py --dry-run    # Aperçu sans écrire
    python3 scripts/rebuild_sections.py --backup     # Sauvegarde avant modification
"""

import json
import re
import sys
import os
import shutil
from datetime import datetime
from collections import defaultdict
from pathlib import Path


DATA_DIR = Path("data")
POOL_PATH = DATA_DIR / "quiz_pool.json"
BACKUP_DIR = DATA_DIR / "backups"


def load_pool():
    with open(POOL_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_pool(pool):
    with open(POOL_PATH, "w", encoding="utf-8") as f:
        json.dump(pool, f, ensure_ascii=False, indent=2)
    print(f"  ✅ Pool sauvegardé: {POOL_PATH}")


def backup_pool():
    """Crée une sauvegarde du pool avant modification."""
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = BACKUP_DIR / f"quiz_pool_backup_{timestamp}.json"
    shutil.copy2(POOL_PATH, backup_path)
    print(f"  💾 Backup créé: {backup_path}")
    return backup_path


def extract_thematic_groups(source_texts):
    """
    Regroupe les sourceText par similarité thématique.
    Utilise des mots-clés pour détecter les thèmes.
    Retourne une liste de (theme, [texts]) tuples.
    """
    # Thèmes prédéfinis par chapitre (détectés par mots-clés)
    # Ordre d'importance : les thèmes les plus spécifiques en premier
    theme_keywords = [
        ("urbanisme", ["urbanisme", "PLU", "PADD", "permis de construire", "construction", "zonage", "littoral", "loi littoral", "schéma de cohérence", "SCOT"]),
        ("marché", ["marché public", "commande publique", "appel d'offres", "procédure adaptée", "attribution", "offre", "acheteur"]),
        ("budget", ["budget", "finances", "fiscal", "impôt", "dépense", "recette", "section de fonctionnement", "section d'investissement", "compte administratif", "budget primitif"]),
        ("fonction publique", ["fonctionnaire", "concours", "grade", "cadre d'emplois", "statut", "carrière", "détachement", "disponibilité", "position", "CSFPT"]),
        ("ressources humaines", ["entretien professionnel", "évaluation", "appréciation", "formation", "recrutement", "compétence", "fiche de poste", "entretien", "compte rendu"]),
        ("management", ["management", "délégation", "projet", "organisation", "manager", "leadership", "commanditaire", "décision"]),
        ("élection", ["élection", "scrutin", "suffrage", "vote", "candidat", "conseiller municipal", "maire", "adjoint", "tour de scrutin"]),
        ("domaine public", ["domaine public", "propriété", "personne publique", "bien public"]),
        ("police administrative", ["police administrative", "ordre public", "préventif", "sécurité", "tranquillité"]),
        ("service public", ["service public", "intérêt général", "usager", "SPA", "SPIC"]),
        ("contrôle", ["contrôle de légalité", "tutelle", "préfet", "représentant de l'état", "déféré", "légalité"]),
        ("contentieux", ["recours", "contentieux", "tribunal", "juge", "contestation", "gracieux"]),
        ("décentralisation", ["décentralisation", "déconcentration", "collectivité territoriale", "compétence", "libre administration"]),
        ("intercommunalité", ["intercommunalité", "EPCI", "communauté de communes", "communauté urbaine", "syndicat", "métropole"]),
    ]

    groups = defaultdict(list)
    ungrouped = []

    for text in source_texts:
        text_lower = text.lower()
        matched = False
        for theme, keywords in theme_keywords:
            for kw in keywords:
                if kw in text_lower:
                    groups[theme].append(text)
                    matched = True
                    break
            if matched:
                break
        if not matched:
            ungrouped.append(text)

    # Ajouter les non-classés comme groupe "divers"
    if ungrouped:
        groups["divers"] = ungrouped

    # Filtrer les groupes trop petits (moins de 2 textes) et les fusionner dans "divers"
    merged_divers = list(ungrouped)
    small_groups = []
    for theme, texts in list(groups.items()):
        if theme != "divers" and len(texts) < 2:
            merged_divers.extend(texts)
            small_groups.append(theme)
    for theme in small_groups:
        del groups[theme]
    
    if merged_divers:
        groups["divers"] = merged_divers

    return dict(groups)


def build_sections_for_chapter(chapter):
    """
    Construit des sections pour un chapitre à partir des sourceText de ses questions.
    Retourne un dict {section_id: section_data}.
    """
    questions = chapter.get("questions", [])
    if not questions:
        return {}

    # Extraire tous les sourceText uniques
    source_texts = []
    for q in questions:
        st = q.get("sourceText", "").strip()
        if st and len(st) > 30:
            source_texts.append(st)

    if not source_texts:
        return {}

    # Dédupliquer
    seen = set()
    unique_texts = []
    for st in source_texts:
        if st not in seen:
            seen.add(st)
            unique_texts.append(st)

    # Regrouper par thème
    groups = extract_thematic_groups(unique_texts)

    sections = {}
    for theme, texts in groups.items():
        section_id = f"{chapter['id']}__{theme}"
        # Titre lisible
        title_map = {
            "élection": "Élections et scrutin",
            "budget": "Budget et finances",
            "marché": "Marchés publics et commande publique",
            "fonction publique": "Fonction publique territoriale",
            "ressources humaines": "Gestion des ressources humaines",
            "management": "Management et organisation",
            "urbanisme": "Politiques d'urbanisme",
            "domaine public": "Domaine public",
            "police administrative": "Police administrative",
            "service public": "Service public",
            "contrôle": "Contrôle et tutelle",
            "contentieux": "Contentieux et recours",
            "décentralisation": "Décentralisation et déconcentration",
            "intercommunalité": "Intercommunalité",
            "divers": "Synthèse",
        }
        title = title_map.get(theme, f"Synthèse - {theme.capitalize()}")

        # Concaténer les textes avec des séparateurs
        content = "\n\n".join(texts)

        sections[section_id] = {
            "id": section_id,
            "title": title,
            "content": content,
        }

    return sections


def update_question_section_ids(chapter, sections):
    """
    Met à jour les sectionId des questions pour pointer vers les bonnes sections.
    Pour chaque question, trouve la section dont le contenu contient le sourceText.
    """
    questions = chapter.get("questions", [])
    if not sections:
        return

    for q in questions:
        st = q.get("sourceText", "").strip()
        if not st or len(st) < 20:
            continue

        # Chercher la section qui contient ce sourceText
        best_section = None
        best_len = 0
        for sid, sdata in sections.items():
            if st in sdata["content"]:
                # Prendre la section avec le contenu le plus long (la plus spécifique)
                if len(sdata["content"]) > best_len:
                    best_section = sid
                    best_len = len(sdata["content"])

        if best_section:
            q["sectionId"] = best_section
            q["sourceLink"] = f"#section-{best_section}"
            q["sectionTitle"] = sections[best_section]["title"]


def main():
    dry_run = "--dry-run" in sys.argv
    do_backup = "--backup" in sys.argv

    print("🔧 Rebuild Sections — Reconstruction des sections manquantes")
    print(f"   Pool: {POOL_PATH}")
    if dry_run:
        print("   Mode: DRY RUN (aucune écriture)")
    if do_backup:
        print("   Mode: BACKUP avant modification")

    pool = load_pool()
    total_new_sections = 0
    total_updated_questions = 0

    for chapter in pool["chapters"]:
        existing_sections = chapter.get("sections", {})
        if existing_sections:
            print(f"\n📚 {chapter['id']}: {chapter['title']}")
            print(f"   ✅ {len(existing_sections)} sections existantes — ignoré")
            continue

        print(f"\n📚 {chapter['id']}: {chapter['title']} ({len(chapter.get('questions', []))} questions)")

        # Construire les sections
        sections = build_sections_for_chapter(chapter)
        if not sections:
            print(f"   ⚠ Impossible de construire des sections (pas de sourceText)")
            continue

        print(f"   📝 {len(sections)} sections créées:")
        for sid, sdata in sections.items():
            print(f"      - {sdata['title']} ({len(sdata['content'])} chars)")

        if not dry_run:
            # Injecter les sections
            chapter["sections"] = sections

            # Mettre à jour les sectionId des questions
            update_question_section_ids(chapter, sections)
            updated = sum(1 for q in chapter.get("questions", []) if q.get("sectionId", "").endswith("__synthese") == False or q.get("sectionId", "") != f"{chapter['id']}__synthese")
            print(f"   🔗 {updated} questions mises à jour avec le bon sectionId")

            total_new_sections += len(sections)
            total_updated_questions += updated

    if not dry_run:
        if do_backup:
            backup_pool()
        save_pool(pool)
        print(f"\n{'='*60}")
        print(f"🎉 Reconstruction terminée !")
        print(f"   Nouvelles sections créées: {total_new_sections}")
        print(f"   Questions mises à jour: {total_updated_questions}")
        print(f"{'='*60}")
    else:
        print(f"\n{'='*60}")
        print(f"🔍 DRY RUN terminé — aucune modification")
        print(f"{'='*60}")


if __name__ == "__main__":
    main()
