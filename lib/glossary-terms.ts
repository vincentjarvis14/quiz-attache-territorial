export type GlossaryEntry = { term: string; definition: string };

// Notions juridiques cliquables — triées du plus long au plus court (évite les collisions regex).
export const GLOSSARY: GlossaryEntry[] = [
  // ── Principes fondamentaux ─────────────────────────────────────────
  {
    term: "principe de continuité du service public",
    definition: "Principe selon lequel le service public ne peut être interrompu, fondé sur la nécessité de répondre en permanence aux besoins essentiels de la collectivité. Il justifie notamment les restrictions au droit de grève des agents publics.",
  },
  {
    term: "principe d'adaptabilité du service public",
    definition: "Également appelé principe de mutabilité, il impose que le service public évolue pour s'adapter aux changements des besoins collectifs et aux évolutions techniques. Il prive les usagers et agents de tout droit acquis au maintien de l'organisation existante.",
  },
  {
    term: "principe d'égalité devant le service public",
    definition: "Tout usager placé dans la même situation doit être traité de façon identique. Ce principe interdit les discriminations injustifiées, mais autorise un traitement différencié fondé sur des situations objectivement différentes.",
  },
  {
    term: "principe de mutabilité",
    definition: "Synonyme du principe d'adaptabilité : le service public peut être modifié ou supprimé à tout moment par l'autorité compétente pour s'adapter aux besoins. Ni les agents ni les usagers ne peuvent s'opposer à ces changements.",
  },
  {
    term: "principe de légalité",
    definition: "L'administration doit agir conformément au droit en vigueur — Constitution, traités, lois, règlements. Tout acte administratif contraire à une norme supérieure est illégal et peut être annulé par le juge administratif.",
  },
  {
    term: "principe de subsidiarité",
    definition: "Les décisions doivent être prises au niveau le plus proche des citoyens. En droit de l'UE, l'Union n'intervient que si l'action des États membres est insuffisante ; en droit interne, il guide la répartition des compétences entre l'État et les collectivités.",
  },
  {
    term: "principe de libre administration",
    definition: "Garanti par l'article 72 de la Constitution, il reconnaît aux collectivités territoriales le droit de s'administrer librement par des conseils élus, dans les conditions prévues par la loi. Il est encadré par le principe d'indivisibilité de la République.",
  },
  {
    term: "hiérarchie des normes",
    definition: "Théorie de Kelsen organisant les règles de droit en pyramide : la Constitution au sommet, puis les traités, les lois organiques, les lois ordinaires, les règlements, les actes individuels. Chaque norme doit être conforme à celle qui lui est supérieure.",
  },
  {
    term: "bloc de constitutionnalité",
    definition: "Ensemble des normes de valeur constitutionnelle servant de référence au contrôle de constitutionnalité : texte de la Constitution de 1958, Déclaration de 1789, Préambule de 1946, Charte de l'environnement de 2004 et principes fondamentaux reconnus par les lois de la République.",
  },
  {
    term: "bloc de légalité",
    definition: "Ensemble des règles dont la violation peut entraîner l'illégalité d'un acte administratif : lois, règlements, principes généraux du droit, normes internationales. Le juge administratif vérifie la conformité de l'acte à l'ensemble de ce bloc.",
  },

  // ── Services publics ───────────────────────────────────────────────
  {
    term: "service public industriel et commercial",
    definition: "Service public dont l'objet, les modalités de financement et les conditions de fonctionnement sont analogues à ceux d'une entreprise privée (ex : distribution d'eau, transport urbain). Il est soumis au droit privé pour ses agents et ses usagers.",
  },
  {
    term: "service public administratif",
    definition: "Service public géré selon des modalités proches de la puissance publique, financé par des taxes ou subventions, sans équivalent dans le secteur privé (ex : état civil, enseignement public). Soumis au droit administratif.",
  },
  {
    term: "délégation de service public",
    definition: "Contrat par lequel une personne publique confie la gestion d'un service public à un délégataire dont la rémunération est substantiellement liée aux résultats de l'exploitation du service (risque d'exploitation transféré).",
  },
  {
    term: "concession de service public",
    definition: "Forme de délégation de service public dans laquelle le concessionnaire construit et exploite un ouvrage à ses risques, se rémunérant sur les redevances versées par les usagers. Le bien revient à la personne publique en fin de contrat.",
  },
  {
    term: "affermage",
    definition: "Forme de délégation dans laquelle le fermier exploite un équipement déjà existant (construit par la collectivité) et verse une redevance à cette dernière. Contrairement à la concession, il ne supporte pas le coût de construction.",
  },
  {
    term: "régie intéressée",
    definition: "Mode de gestion dans lequel un opérateur privé gère le service pour le compte de la collectivité, en étant rémunéré par cette dernière mais avec une part variable indexée sur les résultats. Le risque reste supporté par la collectivité.",
  },
  {
    term: "régie personnalisée",
    definition: "Établissement public local doté de la personnalité morale et de l'autonomie financière, créé par une collectivité pour gérer un service public. Soumis à un conseil d'exploitation.",
  },
  {
    term: "régie autonome",
    definition: "Service public géré directement par la collectivité mais doté d'une autonomie financière (budget annexe propre), sans personnalité morale distincte. Stade intermédiaire entre la régie directe et la régie personnalisée.",
  },
  {
    term: "régie directe",
    definition: "Mode de gestion dans lequel la collectivité assure elle-même le service avec ses propres moyens (agents, équipements, budget), sans aucune autonomie juridique ou financière.",
  },
  {
    term: "loi Murcef",
    definition: "Loi du 11 décembre 2001 portant mesures urgentes de réformes à caractère économique et financier. Elle a notamment clarifié que les délégations de service public ne sont pas des marchés publics et a renforcé les obligations de mise en concurrence.",
  },
  { term: "SPIC", definition: "Abréviation de Service Public Industriel et Commercial. Voir : service public industriel et commercial." },
  { term: "SPA", definition: "Abréviation de Service Public Administratif. Voir : service public administratif." },

  // ── Contrats et marchés publics ────────────────────────────────────
  {
    term: "marché public",
    definition: "Contrat conclu à titre onéreux entre un acheteur public et un opérateur économique pour répondre à ses besoins en matière de travaux, fournitures ou services. Soumis au Code de la commande publique et à des obligations de mise en concurrence.",
  },
  {
    term: "contrat de partenariat",
    definition: "Contrat global et de longue durée par lequel une personne publique confie à un opérateur privé une mission incluant la conception, la construction, le financement et l'exploitation d'un équipement. L'opérateur est rémunéré par la personne publique.",
  },
  {
    term: "contrat administratif",
    definition: "Contrat conclu par une personne publique, soumis au droit administratif et à la compétence du juge administratif. Il est administratif soit par détermination de la loi, soit parce qu'il comporte une clause exorbitante du droit commun ou porte sur l'exécution d'un service public.",
  },
  {
    term: "appel d'offres ouvert",
    definition: "Procédure de passation d'un marché public dans laquelle tout opérateur économique peut soumissionner, sans présélection préalable. C'est la procédure de droit commun au-dessus des seuils européens.",
  },
  {
    term: "appel d'offres restreint",
    definition: "Procédure de marché public avec présélection des candidats : seuls les opérateurs admis à concourir après une première phase de sélection peuvent remettre une offre.",
  },
  {
    term: "procédure adaptée",
    definition: "Procédure de passation d'un marché public sous les seuils européens, dans laquelle l'acheteur définit librement les modalités de mise en concurrence (publicité, délais) adaptées à l'objet et au montant du marché. Anciennement désignée MAPA.",
  },
  {
    term: "procédure négociée",
    definition: "Procédure dérogatoire dans laquelle l'acheteur public négocie directement avec un ou plusieurs opérateurs, utilisable dans des cas limitativement prévus par le Code de la commande publique (urgence impérieuse, marché infructueux, etc.).",
  },
  {
    term: "acte administratif unilatéral",
    definition: "Décision prise par une autorité administrative de manière unilatérale, sans le consentement de ses destinataires, et qui produit des effets de droit. Il peut être réglementaire (portée générale) ou individuel (destinataire déterminé).",
  },
  {
    term: "acte réglementaire",
    definition: "Acte administratif à portée générale et impersonnelle, énonçant des règles applicables à une catégorie de personnes ou de situations. Il peut être modifié ou abrogé à tout moment par l'autorité compétente.",
  },
  {
    term: "acte individuel",
    definition: "Acte administratif dont les effets visent une ou plusieurs personnes nommément désignées (nomination, autorisation, sanction). Il est créateur de droits pour son bénéficiaire si les conditions sont remplies.",
  },
  { term: "MAPA", definition: "Marché à procédure adaptée. Procédure de passation sous les seuils européens permettant à l'acheteur public d'adapter les modalités de publicité et de mise en concurrence à l'objet du marché." },

  // ── Contentieux administratif ──────────────────────────────────────
  {
    term: "recours pour excès de pouvoir",
    definition: "Voie de droit permettant à tout justiciable de demander au juge administratif l'annulation d'un acte administratif illégal, sans avoir à justifier d'un intérêt particulier au-delà de la qualité pour agir. Recours objectif par excellence.",
  },
  {
    term: "recours de plein contentieux",
    definition: "Recours dans lequel le juge dispose de plein pouvoirs : il peut non seulement annuler l'acte, mais aussi le réformer, condamner l'administration à payer des indemnités ou ordonner des mesures d'exécution.",
  },
  {
    term: "référé suspension",
    definition: "Procédure d'urgence (art. L. 521-1 CJA) permettant de suspendre l'exécution d'un acte administratif lorsque le requérant justifie d'une urgence et d'un moyen propre à créer un doute sérieux sur la légalité de l'acte.",
  },
  {
    term: "référé liberté",
    definition: "Procédure d'urgence (art. L. 521-2 CJA) permettant au juge des référés d'ordonner sous 48h toutes mesures nécessaires à la sauvegarde d'une liberté fondamentale gravement et manifestement atteinte par une personne publique.",
  },
  {
    term: "référé précontractuel",
    definition: "Procédure permettant aux candidats évincés d'un marché public de saisir le juge avant la signature du contrat pour faire respecter les obligations de publicité et de mise en concurrence.",
  },
  {
    term: "question prioritaire de constitutionnalité",
    definition: "Mécanisme introduit en 2008 (art. 61-1 C.) permettant à toute partie à un procès de contester la constitutionnalité d'une disposition législative applicable au litige, qui est transmise au Conseil constitutionnel via le Conseil d'État ou la Cour de cassation.",
  },
  {
    term: "exception d'illégalité",
    definition: "Moyen de défense permettant à une partie, à l'occasion d'un litige portant sur un acte individuel, de soulever l'illégalité de l'acte réglementaire sur lequel il est fondé, même si le délai de recours contre cet acte réglementaire est expiré.",
  },
  {
    term: "pouvoir discrétionnaire",
    definition: "Latitude laissée à l'administration pour apprécier l'opportunité de prendre ou non une décision, et en fixer le contenu, dans les limites fixées par la loi. Contrôlé de façon limitée par le juge (erreur manifeste d'appréciation).",
  },
  {
    term: "compétence liée",
    definition: "Situation dans laquelle l'administration est obligée de prendre une décision déterminée dès lors que les conditions légales sont réunies, sans marge d'appréciation. Le juge exerce un contrôle normal (entier) de la légalité.",
  },
  {
    term: "détournement de pouvoir",
    definition: "Vice de légalité interne consistant pour une autorité administrative à utiliser ses pouvoirs dans un but autre que celui pour lequel ils lui ont été conférés (intérêt personnel, but étranger à l'intérêt général).",
  },
  {
    term: "vice de forme",
    definition: "Irrégularité affectant la présentation externe d'un acte administratif (signature manquante, absence de motivation obligatoire, etc.). Peut entraîner l'annulation de l'acte si le vice est substantiel.",
  },
  {
    term: "vice de procédure",
    definition: "Irrégularité dans le déroulement de la procédure précédant l'adoption d'un acte (consultation obligatoire omise, délai non respecté). L'annulation est prononcée si la formalité omise est substantielle et a pu influer sur le sens de la décision.",
  },
  {
    term: "erreur de droit",
    definition: "Illégalité interne résultant d'une mauvaise interprétation ou application de la règle de droit par l'administration (fondement juridique erroné, méconnaissance de la portée d'un texte).",
  },
  {
    term: "erreur manifeste d'appréciation",
    definition: "Contrôle exercé par le juge administratif dans les domaines où l'administration dispose d'un pouvoir discrétionnaire : le juge n'annule que si l'appréciation de l'administration est grossièrement inexacte ou déraisonnable.",
  },
  { term: "REP", definition: "Abréviation de Recours Pour Excès de Pouvoir. Voir : recours pour excès de pouvoir." },
  { term: "QPC", definition: "Abréviation de Question Prioritaire de Constitutionnalité. Voir : question prioritaire de constitutionnalité." },

  // ── Décentralisation / intercommunalité ───────────────────────────
  {
    term: "établissement public de coopération intercommunale",
    definition: "Groupement de communes doté de la personnalité morale et de l'autonomie financière, créé pour exercer en commun des compétences transférées par les communes membres. On distingue les EPCI à fiscalité propre (CA, CU, CC, métropoles) et les syndicats.",
  },
  {
    term: "communauté urbaine",
    definition: "EPCI à fiscalité propre regroupant plusieurs communes formant un ensemble de plus de 250 000 habitants, exerçant de plein droit de nombreuses compétences (développement économique, aménagement, logement, voirie…).",
  },
  {
    term: "communauté d'agglomération",
    definition: "EPCI à fiscalité propre regroupant plusieurs communes formant un ensemble de plus de 50 000 habitants autour d'une commune-centre de plus de 15 000 habitants. Elle exerce des compétences obligatoires et optionnelles.",
  },
  {
    term: "communauté de communes",
    definition: "EPCI à fiscalité propre le plus répandu, regroupant des communes d'un seul tenant et sans enclave, sans seuil de population minimal fixe après la loi NOTRe. Elle exerce des compétences obligatoires, optionnelles et facultatives.",
  },
  {
    term: "syndicat intercommunal à vocation multiple",
    definition: "EPCI sans fiscalité propre créé pour exercer plusieurs compétences déterminées par les communes membres, qui lui versent des contributions budgétaires.",
  },
  {
    term: "syndicat intercommunal à vocation unique",
    definition: "EPCI sans fiscalité propre créé pour exercer une seule compétence (eau, assainissement, scolaire, etc.). Forme la plus ancienne de coopération intercommunale (depuis 1890).",
  },
  {
    term: "métropole du Grand Paris",
    definition: "Établissement public de coopération intercommunale à statut particulier créé le 1er janvier 2016, regroupant Paris et les communes des Hauts-de-Seine, Seine-Saint-Denis et Val-de-Marne, ainsi que des communes d'autres départements franciliens.",
  },
  {
    term: "acte I de la décentralisation",
    definition: "Réformes engagées par les lois de 1982-1983 (loi du 2 mars 1982 notamment) : suppression de la tutelle préfectorale a priori, transfert de l'exécutif régional et départemental aux élus, création du contrôle de légalité a posteriori.",
  },
  {
    term: "acte II de la décentralisation",
    definition: "Réformes de 2003-2004 : révision constitutionnelle du 28 mars 2003 consacrant la décentralisation dans la Constitution, reconnaissance des expérimentations, transferts de compétences aux régions et départements (loi du 13 août 2004).",
  },
  {
    term: "acte III de la décentralisation",
    definition: "Réformes de 2014-2015 : loi MAPTAM (2014) créant les métropoles, loi NOTRe (2015) supprimant la clause de compétence générale des départements et régions, réduction du nombre de régions de 22 à 13 (loi du 16 janvier 2015).",
  },
  {
    term: "loi du 2 mars 1982",
    definition: "Loi relative aux droits et libertés des communes, des départements et des régions. Acte fondateur de la décentralisation : elle supprime la tutelle a priori du préfet, transfère l'exécutif régional au président du Conseil régional et crée le déféré préfectoral.",
  },
  {
    term: "loi NOTRe",
    definition: "Loi du 7 août 2015 portant Nouvelle Organisation Territoriale de la République. Elle supprime la clause de compétence générale des départements et régions, renforce les compétences des régions (développement économique, transports) et relève le seuil des EPCI à 15 000 habitants.",
  },
  {
    term: "loi MAPTAM",
    definition: "Loi du 27 janvier 2014 de Modernisation de l'Action Publique Territoriale et d'Affirmation des Métropoles. Elle crée le statut de métropole (dont Paris, Lyon, Marseille en statut particulier) et instaure le principe de chef de file.",
  },
  {
    term: "loi RCT",
    definition: "Loi du 16 décembre 2010 de Réforme des Collectivités Territoriales. Elle crée le conseiller territorial, fixe l'achèvement de la carte intercommunale et instaure les métropoles et pôles métropolitains.",
  },
  {
    term: "clause de compétence générale",
    definition: "Principe permettant à une collectivité territoriale d'intervenir dans tout domaine d'intérêt local, sans que la loi ait expressément prévu cette compétence. Supprimée pour les départements et régions par la loi NOTRe (2015), maintenue pour les communes.",
  },
  {
    term: "chef de file",
    definition: "Collectivité désignée par la loi pour organiser les modalités de l'action commune lorsque l'exercice d'une compétence nécessite le concours de plusieurs collectivités. La région est chef de file pour le développement économique, les départements pour l'action sociale.",
  },
  {
    term: "contrôle de légalité",
    definition: "Mécanisme a posteriori par lequel le préfet peut déférer au tribunal administratif les actes des collectivités territoriales qu'il estime illégaux, dans les deux mois de leur réception en préfecture.",
  },
  {
    term: "tutelle administrative",
    definition: "Mécanisme de contrôle exercé par l'État sur les collectivités territoriales. Depuis la loi du 2 mars 1982, la tutelle a priori est supprimée : le préfet ne peut plus s'opposer préalablement aux actes, mais seulement les déférer au juge après leur entrée en vigueur.",
  },
  {
    term: "schéma départemental de coopération intercommunale",
    definition: "Document élaboré par le préfet fixant les orientations de rationalisation de la carte intercommunale du département (couverture intégrale, suppression des enclaves, réduction du nombre de syndicats). Il est révisé au moins tous les six ans.",
  },
  {
    term: "fiscalité propre",
    definition: "Caractéristique des EPCI qui perçoivent directement des impôts locaux (taxe foncière, cotisation foncière des entreprises…), à la différence des syndicats qui sont financés par des contributions des communes membres.",
  },
  { term: "EPCI", definition: "Établissement Public de Coopération Intercommunale. Groupement de communes (CA, CU, CC, métropole, syndicat) créé pour exercer des compétences en commun. Peut être à fiscalité propre ou sans fiscalité propre." },
  { term: "CGCT", definition: "Code Général des Collectivités Territoriales. Texte codifiant l'ensemble des règles relatives à l'organisation et au fonctionnement des communes, départements, régions et de leurs groupements." },
  { term: "SDCI", definition: "Schéma Départemental de Coopération Intercommunale. Voir : schéma départemental de coopération intercommunale." },
  { term: "SIVOM", definition: "Syndicat Intercommunal à VOcation Multiple. EPCI sans fiscalité propre exerçant plusieurs compétences déléguées par les communes membres." },
  { term: "SIVU", definition: "Syndicat Intercommunal à Vocation Unique. EPCI sans fiscalité propre créé pour gérer une seule compétence déterminée (eau, école, ordures ménagères, etc.)." },

  // ── Urbanisme ─────────────────────────────────────────────────────
  {
    term: "plan local d'urbanisme intercommunal",
    definition: "PLU élaboré à l'échelle de l'EPCI compétent en matière d'urbanisme. Il couvre l'ensemble du territoire de l'EPCI et peut tenir lieu de programme local de l'habitat (PLH) et de plan de déplacements urbains (PDU).",
  },
  {
    term: "plan local d'urbanisme",
    definition: "Document d'urbanisme communal ou intercommunal définissant le projet d'aménagement et de développement durable (PADD), les zones et les règles d'utilisation des sols. Il remplace le Plan d'Occupation des Sols depuis la loi SRU (2000).",
  },
  {
    term: "schéma de cohérence territoriale",
    definition: "Document de planification stratégique à l'échelle d'un bassin de vie ou d'emploi, fixant les grandes orientations en matière d'urbanisme, d'habitat, de mobilité et d'équipements commerciaux. Les PLU doivent lui être compatibles.",
  },
  {
    term: "droit de préemption urbain",
    definition: "Droit permettant à la commune (ou à l'EPCI compétent) d'acquérir en priorité, à l'occasion d'une vente, les biens immobiliers situés dans une zone délimitée par le PLU, pour réaliser des opérations d'aménagement d'intérêt général.",
  },
  {
    term: "zone d'aménagement concerté",
    definition: "Zone à l'intérieur de laquelle une collectivité publique ou un établissement public acquiert des terrains pour y réaliser ou faire réaliser des équipements publics et des constructions à usage d'habitation, de commerce ou d'industrie.",
  },
  {
    term: "plan d'occupation des sols",
    definition: "Ancien document d'urbanisme local remplacé par le PLU depuis la loi SRU de 2000. Les POS encore en vigueur ont été caducs au 31 décembre 2019 (loi ALUR 2014), entraînant le retour au RNU.",
  },
  {
    term: "secteur sauvegardé",
    definition: "Ancien outil de protection du patrimoine architectural et urbain, remplacé par le Site Patrimonial Remarquable (SPR) par la loi LCAP de 2016. Il définissait des règles spécifiques de conservation dans les centres historiques.",
  },
  {
    term: "site patrimonial remarquable",
    definition: "Outil de protection du patrimoine urbain et paysager créé par la loi LCAP (2016), regroupant les anciens secteurs sauvegardés, ZPPAUP et AVAP. Il est assorti d'un plan de sauvegarde et de mise en valeur (PSMV) ou d'un plan de valorisation de l'architecture et du patrimoine (PVAP).",
  },
  {
    term: "déclaration préalable de travaux",
    definition: "Formalité administrative exigée pour des travaux de faible importance (extension limitée, changement de destination, construction d'une surface inférieure à 20 m²). Elle permet à la mairie de vérifier la conformité du projet aux règles d'urbanisme.",
  },
  {
    term: "permis de construire",
    definition: "Autorisation d'urbanisme nécessaire pour les constructions nouvelles de plus de 20 m² de surface de plancher ou d'emprise au sol, pour les extensions dépassant certains seuils et pour certains changements de destination. Délivré par le maire au nom de la commune.",
  },
  {
    term: "permis d'aménager",
    definition: "Autorisation requise pour les opérations d'aménagement (lotissements, campings, terrains de sports motorisés…). Il permet à l'autorité compétente de contrôler les aménagements affectant l'utilisation du sol.",
  },
  {
    term: "permis de démolir",
    definition: "Autorisation d'urbanisme exigée pour la démolition totale ou partielle de constructions dans les secteurs où il a été institué (SPR, zones protégées, communes l'ayant décidé dans leur PLU).",
  },
  {
    term: "règlement national d'urbanisme",
    definition: "Ensemble de règles d'urbanisme applicables sur les communes non couvertes par un PLU ou une carte communale. Il pose les principes généraux d'utilisation des sols (constructibilité limitée, respect du site, desserte par les réseaux).",
  },
  {
    term: "taxe d'aménagement",
    definition: "Taxe locale perçue lors de la délivrance des autorisations d'urbanisme (permis de construire, d'aménager, déclarations préalables), destinée à financer les équipements publics rendus nécessaires par l'urbanisation.",
  },
  {
    term: "servitude d'utilité publique",
    definition: "Contrainte imposée à des propriétaires privés dans l'intérêt général (protection des abords de monuments historiques, zones de bruit aéroportuaires, conduites de gaz…). Elle est annexée au PLU et opposable aux demandes d'autorisation.",
  },
  {
    term: "carte communale",
    definition: "Document d'urbanisme simplifié applicable aux communes de petite taille, qui délimite les secteurs constructibles et non constructibles sans édicter de règles particulières. Dans les secteurs constructibles, le RNU s'applique.",
  },
  {
    term: "orientations d'aménagement et de programmation",
    definition: "Partie du PLU définissant les modalités d'aménagement des secteurs à urbaniser ou à requalifier, ainsi que les conditions d'équipement. Les autorisations d'urbanisme doivent leur être compatibles.",
  },
  {
    term: "secteur de taille et de capacité d'accueil limitées",
    definition: "Zone constructible délimitée par exception dans les zones agricoles ou naturelles d'un PLU pour permettre des constructions ou installations nécessaires à des activités particulières. Leur délimitation est encadrée depuis la loi ALUR.",
  },
  {
    term: "unité touristique nouvelle",
    definition: "Équipement touristique en zone de montagne (remontées mécaniques, hébergements de grande capacité, infrastructures) soumis à une procédure d'autorisation spécifique en raison de son impact sur l'environnement et l'aménagement.",
  },
  {
    term: "loi SRU",
    definition: "Loi du 13 décembre 2000 de Solidarité et Renouvellement Urbains. Elle remplace les POS par les PLU et les SD par les SCOT, impose 20 % (puis 25 %) de logements sociaux dans les communes de plus de 3 500 habitants en agglomération de plus de 50 000 habitants.",
  },
  {
    term: "loi ALUR",
    definition: "Loi du 24 mars 2014 pour l'Accès au Logement et un Urbanisme Rénové. Elle transfère la compétence PLU aux intercommunalités, encadre les loyers, simplifie les procédures d'urbanisme et renforce la lutte contre l'habitat indigne.",
  },
  {
    term: "loi littoral",
    definition: "Loi du 3 janvier 1986 relative à l'aménagement, la protection et la mise en valeur du littoral. Elle impose une bande inconstructible de 100 m depuis le rivage, l'extension de l'urbanisation en continuité des agglomérations existantes et protège les espaces proches du rivage.",
  },
  {
    term: "loi montagne",
    definition: "Loi du 9 janvier 1985 relative au développement et à la protection de la montagne. Elle protège les espaces naturels et agricoles, encadre l'urbanisation dans les zones de montagne (constructibilité en continuité des bourgs existants) et réglemente les UTN.",
  },
  { term: "PLU", definition: "Plan Local d'Urbanisme. Document d'urbanisme de référence à l'échelle communale ou intercommunale, définissant les zones, règles et orientations d'aménagement du territoire." },
  { term: "PLUi", definition: "Plan Local d'Urbanisme intercommunal. PLU élaboré à l'échelle de l'EPCI compétent en matière d'urbanisme depuis la loi ALUR (2014)." },
  { term: "SCOT", definition: "Schéma de Cohérence Territoriale. Document de planification stratégique à l'échelle d'un bassin de vie, encadrant les PLU, les programmes d'habitat et les plans de déplacements." },
  { term: "DPU", definition: "Droit de Préemption Urbain. Droit permettant à la commune d'acquérir prioritairement un bien immobilier mis en vente dans une zone délimitée par le PLU." },
  { term: "ZAC", definition: "Zone d'Aménagement Concerté. Outil opérationnel d'aménagement permettant à une collectivité de maîtriser le foncier et de réaliser des équipements publics dans un périmètre défini." },
  { term: "SPR", definition: "Site Patrimonial Remarquable. Outil de protection du patrimoine architectural et paysager créé par la loi LCAP (2016), remplaçant les secteurs sauvegardés, ZPPAUP et AVAP." },
  { term: "RNU", definition: "Règlement National d'Urbanisme. Règles générales d'urbanisme s'appliquant en l'absence de PLU ou de carte communale." },
  { term: "OAP", definition: "Orientations d'Aménagement et de Programmation. Partie du PLU définissant les conditions d'aménagement des secteurs stratégiques, avec lesquelles les autorisations d'urbanisme doivent être compatibles." },
  { term: "STECAL", definition: "Secteur de Taille Et de Capacité d'Accueil Limitées. Zone constructible délimitée par exception dans les zones A ou N d'un PLU pour des constructions spécifiques." },
  { term: "UTN", definition: "Unité Touristique Nouvelle. Équipement touristique en zone de montagne soumis à autorisation spécifique en raison de son impact environnemental et sur l'aménagement." },

  // ── Fonction publique territoriale ────────────────────────────────
  {
    term: "statut général des fonctionnaires",
    definition: "Ensemble des règles communes aux trois fonctions publiques (État, territoriale, hospitalière), fixées par les lois du 13 juillet 1983 (droits et obligations) et les lois portant dispositions statutaires propres à chaque versant.",
  },
  {
    term: "cadre d'emplois",
    definition: "Structure de la fonction publique territoriale regroupant les fonctionnaires soumis au même statut particulier et ayant vocation à exercer les mêmes types d'emplois. Équivalent du corps dans la fonction publique d'État.",
  },
  {
    term: "avancement de grade",
    definition: "Progression d'un fonctionnaire vers un grade supérieur au sein de son cadre d'emplois, donnant accès à des emplois d'un niveau de responsabilité plus élevé. Il intervient selon des modalités (examen professionnel, choix) définies par les statuts particuliers.",
  },
  {
    term: "avancement d'échelon",
    definition: "Progression automatique au sein d'un grade en fonction de l'ancienneté (et de la valeur professionnelle depuis la loi du 20 avril 2016). Chaque échelon correspond à un indice de traitement déterminant la rémunération brute.",
  },
  {
    term: "promotion interne",
    definition: "Accès d'un fonctionnaire à un cadre d'emplois supérieur sans concours, par inscription sur une liste d'aptitude après avis de la CAP. Contingentée par un ratio promu/promouvables fixé par décret.",
  },
  {
    term: "concours de la fonction publique",
    definition: "Mode principal de recrutement des fonctionnaires, permettant de sélectionner les candidats sur la base de leurs mérites. On distingue les concours externes (ouverts aux candidats extérieurs), internes (aux fonctionnaires en exercice) et les troisièmes concours.",
  },
  {
    term: "recrutement sans concours",
    definition: "Mode de recrutement dérogatoire permettant de recruter directement sur certains emplois de catégorie C sans organisation de concours, lorsque le statut particulier le prévoit.",
  },
  {
    term: "commission administrative paritaire",
    definition: "Instance consultative composée à parité de représentants de l'administration et de représentants élus des fonctionnaires, consultée sur les décisions individuelles affectant la carrière des agents (notation, avancement, mutation disciplinaire…).",
  },
  {
    term: "comité social territorial",
    definition: "Instance de dialogue social dans la fonction publique territoriale depuis la loi du 6 août 2019 (remplaçant le comité technique et le CHSCT à partir de 2023), compétente pour les questions relatives à l'organisation des services et aux conditions de travail.",
  },
  {
    term: "comité d'hygiène, de sécurité et des conditions de travail",
    definition: "Ancienne instance paritaire compétente pour les questions d'hygiène, de sécurité et d'amélioration des conditions de travail dans les collectivités de plus de 50 agents. Fusionné avec le comité technique dans le comité social territorial depuis 2023.",
  },
  {
    term: "mise à disposition",
    definition: "Situation d'un fonctionnaire qui demeure dans son cadre d'emplois d'origine mais exerce ses fonctions dans un autre organisme (autre collectivité, État, association...). Sa rémunération reste à la charge de son employeur d'origine, qui peut la refacturer.",
  },
  {
    term: "détachement",
    definition: "Position d'un fonctionnaire qui quitte temporairement son cadre d'emplois pour servir dans un autre corps, cadre d'emplois ou emploi, public ou privé. Il conserve ses droits à l'avancement et à la retraite dans son cadre d'emplois d'origine.",
  },
  {
    term: "disponibilité",
    definition: "Position d'un fonctionnaire placé hors de son administration d'origine, sans exercer de fonctions publiques et sans rémunération ni droits à avancement ou retraite. Elle peut être accordée de droit (éducation d'un enfant…) ou sous réserve des nécessités de service.",
  },
  {
    term: "congé de longue maladie",
    definition: "Congé accordé au fonctionnaire atteint d'une maladie grave nécessitant un traitement prolongé rendant impossible l'exercice des fonctions. Durée maximale de 3 ans avec maintien du traitement (1 an plein, 2 ans à demi-traitement).",
  },
  {
    term: "congé de longue durée",
    definition: "Congé accordé au fonctionnaire atteint de certaines affections graves (tuberculose, cancer, troubles mentaux, poliomyélite, déficit immunitaire grave). Durée maximale de 5 ans (3 ans à traitement plein, 2 ans à demi-traitement).",
  },
  {
    term: "reclassement",
    definition: "Procédure permettant à un fonctionnaire devenu inapte à ses fonctions pour raison de santé d'être affecté dans un autre emploi compatible avec son état de santé, dans son grade ou dans un autre cadre d'emplois.",
  },
  {
    term: "sanction disciplinaire",
    definition: "Mesure prise par l'autorité territoriale à l'encontre d'un fonctionnaire ayant commis une faute. Les sanctions sont classées en quatre groupes : 1er groupe (avertissement, blâme) sans consultation de la CAP, 2e à 4e groupes avec consultation obligatoire.",
  },
  {
    term: "conseil de discipline",
    definition: "Formation restreinte de la CAP, consultée obligatoirement avant toute sanction des 2e, 3e et 4e groupes. Elle émet un avis sur la sanction envisagée, que l'autorité territoriale n'est pas tenue de suivre.",
  },
  {
    term: "traitement indiciaire",
    definition: "Élément principal de la rémunération du fonctionnaire, calculé en multipliant la valeur du point d'indice de la fonction publique par l'indice brut du grade et de l'échelon détenu par l'agent.",
  },
  {
    term: "régime indemnitaire",
    definition: "Ensemble des primes et indemnités versées aux fonctionnaires en complément du traitement, dans le respect des dispositions applicables aux fonctionnaires de l'État. Pour les fonctionnaires territoriaux, il ne peut être plus favorable que celui des agents de l'État de référence.",
  },
  {
    term: "supplément familial de traitement",
    definition: "Complément de rémunération versé aux fonctionnaires ayant un ou plusieurs enfants à charge. Son montant comprend une partie fixe et une partie proportionnelle au traitement.",
  },
  {
    term: "nouvelle bonification indiciaire",
    definition: "Points d'indice supplémentaires attribués à certains fonctionnaires occupant des emplois comportant des sujétions particulières (responsabilité, technicité…), augmentant la rémunération et les droits à la retraite.",
  },
  {
    term: "loi du 13 juillet 1983",
    definition: "Loi portant droits et obligations des fonctionnaires (dite loi Le Pors). Titre premier du statut général, elle fixe les droits fondamentaux (liberté d'opinion, droit syndical, droit de grève) et les obligations (obéissance hiérarchique, neutralité, discrétion) de tous les fonctionnaires.",
  },
  {
    term: "loi du 26 janvier 1984",
    definition: "Loi portant dispositions statutaires relatives à la fonction publique territoriale. Elle organise les cadres d'emplois, les concours, le CNFPT et les centres de gestion pour les agents des collectivités territoriales et de leurs établissements.",
  },
  {
    term: "titulaire",
    definition: "Fonctionnaire ayant accompli avec succès une période de stage et nommé de manière permanente dans un grade de la hiérarchie administrative. Il bénéficie de la garantie de l'emploi et d'un déroulement de carrière statutaire.",
  },
  {
    term: "contractuel de droit public",
    definition: "Agent recruté par contrat par une personne publique pour occuper un emploi qui ne correspond pas aux besoins permanents de l'administration, ou dans des cas dérogatoires prévus par le statut. Son contrat est soumis au droit public.",
  },
  {
    term: "agent non titulaire",
    definition: "Agent de la fonction publique recruté par contrat (CDD ou CDI selon la durée et les cas), ne bénéficiant pas du statut de fonctionnaire. Peut prétendre à la titularisation sous certaines conditions.",
  },
  { term: "CNFPT", definition: "Centre National de la Fonction Publique Territoriale. Établissement public gérant la formation professionnelle des agents territoriaux et l'organisation de certains concours et examens professionnels de catégorie A+." },
  { term: "CAP", definition: "Commission Administrative Paritaire. Instance consultative paritaire compétente pour les décisions individuelles affectant la carrière des fonctionnaires." },
  { term: "CST", definition: "Comité Social Territorial. Instance de dialogue social remplaçant depuis 2023 le comité technique et le CHSCT dans la fonction publique territoriale." },
  { term: "CHSCT", definition: "Comité d'Hygiène, de Sécurité et des Conditions de Travail. Ancienne instance paritaire compétente pour les questions de santé et sécurité au travail, fusionnée dans le CST depuis 2023." },
  { term: "NBI", definition: "Nouvelle Bonification Indiciaire. Points d'indice supplémentaires accordés à certains fonctionnaires pour des sujétions particulières ou des responsabilités spécifiques." },
  { term: "RIFSEEP", definition: "Régime Indemnitaire tenant compte des Fonctions, des Sujétions, de l'Expertise et de l'Engagement Professionnel. Régime indemnitaire de référence dans la fonction publique, composé d'une part liée au poste (IFSE) et d'une part liée à l'engagement (CIA)." },
  { term: "PPCR", definition: "Protocole Parcours Professionnels, Carrières et Rémunérations. Réforme de 2016 visant à revaloriser les carrières des fonctionnaires par la création de nouvelles grilles indiciaires et la conversion de primes en points d'indice." },

  // ── Contrôle de constitutionnalité ────────────────────────────────
  {
    term: "contrôle a priori",
    definition: "Contrôle de constitutionnalité exercé avant la promulgation d'une loi, par le Conseil constitutionnel saisi dans les 8 jours suivant son adoption par le Parlement. C'était le seul mode de contrôle possible avant la révision constitutionnelle de 2008.",
  },
  {
    term: "contrôle a posteriori",
    definition: "Contrôle de constitutionnalité exercé après la promulgation d'une loi, introduit par la révision constitutionnelle du 23 juillet 2008 via la Question Prioritaire de Constitutionnalité (QPC), applicable depuis le 1er mars 2010.",
  },
  {
    term: "loi organique",
    definition: "Catégorie de lois prévues par la Constitution pour préciser et compléter certaines de ses dispositions. Adoptées selon une procédure renforcée (délai entre les deux lectures, soumission obligatoire au Conseil constitutionnel), elles ont une valeur infra-constitutionnelle mais supra-législative.",
  },
  {
    term: "motion de censure",
    definition: "Procédure parlementaire permettant à l'Assemblée nationale de mettre en jeu la responsabilité du gouvernement. Elle doit être signée par au moins 1/10 des membres, et votée à la majorité absolue pour entraîner la démission du gouvernement (art. 49 al. 3 C.).",
  },
  {
    term: "dissolution de l'Assemblée nationale",
    definition: "Prérogative du président de la République (art. 12 C.) mettant fin au mandat de l'Assemblée nationale et convoquant de nouvelles élections législatives dans les 20 à 40 jours. Elle ne peut intervenir dans l'année suivant des élections législatives.",
  },
  {
    term: "article 49 alinéa 3",
    definition: "Disposition constitutionnelle permettant au Premier ministre d'engager la responsabilité du gouvernement sur le vote d'un texte, qui est alors considéré comme adopté sans vote sauf si une motion de censure est déposée et adoptée dans les 24 heures.",
  },
  {
    term: "article 61 de la Constitution",
    definition: "Article organisant le contrôle a priori de constitutionnalité des lois organiques (obligatoire) et ordinaires (facultatif, sur saisine du président, du Premier ministre ou des présidents des assemblées, ou depuis 1974, de 60 parlementaires).",
  },
  {
    term: "article 72 de la Constitution",
    definition: "Article consacrant le principe de libre administration des collectivités territoriales et précisant que le représentant de l'État (préfet) a la charge des intérêts nationaux, du contrôle administratif et du respect des lois.",
  },
];

// Tableau simple de termes pour la détection regex (du plus long au plus court)
export const GLOSSARY_TERMS: string[] = GLOSSARY.map((e) => e.term).sort(
  (a, b) => b.length - a.length,
);

// Map terme → définition pour lookup rapide (clé en minuscules)
export const GLOSSARY_MAP = new Map<string, string>(
  GLOSSARY.map((e) => [e.term.toLowerCase(), e.definition]),
);
