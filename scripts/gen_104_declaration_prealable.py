#!/usr/bin/env python3
"""
Génère data/generated_104-declaration-prealable.json.
Les sourceText sont des passages CONTIGUS copiés de la section normalisée.
Le modèle (humain ici) rédige q/options/answer/explanation/bloom/keywords.
"""
import json
import re
import sys

SECTIONS_FILE = "data/sections_urbanisme.json"
OUT_FILE = "data/generated_104-declaration-prealable.json"
PREFIX = "104-declaration-prealable__"


def norm(s):
    return re.sub(r"\s+", " ", s or "").strip()


def _apos(s):
    """Normalise apostrophes/guillemets/tirets typographiques (comme le validateur)."""
    s = s or ""
    for a, b in [("’", "'"), ("‘", "'"), ("“", '"'),
                 ("”", '"'), (" ", " "), ("–", "-"), ("—", "-")]:
        s = s.replace(a, b)
    return s


def load_norm_sections():
    secs = json.load(open(SECTIONS_FILE, encoding="utf-8"))["sections"]
    return {k: norm(v["content"]) for k, v in secs.items() if k.startswith(PREFIX)}


def slice_src(content, anchor, n_sentences=1):
    """Retourne un passage contigu de `content` commençant à `anchor`
    et couvrant `n_sentences` phrases (coupe à la Nième occurrence de '. ').
    Le résultat finit par . ! ? » ou \"."""
    idx = content.find(anchor)
    if idx == -1:
        raise ValueError(f"ANCHOR introuvable: {anchor!r}")
    rest = content[idx:]
    # Trouver la fin de la Nième phrase.
    count = 0
    for m in re.finditer(r"[.!?»\"]", rest):
        end = m.end()
        # éviter de couper sur un '.' d'abréviation type "L. 421-4" : on exige
        # qu'après le point il y ait une espace + majuscule OU fin de chaîne.
        nxt = rest[end:end + 2]
        if rest[m.start()] == "." and nxt and not (nxt[0] == " " and (len(nxt) < 2 or nxt[1].isupper() or nxt[1].isdigit() is False)):
            # heuristique permissive ; on garde simple ci-dessous
            pass
        count += 1
        if count >= n_sentences:
            out = rest[:end].strip()
            return out
    out = rest.strip()
    return out


def find_end_at(content, anchor, end_marker):
    """Passage de `anchor` jusqu'à la fin de `end_marker` (inclus).
    Recherche en espace apostrophe-normalisé, renvoie le substring RÉEL du
    content normalisé (la comparaison du validateur normalise aussi les
    apostrophes, donc c'est sûr)."""
    cn = _apos(content)
    a = _apos(anchor)
    e = _apos(end_marker)
    i = cn.find(a)
    if i == -1:
        raise ValueError(f"ANCHOR introuvable: {anchor!r}")
    j = cn.find(e, i)
    if j == -1:
        raise ValueError(f"END introuvable: {end_marker!r}")
    return content[i:j + len(e)].strip()


