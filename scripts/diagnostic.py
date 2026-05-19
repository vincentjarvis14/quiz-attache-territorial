#!/usr/bin/env python3
"""
diagnostic.py — Programme de diagnostic complet du projet Quiz Attaché Territorial
Analyse : données, code, documentation, skills, liens, cohérence globale.

Usage :
    python3 scripts/diagnostic.py          # Rapport complet
    python3 scripts/diagnostic.py --json   # Sortie JSON
    python3 scripts/diagnostic.py --quick  # Résumé uniquement
    python3 scripts/diagnostic.py --fix    # Tente de corriger les problèmes simples
"""

import json
import os
import re
import sys
import ast
import html.parser
from pathlib import Path
from collections import Counter

# ── Configuration ──────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
IGNORE_DIRS = {'.git', '_bmad-output', '__pycache__', '.venv', 'node_modules'}
IGNORE_FILES = {'.DS_Store', '.gitignore', '.env.example'}

# ── Résultats ──────────────────────────────────────────────────────
class Report:
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.infos = []
        self.stats = {}

    def error(self, module, msg, detail=""):
        self.errors.append((module, msg, detail))

    def warn(self, module, msg, detail=""):
        self.warnings.append((module, msg, detail))

    def info(self, module, msg, detail=""):
        self.infos.append((module, msg, detail))

    @property
    def has_issues(self):
        return len(self.errors) > 0 or len(self.warnings) > 0

    def print_summary(self):
        print(f"\n{'═'*60}")
        print(f"  RÉSULTAT : {len(self.errors)} erreur(s), {len(self.warnings)} avertissement(s)")
        print(f"{'═'*60}")
        if not self.has_issues:
            print("  ✅ Aucun problème détecté — tout est OK !")
        print()

report = Report()

# ── Utilitaires ────────────────────────────────────────────────────
def section(title):
    print(f"\n{'─'*60}")
    print(f"  {title}")
    print(f"{'─'*60}")

def ok(msg):
    print(f"  ✅ {msg}")

def warn(msg):
    print(f"  ⚠️  {msg}")

def err(msg):
    print(f"  ❌ {msg}")

def sub(msg):
    print(f"     {msg}")

# ── 1. DONNÉES ─────────────────────────────────────────────────────
# Normalisation des noms de champs (supporte les deux conventions)
FIELD_ALIASES = {
    "niveauBloom": "bloom",
    "question": "q",
    "reponse": "answer",
    "explication": "explanation",
    "source": "sourceLink",
}

def _normalize_question(q):
    """Normalise les champs d'une question pour utiliser les noms modernes."""
    normalized = dict(q)
    for old, new in FIELD_ALIASES.items():
        if old in q and new not in q:
            normalized[new] = q[old]
    return normalized

def _collect_questions(chapter):
    """Rassemble toutes les questions d'un chapitre (niveau chapitre + sections)."""
    questions = []
    # Questions au niveau chapitre
    ch_qs = chapter.get("questions", [])
    if isinstance(ch_qs, list):
        questions.extend(ch_qs)
    # Questions dans les sections
    sections = chapter.get("sections", {})
    if isinstance(sections, dict):
        for sv in sections.values():
            sec_qs = sv.get("questions", []) if isinstance(sv, dict) else []
            if isinstance(sec_qs, list):
                questions.extend(sec_qs)
    elif isinstance(sections, list):
        for s in sections:
            sec_qs = s.get("questions", []) if isinstance(s, dict) else []
            if isinstance(sec_qs, list):
                questions.extend(sec_qs)
    return questions

