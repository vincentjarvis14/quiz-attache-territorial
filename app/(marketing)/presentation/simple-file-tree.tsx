"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen } from "lucide-react"

type TreeNode = {
  name: string
  description?: string
  children?: TreeNode[]
}

function Node({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const hasChildren = Array.isArray(node.children) && node.children.length > 0
  const [open, setOpen] = useState(depth < 1)

  return (
    <div>
      <div
        className="group flex cursor-pointer items-center gap-1.5 rounded-lg py-1 pr-3 transition-colors hover:bg-ink/4"
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => hasChildren && setOpen((o) => !o)}
      >
        {hasChildren ? (
          open ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-coral-400" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink/25 group-hover:text-ink/50" />
          )
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        {hasChildren ? (
          open ? (
            <FolderOpen className="h-3.5 w-3.5 shrink-0 text-coral-500" />
          ) : (
            <Folder className="h-3.5 w-3.5 shrink-0 text-ink/35" />
          )
        ) : (
          <FileText className="h-3.5 w-3.5 shrink-0 text-ink/20" />
        )}

        <span className={`font-mono text-xs ${depth === 0 ? "font-bold text-ink" : "text-ink/70"}`}>
          {node.name}
        </span>

        {node.description && (
          <span className="ml-1.5 max-w-[180px] truncate text-[11px] text-ink/30">
            — {node.description}
          </span>
        )}
      </div>

      {open && hasChildren && (
        <div>
          {node.children!.map((child, i) => (
            <Node key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

const TREE: TreeNode[] = [
  {
    name: "app/",
    children: [
      {
        name: "(marketing)/",
        children: [
          { name: "page.tsx", description: "Page d'accueil publique" },
          { name: "header.tsx", description: "Navigation principale" },
          {
            name: "presentation/",
            children: [
              { name: "layout.tsx", description: "Nav secondaire + progression" },
              { name: "page.tsx", description: "Vue d'ensemble (bento)" },
              { name: "motion.tsx", description: "Reveal + Stagger (Client)" },
              { name: "spotlight-card.tsx", description: "Carte halo curseur (Client)" },
              { name: "code-window.tsx", description: "Éditeur stylisé" },
              { name: "table-of-contents.tsx", description: "Sommaire scroll-spy (Client)" },
              { name: "architecture-beams.tsx", description: "Couches + beams (Client)" },
            ],
          },
        ],
      },
      {
        name: "(auth)/",
        children: [
          { name: "sign-in/", description: "Connexion Supabase" },
          { name: "sign-up/", description: "Inscription Supabase" },
        ],
      },
      {
        name: "(main)/",
        children: [
          { name: "learn/", description: "Interface d'apprentissage" },
          { name: "progression/", description: "Tableau de bord" },
          { name: "library/", description: "Bibliothèque de cours + PDF" },
          { name: "courses/", description: "Catalogue des matières" },
        ],
      },
      {
        name: "lesson/",
        children: [
          { name: "page.tsx", description: "Lecteur de quiz" },
          { name: "quiz-player.tsx", description: "Composant quiz interactif" },
          { name: "layout.tsx", description: "Layout dédié quiz" },
        ],
      },
      {
        name: "api/",
        children: [
          { name: "questions/", description: "GET — Charge les questions" },
          { name: "rag/", description: "search · ask · article (Code urba)" },
          { name: "chapter/ · section/", description: "Contenu de cours par id" },
          { name: "glossary/", description: "Notions juridiques" },
          { name: "guest/", description: "POST — Accès invité" },
        ],
      },
      { name: "layout.tsx", description: "Fonts, metadata, providers" },
      { name: "globals.css", description: "Tailwind + animations custom" },
    ],
  },
  {
    name: "db/",
    children: [
      { name: "schema.ts", description: "14 tables — source de vérité" },
      { name: "queries.ts", description: "Requêtes React cache()" },
      { name: "drizzle.ts", description: "Instance Neon + Drizzle" },
    ],
  },
  {
    name: "components/",
    children: [
      {
        name: "ui/",
        children: [
          { name: "button.tsx", description: "shadcn/ui" },
          { name: "dialog.tsx" },
          { name: "progress.tsx" },
        ],
      },
      { name: "user-progress.tsx", description: "Stats utilisateur" },
    ],
  },
  {
    name: "actions/",
    children: [
      { name: "answers.ts", description: "Enregistrement des réponses" },
      { name: "self-mastery.ts", description: "Maîtrise auto-déclarée" },
      { name: "user-progress.ts", description: "Progression utilisateur" },
    ],
  },
  {
    name: "lib/",
    children: [
      { name: "auth.ts", description: "userId Supabase / invité" },
      { name: "rag.ts", description: "Recherche BM25 Code urba" },
      { name: "mastery.ts · glossary-terms.ts", description: "Config maîtrise + glossaire" },
    ],
  },
  {
    name: "scripts/ (offline — RAG)",
    children: [
      { name: "seed-opus.ts", description: "Seed des questions générées → Neon" },
      { name: "seed-themes.ts", description: "Seed thèmes en DB" },
      { name: "generate (Python)", description: "Génération Claude Opus depuis PDF" },
    ],
  },
  {
    name: "data/",
    children: [{ name: "generated_*.json", description: "Questions RAG par sous-thème" }],
  },
]

export function SimpleFileTree() {
  return (
    <div className="py-2">
      {TREE.map((node, i) => (
        <Node key={i} node={node} depth={0} />
      ))}
    </div>
  )
}
