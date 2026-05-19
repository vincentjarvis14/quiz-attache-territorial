#!/usr/bin/env python3
"""
init-sanctum.py — Initialise le sanctum pour Le Professeur.

Usage:
    uv run ./scripts/init-sanctum.py <project-root> <skill-path>

Crée la structure de mémoire dans {project-root}/_bmad/memory/le-professeur/
en copiant les templates depuis ./assets/.
"""

import sys
import os
import shutil
from pathlib import Path

SKILL_NAME = "le-professeur"

TEMPLATE_FILES = [
    "INDEX-template.md",
    "PERSONA-template.md",
    "CREED-template.md",
    "BOND-template.md",
    "MEMORY-template.md",
    "CAPABILITIES-template.md",
]

SANCTUM_FILES = [
    "INDEX.md",
    "PERSONA.md",
    "CREED.md",
    "BOND.md",
    "MEMORY.md",
    "CAPABILITIES.md",
]

EVOLVABLE = True


def main():
    if len(sys.argv) < 3:
        print("Usage: uv run ./scripts/init-sanctum.py <project-root> <skill-path>")
        sys.exit(1)

    project_root = Path(sys.argv[1]).resolve()
    skill_path = Path(sys.argv[2]).resolve()
    sanctum_path = project_root / "_bmad" / "memory" / SKILL_NAME

    # Créer le dossier sanctum
    sanctum_path.mkdir(parents=True, exist_ok=True)

    # Copier les templates
    assets_path = skill_path / "assets"
    for template_name, sanctum_name in zip(TEMPLATE_FILES, SANCTUM_FILES):
        template_path = assets_path / template_name
        sanctum_file = sanctum_path / sanctum_name

        if not template_path.exists():
            print(f"⚠ Template manquant : {template_path}")
            continue

        if sanctum_file.exists():
            print(f"⏩ Déjà existant : {sanctum_name}")
            continue

        shutil.copy2(template_path, sanctum_file)
        print(f"✓ Créé : {sanctum_name}")

    # Copier first-breath.md dans references si pas déjà fait
    first_breath_src = skill_path / "references" / "first-breath.md"
    first_breath_dst = sanctum_path / "first-breath.md"

    if first_breath_src.exists() and not first_breath_dst.exists():
        shutil.copy2(first_breath_src, first_breath_dst)
        print("✓ Créé : first-breath.md")

    print(f"\n✅ Sanctum initialisé dans : {sanctum_path}")
    print(f"   {len(SANCTUM_FILES)} fichiers créés")
    if EVOLVABLE:
        print("   📚 Mode évolutif activé — l'utilisateur peut ajouter des critères")


if __name__ == "__main__":
    main()