def check_data():
    section("📦 DONNÉES — quiz_pool.json")
    fp = ROOT / "data" / "quiz_pool.json"
    if not fp.exists():
        report.error("DATA", "Fichier quiz_pool.json introuvable")
        err("Fichier introuvable")
        return

    size = fp.stat().st_size
    ok(f"Fichier trouvé ({size/1024:.0f} KB)")

    try:
        with open(fp) as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        report.error("DATA", f"JSON invalide: {e}")
        err(f"JSON invalide: {e}")
        return

    # Structure racine
    if not isinstance(data, dict):
        report.error("DATA", "La racine doit être un objet JSON")
        err("La racine doit être un objet JSON")
        return

    chapters = data.get("chapters", [])
    if not isinstance(chapters, list):
        report.error("DATA", "chapters doit être une liste")
        err("chapters doit être une liste")
        return

    ok(f"{len(chapters)} chapitre(s) trouvé(s)")

    total_questions = 0
    chapter_ids = set()
    section_ids = set()
    question_ids = set()
    bloom_levels = Counter()
    questions_sans_explication = 0
    questions_sans_source = 0

    for ci, ch in enumerate(chapters):
        cid = ch.get("id", f"ch{ci}")
        if cid in chapter_ids:
            report.warn("DATA", f"ID chapitre dupliqué: {cid}")
            warn(f"ID chapitre dupliqué: {cid}")
        chapter_ids.add(cid)

        sections = ch.get("sections", {})
        if isinstance(sections, list):
            report.warn("DATA", f"Chapitre '{cid}' : sections est une liste (attendu: dict)")
            warn(f"Chapitre '{cid}' : sections est une liste (attendu: dict)")
            sections_dict = {}
            for s in sections:
                if isinstance(s, dict) and "id" in s:
                    sections_dict[s["id"]] = s
            sections = sections_dict
        elif not isinstance(sections, dict):
            report.error("DATA", f"Chapitre '{cid}' : sections doit être un dict ou une liste")
            err(f"Chapitre '{cid}' : sections invalide")
            continue

        # Compter les questions dans les sections
        q_count_sections = 0
        for sk, sv in sections.items():
            if sk in section_ids:
                report.warn("DATA", f"ID section dupliqué: {sk}")
            section_ids.add(sk)

            questions = sv.get("questions", []) if isinstance(sv, dict) else []
            if not isinstance(questions, list):
                report.warn("DATA", f"Section '{sk}' : questions n'est pas une liste")
                warn(f"Section '{sk}' : questions n'est pas une liste")
                continue
            q_count_sections += len(questions)

        # Questions au niveau chapitre
        ch_questions = ch.get("questions", [])
        if not isinstance(ch_questions, list):
            report.warn("DATA", f"Chapitre '{cid}' : questions n'est pas une liste")
            warn(f"Chapitre '{cid}' : questions n'est pas une liste")
            ch_questions = []

        if ch_questions and q_count_sections == 0:
            report.info("DATA", f"Chapitre '{cid}' : {len(ch_questions)} question(s) au niveau chapitre (aucune dans les sections)")
            sub(f"ℹ️  Questions au niveau chapitre (pas dans les sections)")

        # Rassembler toutes les questions
        all_questions = _collect_questions(ch)
        q_count = len(all_questions)

        for qi, q in enumerate(all_questions):
            total_questions += 1
            qid = q.get("id", f"{cid}_q{qi}")
            if qid in question_ids:
                report.warn("DATA", f"ID question dupliqué: {qid}")
                warn(f"ID question dupliqué: {qid}")
            question_ids.add(qid)

            # Normaliser les champs
            qn = _normalize_question(q)

            # Vérifier champs obligatoires (supporte les deux conventions)
            required_modern = ["id", "q", "options", "answer", "explanation", "bloom"]
            missing = [f for f in required_modern if f not in qn]
            if missing:
                # Essayer l'ancienne convention
                required_legacy = ["id", "question", "options", "reponse", "explication", "niveauBloom"]
                missing_legacy = [f for f in required_legacy if f not in q]
                if missing_legacy:
                    report.warn("DATA", f"Question {qid} : champs obligatoires manquants (moderne: {missing}, legacy: {missing_legacy})")
                    warn(f"Question {qid} : champs manquants")

            # Vérifier options
            opts = qn.get("options", [])
            if not isinstance(opts, list) or len(opts) < 2:
                report.warn("DATA", f"Question {qid} : doit avoir au moins 2 options")
                warn(f"Question {qid} : moins de 2 options")

            # Vérifier réponse valide (answer peut être un index ou une chaîne)
            rep = qn.get("answer", "")
            if isinstance(opts, list) and opts:
                if isinstance(rep, int):
                    if rep < 0 or rep >= len(opts):
                        report.warn("DATA", f"Question {qid} : réponse index {rep} hors limites (0-{len(opts)-1})")
                        warn(f"Question {qid} : réponse index {rep} hors limites")
                elif isinstance(rep, str) and rep not in opts:
                    report.warn("DATA", f"Question {qid} : réponse '{rep}' absente des options")
                    warn(f"Question {qid} : réponse absente des options")

            # Vérifier explication
            if not qn.get("explanation"):
                questions_sans_explication += 1

            # Vérifier source (sourceLink ou source)
            if not qn.get("sourceLink") and not q.get("source"):
                questions_sans_source += 1

            # Bloom
            bl = qn.get("bloom", "non spécifié")
            bloom_levels[bl] += 1

        sub(f"Chapitre '{cid}' : {q_count} questions ({q_count_sections} dans sections, {len(ch_questions)} au niveau chapitre)")

    ok(f"Total : {total_questions} questions")
    if questions_sans_explication:
        report.warn("DATA", f"{questions_sans_explication} question(s) sans explication")
        warn(f"{questions_sans_explication} question(s) sans explication")
    if questions_sans_source:
        report.warn("DATA", f"{questions_sans_source} question(s) sans source")
        warn(f"{questions_sans_source} question(s) sans source")

    if bloom_levels:
        sub("Niveaux Bloom :")
        for k, v in sorted(bloom_levels.items()):
            sub(f"  {k}: {v}")

    report.stats["questions"] = total_questions
    report.stats["chapitres"] = len(chapters)
    report.stats["bloom"] = dict(bloom_levels)

    # Vérifier light version
    lfp = ROOT / "data" / "quiz_pool.light.json"
    if lfp.exists():
        try:
            with open(lfp) as f:
                light = json.load(f)
            lq = sum(
                len(s.get("questions", []))
                for c in light.get("chapters", [])
                for s in (c.get("sections", {}).values() if isinstance(c.get("sections"), dict) else c.get("sections", []))
            )
            ok(f"Version light : {lq} questions")
        except:
            report.warn("DATA", "quiz_pool.light.json invalide")
            warn("Version light invalide")