def main():
    secs = load_norm_sections()
    questions = []
    counters = {}

    def add(sid, bloom, q, options, answer, explanation, src, keywords, context=None):
        c = secs[sid]
        if norm(src) not in c:
            print(f"!! sourceText absent ({sid}): {src[:60]}...", file=sys.stderr)
            sys.exit(2)
        counters[sid] = counters.get(sid, 0) + 1
        n = counters[sid]
        questions.append({
            "bloom": bloom,
            "q": q,
            "options": options,
            "answer": answer,
            "explanation": explanation,
            "id": f"urb__{sid}__opus_{n:03d}",
            "sectionTitle": json.load(open(SECTIONS_FILE, encoding="utf-8"))["sections"][sid].get("title", ""),
            "sourceLink": f"#section-{sid}",
            "sourceText": src,
            "sourceContext": context or src,
            "sectionId": sid,
            "keywords": keywords,
        })

    # cache des titres pour éviter de relire le fichier à chaque add
    titles = json.load(open(SECTIONS_FILE, encoding="utf-8"))["sections"]

    def src(sid, anchor, n=1):
        return slice_src(secs[sid], anchor, n)

    def srcend(sid, anchor, end):
        return find_end_at(secs[sid], anchor, end)

    # On redéfinit add pour utiliser les titres mis en cache (perf).
    questions.clear()
    counters.clear()

    def addq(sid, bloom, q, options, answer, explanation, source, keywords, context=None):
        c = secs[sid]
        if norm(source) not in c:
            print(f"!! sourceText absent ({sid}): {source[:80]}", file=sys.stderr)
            sys.exit(2)
        counters[sid] = counters.get(sid, 0) + 1
        n = counters[sid]
        questions.append({
            "bloom": bloom,
            "q": q,
            "options": options,
            "answer": answer,
            "explanation": explanation,
            "id": f"urb__{sid}__opus_{n:03d}",
            "sectionTitle": titles[sid].get("title", ""),
            "sourceLink": f"#section-{sid}",
            "sourceText": source,
            "sourceContext": context or source,
            "sectionId": sid,
            "keywords": keywords,
        })

    # =====================================================================
    # SECTION 1 — Le champ d'application de la déclaration préalable
    # =====================================================================
    S = "104-declaration-prealable__1"

    addq(S, "rappel",
         "De quel texte est issue la déclaration de travaux, ancêtre de la déclaration préalable ?",
         ["La loi du 6 janvier 1986", "Le décret du 5 janvier 2007",
          "L'article L. 421-4 du Code de l'urbanisme", "Le Code rural"],
         0,
         "Le texte précise que « La déclaration de travaux issue de la loi du 6 janvier 1986 a été transformée en une déclaration préalable ».",
         srcend(S, "La déclaration de travaux issue de la loi du 6 janvier 1986",
                "déclaration en cas de division de terrain non destiné à l’implantation de bâtiments."),
         ["déclaration de travaux", "loi 1986", "déclaration préalable"])

    addq(S, "comprehension",
         "La déclaration préalable s'est substituée à plusieurs anciens régimes déclaratifs. Lequel des ensembles suivants correspond à ces régimes ?",
         ["Deux régimes : déclaration de travaux et déclaration de clôture",
          "Trois régimes : déclaration de travaux, de clôture et de division foncière",
          "Quatre régimes : déclaration de travaux, de clôture, de division foncière non constitutive de lotissement et de division de terrain non destiné à l'implantation de bâtiments",
          "Cinq régimes incluant la demande de permis de construire"],
         2,
         "Le texte indique que la déclaration de travaux « a été transformée en une déclaration préalable substituée à quatre anciens régimes déclaratifs ».",
         srcend(S, "La déclaration de travaux issue de la loi du 6 janvier 1986",
                "déclaration en cas de division de terrain non destiné à l’implantation de bâtiments."),
         ["régimes déclaratifs", "substitution", "déclaration préalable"])

    addq(S, "comprehension",
         "Selon l'article L. 421-4 du Code de l'urbanisme, pour quelle raison certaines constructions ou travaux relèvent-ils d'une déclaration préalable plutôt que d'un permis ?",
         ["Parce qu'ils sont réalisés par une personne publique",
          "Parce que leurs dimensions, leur nature ou leur localisation ne justifient pas l'exigence d'un permis",
          "Parce qu'ils sont situés hors d'un secteur sauvegardé",
          "Parce qu'ils ont reçu l'accord préalable du maire"],
         1,
         "Le texte vise les opérations « qui, en raison de leurs dimensions, de leur nature ou de leur localisation, ne justifiant pas l'exigence d'un permis font l'objet d'une déclaration préalable ».",
         srcend(S, "En application de l’article L. 421-4 du Code de l’urbanisme",
                "ne justifiant pas l’exigence d’un permis font l’objet d’une déclaration préalable."),
         ["L. 421-4", "dimensions", "nature", "localisation"])

    addq(S, "analyse",
         "Le champ d'application de la déclaration préalable est divisé en trois domaines. Lequel ne correspond PAS à l'un de ces domaines ?",
         ["Les travaux, installations et aménagements",
          "Les constructions",
          "Les clôtures",
          "Les divisions foncières constitutives de lotissement"],
         3,
         "Le texte divise le champ d'application en trois domaines : les travaux/installations/aménagements, les constructions et les clôtures. Les divisions constitutives de lotissement n'y figurent pas.",
         srcend(S, "le champ d’application est divisé en trois domaines d’action",
                "et les clôtures soumises à déclaration préalable (1.3)."),
         ["champ d'application", "trois domaines", "clôtures"])

    addq(S, "comprehension",
         "Quel texte range, dans le champ de la déclaration préalable, plusieurs activités relatives à l'utilisation des sols ?",
         ["La loi du 6 janvier 1986", "Le décret du 5 janvier 2007",
          "L'article L. 421-4 du Code de l'urbanisme", "Le titre II du livre Ier du Code rural"],
         1,
         "Le texte indique que « Le décret du 5 janvier 2007 range dans le champ d'application de cette déclaration préalable plusieurs activités relatives à l'utilisation des sols ».",
         srcend(S, "Le décret du 5 janvier 2007 range dans le champ d’application",
                "plusieurs activités relatives à l’utilisation des sols."),
         ["décret 2007", "utilisation des sols", "champ d'application"])

    # =====================================================================
    # NOTE : la section 1_1_1 (régime général) est un dump PDF en liste à
    # puces SANS aucune ponctuation de fin de phrase (seuls points = "R."
    # et le numéro de titre). Aucun sourceText contigu ne peut s'y terminer
    # par . ! ? » " → toute question y est rejetée par le validateur. Section
    # volontairement écartée pour garantir l'ancrage à 100 %.
    # =====================================================================

    # =====================================================================
    # SECTION 1_1_2 — Localisation dans un secteur sauvegardé
    # =====================================================================
    S = "104-declaration-prealable__1_1_2"

    addq(S, "comprehension",
         "Dans un secteur sauvegardé délimité, les travaux modifiant l'aménagement des abords d'un bâtiment existant doivent être précédés d'une déclaration préalable, sauf exception. Quelle est cette exception ?",
         ["Les travaux d'entretien ou de réparations ordinaires",
          "Les travaux portant sur les ouvrages d'infrastructure",
          "Les travaux imposés par la sécurité",
          "Les travaux réalisés par la commune"],
         0,
         "Le texte soumet ces travaux à déclaration préalable « A l'exception des travaux d'entretien ou de réparations ordinaires ».",
         srcend(S, "A l’exception des travaux d’entretien ou de réparations ordinaires, les travaux ayant pour effet de modifier l’aménagement des abords",
                "doivent être précédés d’une déclaration préalable."),
         ["secteur sauvegardé", "abords", "entretien", "réparations ordinaires"])

    addq(S, "application",
         "Dans un secteur sauvegardé dont le périmètre est délimité, une construction créant une surface hors œuvre brute de quinze mètres carrés relève de quelle formalité ?",
         ["Aucune formalité", "Une déclaration préalable",
          "Un permis de construire", "Un permis d'aménager"],
         1,
         "Le texte soumet à déclaration préalable les constructions « ayant pour effet de créer une surface hors oeuvre brute inférieure ou égale à vingt mètres carrés, quelle que soit leur hauteur » : quinze m² y est inclus.",
         srcend(S, "doivent être précédées d'une déclaration préalable les constructions n'ayant pas pour effet de créer une surface hors œuvre brute",
                "ainsi que les murs, quelle que soit leur hauteur."),
         ["secteur sauvegardé", "SHOB", "vingt mètres carrés", "murs"])

    addq(S, "analyse",
         "Dans les secteurs sauvegardés, sites classés et réserves naturelles, à quelle condition de hauteur les murs sont-ils soumis à déclaration préalable ?",
         ["Uniquement les murs de plus de deux mètres",
          "Uniquement les murs de plus d'un mètre quatre-vingts",
          "Les murs, quelle que soit leur hauteur",
          "Aucun mur n'est concerné"],
         2,
         "Le texte vise « les murs, quelle que soit leur hauteur » : aucune condition de hauteur n'est exigée.",
         srcend(S, "inférieure ou égale à vingt mètres carrés, quelle que soit leur hauteur, ainsi que les murs",
                "ainsi que les murs, quelle que soit leur hauteur."),
         ["murs", "hauteur", "site classé", "réserve naturelle"])

    addq(S, "comprehension",
         "Dans un secteur sauvegardé, l'installation de mobilier urbain ou d'œuvres d'art doit-elle faire l'objet d'une déclaration préalable ?",
         ["Non, jamais",
          "Oui, ainsi que les modifications des voies ou espaces publics",
          "Oui, mais seulement si elle dépasse deux mètres",
          "Non, sauf accord du maire"],
         1,
         "Le texte soumet à déclaration préalable « l'installation de mobilier urbain ou d'œuvres d'art, les modifications des voies ou espaces publics et les plantations qui sont effectuées sur ces voies ou espaces ».",
         srcend(S, "Doivent aussi être précédées d’une déclaration préalable l'installation de mobilier urbain",
                "des travaux imposés par les réglementations applicables en matière de sécurité."),
         ["mobilier urbain", "œuvres d'art", "voies publiques", "plantations"])

    # =====================================================================
    # SECTION 1_2_1 — Constructions nouvelles soumises à DP
    # =====================================================================
    S = "104-declaration-prealable__1_2_1"

    addq(S, "comprehension",
         "Par principe, à quelle formalité les constructions nouvelles sont-elles soumises ?",
         ["À une simple déclaration préalable", "À un permis de construire",
          "À un permis d'aménager", "À aucune formalité"],
         1,
         "Le texte rappelle que « Par principe, les constructions nouvelles sont soumises à permis de construire. Certaines d'entre elles sont cependant seulement soumises à déclaration préalable ».",
         srcend(S, "Par principe, les constructions nouvelles sont soumises à permis de construire.",
                "Certaines d’entre elles sont cependant seulement soumises à déclaration préalable."),
         ["constructions nouvelles", "permis de construire", "principe"])

    addq(S, "application",
         "Une construction nouvelle peut relever de la déclaration préalable si elle respecte des critères cumulatifs de hauteur, d'emprise au sol et de surface de plancher. Quelle hauteur maximale au-dessus du sol est exigée pour le premier cas mentionné ?",
         ["Inférieure ou égale à douze mètres", "Inférieure ou égale à cinq mètres",
          "Inférieure ou égale à vingt mètres", "Inférieure ou égale à deux mètres"],
         0,
         "Le texte vise les critères cumulatifs : « une hauteur au-dessus du sol inférieure ou égale à douze mètres, une emprise au sol inférieure ou égale à vingt mètres carrés et une surface de plancher inférieure ou égale à vingt mètres carrés ».",
         srcend(S, "répondant aux critères cumulatifs suivants : une hauteur au-dessus du sol inférieure ou égale à douze mètres",
                "une surface de plancher inférieure ou égale à cinq mètres carrés."),
         ["critères cumulatifs", "douze mètres", "emprise au sol", "surface de plancher"])

    addq(S, "analyse",
         "Pour la construction nouvelle relevant de la déclaration préalable, les critères de hauteur, d'emprise au sol et de surface de plancher sont :",
         ["Alternatifs : un seul suffit", "Cumulatifs : tous doivent être réunis",
          "Indicatifs et non contraignants", "Laissés à l'appréciation du maire"],
         1,
         "Le texte qualifie expressément ces critères de « cumulatifs » : ils doivent tous être réunis.",
         srcend(S, "répondant aux critères cumulatifs suivants : une hauteur au-dessus du sol inférieure ou égale à douze mètres",
                "une surface de plancher inférieure ou égale à cinq mètres carrés."),
         ["critères cumulatifs", "hauteur", "emprise", "surface de plancher"])

    # =====================================================================
    # SECTION 1_2_2 — Travaux et changements de destination
    # =====================================================================
    S = "104-declaration-prealable__1_2_2"

    addq(S, "application",
         "Dans un secteur où le seuil de droit commun s'applique, à quelle valeur ces seuils sont-ils portés pour les projets situés en zone urbaine d'un plan local d'urbanisme ?",
         ["À quarante mètres carrés", "À vingt mètres carrés",
          "À cent mètres carrés", "À cinq mètres carrés"],
         0,
         "Le texte précise : « Ces seuils sont portés à quarante mètres carrés pour les projets situés en zone urbaine d'un plan local d'urbanisme ou d'un document d'urbanisme en tenant lieu ».",
         srcend(S, "Ces seuils sont portés à quarante mètres carrés pour les projets situés en zone urbaine",
                "lorsque cette création conduit au dépassement de l’un des seuils déterminant l’intervention d’un architecte."),
         ["seuils", "quarante mètres carrés", "zone urbaine", "PLU"])

    addq(S, "analyse",
         "Le relèvement des seuils à quarante mètres carrés en zone urbaine est exclu dans un cas. Lequel ?",
         ["Lorsque la création de 20 à 40 m² conduit au dépassement de l'un des seuils déterminant l'intervention d'un architecte",
          "Lorsque le projet concerne un ravalement",
          "Lorsque le projet est situé hors PLU",
          "Lorsque le projet porte sur des locaux accessoires"],
         0,
         "Le texte exclut les projets « impliquant la création d'au moins vingt mètres carrés et d'au plus quarante mètres carrés […] lorsque cette création conduit au dépassement de l'un des seuils déterminant l'intervention d'un architecte ».",
         srcend(S, "à l'exclusion de ceux impliquant la création d'au moins vingt mètres carrés",
                "lorsque cette création conduit au dépassement de l’un des seuils déterminant l’intervention d’un architecte."),
         ["architecte", "seuils", "zone urbaine", "exclusion"])

    addq(S, "comprehension",
         "Pour l'application du régime de la déclaration préalable, comment sont réputés, en matière de destination, les locaux accessoires d'un bâtiment ?",
         ["Ils ont une destination autonome",
          "Ils sont réputés avoir la même destination que le local principal dont ils dépendent",
          "Ils sont toujours soumis à permis de construire",
          "Ils sont dispensés de toute formalité"],
         1,
         "Le texte indique que « les locaux accessoires d'un bâtiment sont réputés avoir la même destination que le local principal ».",
         srcend(S, "les locaux accessoires d'un bâtiment sont réputés avoir la même destination que le local principal",
                "une surface de plancher créée inférieure ou égale à vingt mètres carrés."),
         ["locaux accessoires", "destination", "local principal"])

    # =====================================================================
    # SECTION 1_3 — Clôtures
    # =====================================================================
    S = "104-declaration-prealable__1_3"

    addq(S, "application",
         "Dans une commune, l'édification d'une clôture peut être soumise à déclaration préalable lorsqu'un établissement public de coopération intercommunale en a décidé ainsi. À quelle condition de compétence cet EPCI peut-il prendre une telle décision ?",
         ["Être compétent en matière de plan local d'urbanisme",
          "Être compétent en matière de voirie",
          "Être compétent en matière de gestion des déchets",
          "Être compétent en matière de transports"],
         0,
         "Le texte vise l'établissement « public de coopération intercommunale compétent en matière de plan local d'urbanisme [qui] a décidé de soumettre les clôtures à déclaration ».",
         srcend(S, "public de coopération intercommunale compétent en matière de plan local d'urbanisme a décidé de soumettre les clôtures à déclaration.",
                "a décidé de soumettre les clôtures à déclaration."),
         ["clôtures", "EPCI", "plan local d'urbanisme", "compétence"])

    addq(S, "comprehension",
         "Après l'étude du champ d'application, quelles sont les deux étapes successives de la procédure de déclaration préalable ?",
         ["L'enquête publique puis le vote du conseil municipal",
          "Le dépôt de la déclaration puis son instruction",
          "L'affichage puis le recours",
          "L'accord du maire puis l'achèvement des travaux"],
         1,
         "Le texte annonce la procédure : « La déclaration doit tout d'abord être déposée (2.1), avant d'être soumises à instruction (2.2) ».",
         srcend(S, "La déclaration doit tout d’abord être déposée",
                "avant d’être soumises à instruction (2.2)."),
         ["procédure", "dépôt", "instruction"])

    # =====================================================================
    # SECTION 2_1 — Le dépôt de la déclaration
    # =====================================================================
    S = "104-declaration-prealable__2_1"

    addq(S, "rappel",
         "Parmi les éléments suivants, lequel la déclaration préalable doit-elle préciser ?",
         ["Le coût prévisionnel des travaux",
          "L'identité du déclarant, la localisation et la superficie du terrain",
          "Le nom de l'entreprise réalisant les travaux",
          "Le calendrier détaillé du chantier"],
         1,
         "Le texte indique que la déclaration « précise l'identité du déclarant, la localisation et la superficie du terrain, la nature des travaux ou du changement de destination, la surface hors œuvre et la destination des constructions envisagées ».",
         srcend(S, "La déclaration préalable précise l’identité du déclarant",
                "la destination des constructions envisagées, s’il y a lieu."),
         ["déclarant", "localisation", "superficie", "nature des travaux"])

    addq(S, "comprehension",
         "Quel document, en cas de construction ou d'aménagement, doit figurer dans le dossier joint à la déclaration préalable ?",
         ["Un plan de masse coté dans les trois dimensions",
          "Un devis estimatif des travaux",
          "Une attestation d'assurance dommages-ouvrage",
          "Un extrait de casier judiciaire du déclarant"],
         0,
         "Le texte exige « un plan de masse coté dans les trois dimensions (en cas de construction ou d'aménagement) ».",
         srcend(S, "Le dossier joint à la déclaration est tenu de comprendre un plan de situation du terrain",
                "en cas de projet d’aménagement."),
         ["dossier", "plan de masse", "trois dimensions", "plan de situation"])

    addq(S, "application",
         "Un déclarant dépose une déclaration préalable pour un projet d'aménagement. Quel document, propre à ce cas, doit notamment être joint au dossier ?",
         ["Un plan sommaire des lieux indiquant les bâtiments existant sur le terrain",
          "Une étude d'impact environnemental",
          "Un relevé topographique certifié par un géomètre",
          "Une notice de sécurité incendie"],
         0,
         "Le texte vise « un plan sommaire des lieux indiquant les bâtiments de toute nature existant sur le terrain, en cas de projet d'aménagement ».",
         srcend(S, "un plan sommaire des lieux indiquant les bâtiments de toute nature existant sur le terrain",
                "en cas de projet d’aménagement."),
         ["projet d'aménagement", "plan sommaire", "bâtiments existants"])

    # =====================================================================
    # SECTION 2_2 — Mesures d'instruction
    # =====================================================================
    S = "104-declaration-prealable__2_2"

    addq(S, "comprehension",
         "Quel est le délai d'instruction de droit commun applicable aux déclarations préalables ?",
         ["Un mois", "Deux mois", "Trois mois", "Quinze jours"],
         0,
         "Le texte énonce que « Le délai d'instruction de droit commun est d'un mois pour les déclarations préalables ».",
         srcend(S, "Le délai d’instruction de droit commun est d’un mois pour les déclarations préalables.",
                "Le délai d’instruction de droit commun est d’un mois pour les déclarations préalables."),
         ["délai d'instruction", "droit commun", "un mois"])

    addq(S, "comprehension",
         "À compter de quel événement court le délai d'instruction d'une déclaration préalable ?",
         ["De la signature du déclarant",
          "De la réception en mairie d'un dossier complet de déclaration préalable",
          "De l'affichage en mairie",
          "Du dépôt à la préfecture"],
         1,
         "Le texte précise que ce délai « court à compter de la réception en mairie d'un dossier complet de déclaration préalable ».",
         srcend(S, "Ce délai court à compter de la réception en mairie d’un dossier complet de déclaration préalable.",
                "Ce délai court à compter de la réception en mairie d’un dossier complet de déclaration préalable."),
         ["point de départ", "réception en mairie", "dossier complet"])

    addq(S, "application",
         "Un projet soumis à déclaration préalable est situé dans un secteur sauvegardé. Quelle conséquence le texte prévoit-il sur le délai d'instruction ?",
         ["Aucune conséquence", "Une majoration du délai",
          "Une réduction du délai", "Une suspension définitive de l'instruction"],
         1,
         "Le texte vise « Une hypothèse de majoration de délai […] lorsque le projet est situé dans un secteur sauvegardé ».",
         srcend(S, "Une hypothèse de majoration de délai vise les déclarations préalables lorsque le projet est situé dans un secteur sauvegardé.",
                "Une hypothèse de majoration de délai vise les déclarations préalables lorsque le projet est situé dans un secteur sauvegardé."),
         ["majoration", "délai", "secteur sauvegardé"])

    addq(S, "comprehension",
         "Selon le texte, comment intervient la notification d'une demande de production de pièces manquantes en matière de déclaration préalable ?",
         ["Dans les conditions de droit commun, avec les mêmes conséquences sur le délai d'instruction",
          "Sans aucun effet sur le délai d'instruction",
          "En interrompant définitivement la procédure",
          "Selon des règles propres et plus strictes que pour les permis"],
         0,
         "Le texte précise que cette notification « intervient, en matière de déclaration, dans les conditions de droit commun avec les mêmes conséquences sur le délai d'instruction ».",
         srcend(S, "La notification d’une demande de production de pièces manquantes intervient",
                "avec les mêmes conséquences sur le délai d’instruction."),
         ["pièces manquantes", "notification", "droit commun", "délai"])

    addq(S, "analyse",
         "Selon le texte, les procédures de consultation et de demandes d'accord applicables à la déclaration préalable sont :",
         ["Spécifiques à la déclaration préalable",
          "Celles prévues en matière de permis",
          "Laissées à la libre appréciation du maire",
          "Inexistantes pour les déclarations préalables"],
         1,
         "Le texte indique que « Les procédures de consultation et de demandes d'accord sont celles prévues en matière de permis ».",
         srcend(S, "Les procédures de consultation et de demandes d’accord sont celles prévues en matière de permis.",
                "Les procédures de consultation et de demandes d’accord sont celles prévues en matière de permis."),
         ["consultation", "demandes d'accord", "permis"])

    json.dump({"questions": questions}, open(OUT_FILE, "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)
    print(f"Écrit {len(questions)} questions -> {OUT_FILE}")
    from collections import Counter
    print("Bloom:", dict(Counter(q["bloom"] for q in questions)))


if __name__ == "__main__":
    main()
