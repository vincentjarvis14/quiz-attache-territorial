// Lexique technique — définitions grand public (une phrase + analogie).
// Utilisé par <Terme> (infobulles) et la section Lexique de "Comprendre le site".

export type TechTerm = { term: string; def: string }

export const TECH_GLOSSARY: Record<string, TechTerm> = {
  frontend: {
    term: "Frontend",
    def: "La partie visible du site, celle qui s'affiche dans ton navigateur : les pages, les boutons, les couleurs. C'est la « salle » du restaurant.",
  },
  backend: {
    term: "Backend",
    def: "La partie invisible qui travaille en coulisses : elle vérifie les réponses, enregistre la progression, va chercher les questions. C'est la « cuisine ».",
  },
  base_de_donnees: {
    term: "Base de données",
    def: "Le grand classeur numérique où tout est rangé et conservé : les questions, tes réponses, ta progression. Rien ne se perd entre deux visites.",
  },
  serveur: {
    term: "Serveur",
    def: "Un ordinateur toujours allumé, quelque part dans le cloud, qui prépare les pages et répond aux demandes de ton navigateur.",
  },
  framework: {
    term: "Framework",
    def: "Une boîte à outils prête à l'emploi pour construire un site, qui évite de tout réinventer. Ici : Next.js.",
  },
  next_js: {
    term: "Next.js",
    def: "Le framework (boîte à outils) qui sert à fabriquer l'ensemble du site, aussi bien les pages visibles que la logique en coulisses.",
  },
  rsc: {
    term: "Server Components",
    def: "Des pages préparées directement sur le serveur et envoyées « toutes prêtes » au navigateur. Résultat : un affichage plus rapide et plus léger.",
  },
  app_router: {
    term: "App Router",
    def: "La façon dont Next.js organise les pages et les adresses (URL) du site, comme le plan des rayons d'un magasin.",
  },
  serverless: {
    term: "Serverless",
    def: "Une base de données « à la demande » : elle se réveille quand on en a besoin et se met en veille sinon — pas de machine à entretenir, pas de coût à vide.",
  },
  orm: {
    term: "ORM (Drizzle)",
    def: "Un traducteur entre le code et la base de données : il évite d'écrire des requêtes compliquées à la main et limite les erreurs.",
  },
  api: {
    term: "API",
    def: "Un guichet par lequel deux programmes se parlent : le navigateur demande quelque chose, le serveur répond.",
  },
  middleware: {
    term: "Middleware",
    def: "Un contrôle automatique exécuté à chaque visite — ici, il garde ta session de connexion active sans que tu aies à te reconnecter.",
  },
  authentification: {
    term: "Authentification",
    def: "Le mécanisme qui vérifie qui tu es quand tu te connectes (ou te laisse entrer en mode invité). C'est le « videur » à l'entrée.",
  },
  supabase: {
    term: "Supabase Auth",
    def: "Le service qui gère les comptes et les connexions : inscription, mot de passe, connexion Google.",
  },
  rag: {
    term: "RAG",
    def: "Une méthode qui consiste à fabriquer du contenu (ici, des questions) en s'appuyant uniquement sur des documents de référence, sans rien inventer.",
  },
  bm25: {
    term: "Recherche plein-texte (BM25)",
    def: "Une recherche par mots-clés qui classe les résultats du plus pertinent au moins pertinent — comme un moteur de recherche dans le Code de l'urbanisme.",
  },
  seed: {
    term: "Seed",
    def: "L'étape qui « remplit » la base de données avec le contenu de départ (les questions générées), une fois pour toutes.",
  },
  schema: {
    term: "Schéma de base",
    def: "Le plan du classeur : il décrit quelles informations existent (questions, réponses, progression) et comment elles sont reliées.",
  },
  llm: {
    term: "LLM (Claude Opus)",
    def: "Une intelligence artificielle capable de lire un texte et de rédiger. Ici, elle rédige les questions à partir des documents officiels.",
  },
  qcm: {
    term: "QCM",
    def: "Question à Choix Multiple : une question avec plusieurs réponses possibles, dont une seule est correcte.",
  },
  plu: {
    term: "PLU",
    def: "Plan Local d'Urbanisme : le document qui fixe les règles de construction à l'échelle d'une commune.",
  },
  scot: {
    term: "SCoT",
    def: "Schéma de Cohérence Territoriale : un document de planification qui coordonne l'urbanisme à l'échelle de plusieurs communes.",
  },
}