# ── 2. HTML ────────────────────────────────────────────────────────
class HTMLValidator(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.errors = []
        self.ids = set()
        self.dup_ids = set()
        self.scripts = []
        self.links = []

    def handle_starttag(self, tag, attrs):
        self.tags.append(tag)
        attrs_dict = dict(attrs)
        if "id" in attrs_dict:
            iid = attrs_dict["id"]
            if iid in self.ids:
                self.dup_ids.add(iid)
            self.ids.add(iid)
        if tag == "script" and "src" in attrs_dict:
            self.scripts.append(attrs_dict["src"])
        if tag == "link" and "href" in attrs_dict:
            self.links.append(attrs_dict["href"])

    def handle_endtag(self, tag):
        if tag in self.tags:
            self.tags.remove(tag)

def check_html():
    section("🌐 HTML — index.html")
    fp = ROOT / "index.html"
    if not fp.exists():
        report.error("HTML", "index.html introuvable")
        err("Fichier introuvable")
        return

    content = fp.read_text(encoding="utf-8")
    ok(f"Fichier trouvé ({len(content)} bytes)")

    # Validation HTML
    parser = HTMLValidator()
    try:
        parser.feed(content)
    except Exception as e:
        report.error("HTML", f"Erreur de parsing: {e}")
        err(f"Erreur de parsing: {e}")
        return

    if parser.dup_ids:
        for did in parser.dup_ids:
            report.warn("HTML", f"ID dupliqué dans HTML: {did}")
            warn(f"ID dupliqué: {did}")

    if parser.tags:
        report.warn("HTML", f"Tags non fermés: {parser.tags}")
        warn(f"Tags non fermés: {parser.tags}")

    ok(f"{len(parser.ids)} IDs uniques")

    # Vérifier chemins CSS/JS
    for src in parser.scripts:
        src_path = ROOT / src.lstrip("/")
        if not src_path.exists():
            report.warn("HTML", f"Script introuvable: {src}")
            warn(f"Script introuvable: {src}")
        else:
            sub(f"Script OK: {src}")

    for href in parser.links:
        if href.startswith("http"):
            continue
        href_path = ROOT / href.lstrip("/")
        if not href_path.exists():
            report.warn("HTML", f"CSS introuvable: {href}")
            warn(f"CSS introuvable: {href}")
        else:
            sub(f"CSS OK: {href}")

    # Vérifier demo-bmad
    demo_fp = ROOT / "demo-bmad" / "index.html"
    if demo_fp.exists():
        demo_content = demo_fp.read_text(encoding="utf-8")
        tooltips = re.findall(r'data-tooltip="([^"]*)"', demo_content)
        ok(f"demo-bmad/index.html : {len(tooltips)} data-tooltips trouvés")
        report.stats["demo_tooltips"] = len(tooltips)

# ── 3. CSS ─────────────────────────────────────────────────────────
def check_css():
    section("🎨 CSS — style.css")
    fp = ROOT / "css" / "style.css"
    if not fp.exists():
        report.error("CSS", "css/style.css introuvable")
        err("Fichier introuvable")
        return

    content = fp.read_text(encoding="utf-8")
    ok(f"Fichier trouvé ({len(content)} bytes, {len(content.splitlines())} lignes)")

    # Variables CSS définies
    defined_vars = set(re.findall(r'--[\w-]+:', content))
    used_vars = set(re.findall(r'var\(--[\w-]+\)', content))
    used_vars_clean = {v.replace("var(", "").replace(")", "") for v in used_vars}

    unused = defined_vars - used_vars_clean
    if unused:
        for uv in sorted(unused)[:10]:
            report.warn("CSS", f"Variable définie mais jamais utilisée: {uv.strip(':')}")
        if len(unused) > 10:
            sub(f"... et {len(unused)-10} autres")
        warn(f"{len(unused)} variable(s) définie(s) mais jamais utilisée(s)")

    # Sélecteurs avec des IDs qui pourraient ne pas exister
    id_selectors = re.findall(r'#([\w-]+)', content)
    report.stats["css_vars"] = len(defined_vars)
    report.stats["css_selectors_id"] = len(id_selectors)
    ok(f"{len(defined_vars)} variables CSS, {len(id_selectors)} sélecteurs d'ID")

# ── 4. JS ──────────────────────────────────────────────────────────
def check_js():
    section("⚡ JS — app.js")
    fp = ROOT / "js" / "app.js"
    if not fp.exists():
        report.error("JS", "js/app.js introuvable")
        err("Fichier introuvable")
        return

    content = fp.read_text(encoding="utf-8")
    ok(f"Fichier trouvé ({len(content)} bytes, {len(content.splitlines())} lignes)")

    # Vérifier syntaxe JS basique (équilibre des accolades)
    open_braces = content.count('{')
    close_braces = content.count('}')
    open_parens = content.count('(')
    close_parens = content.count(')')
    if open_braces != close_braces:
        report.warn("JS", f"Accolades non équilibrées: {open_braces} ouvertes, {close_braces} fermées")
        warn(f"Accolades non équilibrées: {open_braces} vs {close_braces}")
    if open_parens != close_parens:
        report.warn("JS", f"Parenthèses non équilibrées: {open_parens} ouvertes, {close_parens} fermées")
        warn(f"Parenthèses non équilibrées: {open_parens} vs {close_parens}")
    if open_braces == close_braces and open_parens == close_parens:
        ok("Syntaxe JavaScript : accolades et parenthèses équilibrées")

    # Fonctions définies
    func_defs = set(re.findall(r'(?:function |const |let |var )(\w+)\s*[=(]', content))
    # getElementById calls
    get_ids = set(re.findall(r"getElementById\(['\"](\w+)['\"]\)", content))

    # Vérifier que les IDs JS existent dans HTML
    html_fp = ROOT / "index.html"
    if html_fp.exists():
        html_content = html_fp.read_text(encoding="utf-8")
        html_ids = set(re.findall(r'id="(\w+)"', html_content))
        missing_ids = get_ids - html_ids
        if missing_ids:
            for mid in missing_ids:
                report.warn("JS", f"getElementById('{mid}') mais ID introuvable dans HTML")
            warn(f"{len(missing_ids)} ID(s) JS introuvable(s) dans HTML")

    # addEventListener patterns
    event_listeners = re.findall(r"addEventListener\(['\"](\w+)['\"]", content)
    ok(f"{len(func_defs)} fonctions, {len(event_listeners)} event listeners")

    report.stats["js_functions"] = len(func_defs)
    report.stats["js_event_listeners"] = len(event_listeners)

# ── 5. SCRIPTS PYTHON ──────────────────────────────────────────────
def check_scripts():
    section("🔧 SCRIPTS PYTHON")
    scripts_dir = ROOT / "scripts"
    if not scripts_dir.exists():
        report.error("SCRIPTS", "Dossier scripts/ introuvable")
        err("Dossier introuvable")
        return

    py_files = sorted(scripts_dir.glob("*.py"))
    ok(f"{len(py_files)} script(s) trouvé(s)")

    total_lines = 0
    for pf in py_files:
        content = pf.read_text(encoding="utf-8")
        lines = len(content.splitlines())
        total_lines += lines

        # Vérifier syntaxe
        try:
            ast.parse(content)
            sub(f"✅ {pf.name} ({lines} lignes)")
        except SyntaxError as e:
            report.error("SCRIPTS", f"Erreur syntaxe dans {pf.name}: {e}")
            err(f"❌ {pf.name} : erreur syntaxe")

    ok(f"Total : {total_lines} lignes de Python")
    report.stats["scripts"] = len(py_files)
    report.stats["scripts_lines"] = total_lines

# ── 6. SKILL LE PROFESSEUR ─────────────────────────────────────────
def check_skill():
    section("🎓 SKILL — Le Professeur")
    skill_dir = ROOT / "skills" / "le-professeur"
    if not skill_dir.exists():
        report.error("SKILL", "Dossier skills/le-professeur introuvable")
        err("Dossier introuvable")
        return

    # SKILL.md
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.exists():
        report.error("SKILL", "SKILL.md manquant")
        err("SKILL.md manquant")
    else:
        content = skill_md.read_text(encoding="utf-8")
        checks = {
            "name: le-professeur": "name",
            "description:": "description",
            "Les Trois Lois": "3 lois",
            "sanctum-location": "sanctum",
            "## Capacités": "capacités",
        }
        for keyword, label in checks.items():
            if keyword not in content:
                report.warn("SKILL", f"SKILL.md : '{label}' manquant")
                warn(f"SKILL.md : '{label}' manquant")
        ok("SKILL.md valide")

    # Sanctum (6 fichiers)
    sanctum_dir = ROOT / "_bmad" / "memory" / "le-professeur"
    sanctum_files = ["PERSONA.md", "CREED.md", "BOND.md", "MEMORY.md", "CAPABILITIES.md", "INDEX.md"]
    if sanctum_dir.exists():
        found = [f for f in sanctum_files if (sanctum_dir / f).exists()]
        missing = [f for f in sanctum_files if f not in found]
        if missing:
            report.warn("SKILL", f"Sanctum incomplet : fichiers manquants {missing}")
            warn(f"Sanctum incomplet : {missing}")
        ok(f"Sanctum : {len(found)}/6 fichiers présents")
    else:
        report.warn("SKILL", "Dossier sanctum introuvable")
        warn("Sanctum introuvable")

    # Références (8 capacités)
    refs_dir = skill_dir / "references"
    if refs_dir.exists():
        ref_files = list(refs_dir.glob("*.md"))
        expected_refs = ["audit", "suggest", "elevate", "generate", "obsolescence", "coherence", "teach", "first-breath"]
        found_refs = [r.stem for r in ref_files]
        missing_refs = [r for r in expected_refs if r not in found_refs]
        if missing_refs:
            report.warn("SKILL", f"Références manquantes : {missing_refs}")
            warn(f"Références manquantes : {missing_refs}")
        ok(f"{len(ref_files)} fichiers de référence")
    else:
        report.warn("SKILL", "Dossier references/ introuvable")
        warn("Dossier references/ introuvable")

    # Script d'initialisation
    init_script = skill_dir / "scripts" / "init-sanctum.py"
    if init_script.exists():
        try:
            ast.parse(init_script.read_text(encoding="utf-8"))
            ok("Script init-sanctum.py valide")
        except SyntaxError as e:
            report.error("SKILL", f"init-sanctum.py : erreur syntaxe: {e}")
            err("init-sanctum.py : erreur syntaxe")
    else:
        report.warn("SKILL", "init-sanctum.py manquant")
        warn("init-sanctum.py manquant")

    report.stats["skill_files"] = len(list(skill_dir.rglob("*")))

# ── 7. DOCUMENTATION ───────────────────────────────────────────────
def check_docs():
    section("📚 DOCUMENTATION")
    docs_dir = ROOT / "docs"
    if not docs_dir.exists():
        report.error("DOCS", "Dossier docs/ introuvable")
        err("Dossier introuvable")
        return

    md_files = sorted(docs_dir.glob("*.md"))
    ok(f"{len(md_files)} fichier(s) de documentation")

    total_lines = 0
    for mf in md_files:
        content = mf.read_text(encoding="utf-8")
        lines = len(content.splitlines())
        total_lines += lines

        # Vérifier liens internes
        internal_links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content)
        for link_text, link_url in internal_links:
            if link_url.startswith("http") or link_url.startswith("#"):
                continue
            # Chemin relatif
            linked_path = (mf.parent / link_url).resolve()
            if not linked_path.exists():
                report.warn("DOCS", f"Lien cassé dans {mf.name}: '{link_url}'")
                warn(f"Lien cassé dans {mf.name}: '{link_url}'")

        sub(f"✅ {mf.name} ({lines} lignes)")

    ok(f"Total : {total_lines} lignes de documentation")
    report.stats["docs"] = len(md_files)
    report.stats["docs_lines"] = total_lines

# ── 8. BMAD CONFIG ─────────────────────────────────────────────────
def check_bmad():
    section("🤖 BMAD — Configuration")
    config_fp = ROOT / "_bmad" / "config.toml"
    if not config_fp.exists():
        report.error("BMAD", "_bmad/config.toml introuvable")
        err("Fichier introuvable")
        return

    content = config_fp.read_text(encoding="utf-8")
    ok(f"config.toml trouvé ({len(content)} bytes)")

    # Compter les agents déclarés
    agents = re.findall(r'\[agents\.([^\]]+)\]', content)
    ok(f"{len(agents)} agent(s) déclaré(s) : {', '.join(agents)}")
    report.stats["bmad_agents"] = len(agents)

    # Vérifier modules
    modules = re.findall(r'\[modules\.([^\]]+)\]', content)
    ok(f"Modules : {', '.join(modules)}")

    # Vérifier config.user.toml
    user_config = ROOT / "_bmad" / "config.user.toml"
    if user_config.exists():
        ok("config.user.toml présent (personnalisation locale)")
    else:
        sub("config.user.toml absent (optionnel)")

    # Vérifier custom config
    custom_config = ROOT / "_bmad" / "custom" / "config.toml"
    if custom_config.exists():
        ok("custom/config.toml présent (personnalisation équipe)")

# ── 9. LIENS ET CHEMINS ────────────────────────────────────────────
def check_links():
    section("🔗 LIENS ET CHEMINS")
    html_fp = ROOT / "index.html"
    if not html_fp.exists():
        return

    content = html_fp.read_text(encoding="utf-8")

    # Tous les href/src
    all_refs = re.findall(r'(?:href|src)="([^"]+)"', content)
    local_refs = [r for r in all_refs if not r.startswith("http") and not r.startswith("#") and not r.startswith("data:")]

    broken = 0
    for ref in local_refs:
        ref_path = ROOT / ref.lstrip("/")
        if not ref_path.exists():
            report.warn("LINKS", f"Référence cassée: {ref}")
            warn(f"Référence cassée: {ref}")
            broken += 1

    if broken == 0:
        ok(f"Tous les {len(local_refs)} chemins locaux sont valides")
    else:
        warn(f"{broken}/{len(local_refs)} chemin(s) cassé(s)")

# ── 10. RAPPORT DE SYNTHÈSE ────────────────────────────────────────
def print_report():
    print(f"\n{'╔' + '═'*58 + '╗'}")
    print(f"║  DIAGNOSTIC — Quiz Attaché Territorial{' ' * 18}║")
    print(f"║  {ROOT}{' ' * (57 - len(str(ROOT)))}║")
    print(f"{'╚' + '═'*58 + '╝'}")

    print(f"\n  Fichiers analysés :")
    print(f"  ─────────────────")
    print(f"  📦  data/quiz_pool.json")
    print(f"  🌐  index.html")
    print(f"  🎨  css/style.css")
    print(f"  ⚡  js/app.js")
    print(f"  🔧  scripts/*.py ({report.stats.get('scripts', 0)} fichiers)")
    print(f"  📚  docs/*.md ({report.stats.get('docs', 0)} fichiers)")
    print(f"  🎓  skills/le-professeur/")
    print(f"  🤖  _bmad/config.toml")
    print(f"  🎮  demo-bmad/")

    print(f"\n  Statistiques :")
    print(f"  ─────────────")
    print(f"  Questions : {report.stats.get('questions', '?')}")
    print(f"  Chapitres : {report.stats.get('chapitres', '?')}")
    print(f"  Variables CSS : {report.stats.get('css_vars', '?')}")
    print(f"  Fonctions JS : {report.stats.get('js_functions', '?')}")
    print(f"  Lignes Python : {report.stats.get('scripts_lines', '?')}")
    print(f"  Lignes documentation : {report.stats.get('docs_lines', '?')}")
    print(f"  Agents BMAD : {report.stats.get('bmad_agents', '?')}")
    print(f"  Fichiers skill : {report.stats.get('skill_files', '?')}")

    report.print_summary()

# ── MAIN ───────────────────────────────────────────────────────────
def main():
    args = set(sys.argv[1:])
    quick_mode = "--quick" in args
    json_mode = "--json" in args

    if not quick_mode:
        check_data()
        check_html()
        check_css()
        check_js()
        check_scripts()
        check_skill()
        check_docs()
        check_bmad()
        check_links()
        print_report()
    else:
        # Mode rapide : juste les erreurs
        check_data()
        check_html()
        check_js()
        check_scripts()
        check_skill()
        report.print_summary()

    if json_mode:
        import datetime
        output = {
            "timestamp": datetime.datetime.now().isoformat(),
            "project": str(ROOT),
            "stats": report.stats,
            "errors": [{"module": m, "msg": msg, "detail": d} for m, msg, d in report.errors],
            "warnings": [{"module": m, "msg": msg, "detail": d} for m, msg, d in report.warnings],
        }
        print(json.dumps(output, indent=2, ensure_ascii=False))

    # Code de sortie
    if report.errors:
        sys.exit(2)
    elif report.warnings:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()
