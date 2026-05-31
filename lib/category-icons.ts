import type { LucideIcon } from "lucide-react";
import {
  Landmark,
  Building2,
  Network,
  Scale,
  Building,
  Map,
  Waves,
  Mountain,
  HardHat,
  FileText,
  Gavel,
  FileCheck,
  Layers,
  Globe,
  BookOpen,
  LayoutGrid,
  BookMarked,
  Wrench,
} from "lucide-react";

export interface CategoryMeta {
  Icon: LucideIcon;
  color: string;
  bgColor: string;
  label: string;
}

const DEFAULT: CategoryMeta = {
  Icon: BookMarked,
  color: "text-ink/55",
  bgColor: "bg-ink/[0.06]",
  label: "Cours",
};

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Règles ordonnées du plus spécifique au plus général.
// Chaque keyword doit être présent dans la concaténation (pdf + section).
const RULES: Array<{ keywords: string[]; meta: CategoryMeta }> = [
  {
    keywords: ["littoral"],
    meta: { Icon: Waves, color: "text-sky-600", bgColor: "bg-sky-50", label: "Loi Littoral" },
  },
  {
    keywords: ["montagne"],
    meta: { Icon: Mountain, color: "text-slate-600", bgColor: "bg-slate-50", label: "Loi Montagne" },
  },
  {
    keywords: ["contentieux"],
    meta: { Icon: Gavel, color: "text-red-700", bgColor: "bg-red-50", label: "Contentieux" },
  },
  {
    keywords: ["permis", "construire"],
    meta: { Icon: HardHat, color: "text-amber-600", bgColor: "bg-amber-50", label: "Permis de construire" },
  },
  {
    keywords: ["permis", "amenager"],
    meta: { Icon: Wrench, color: "text-orange-600", bgColor: "bg-orange-50", label: "Permis d'aménager" },
  },
  {
    keywords: ["permis", "demolir"],
    meta: { Icon: Wrench, color: "text-orange-600", bgColor: "bg-orange-50", label: "Permis de démolir" },
  },
  {
    keywords: ["declaration", "prealable"],
    meta: { Icon: FileText, color: "text-slate-600", bgColor: "bg-slate-50", label: "Déclaration préalable" },
  },
  {
    keywords: ["certificat"],
    meta: { Icon: FileCheck, color: "text-emerald-600", bgColor: "bg-emerald-50", label: "Certificat d'urbanisme" },
  },
  {
    keywords: ["operations", "amenagement"],
    meta: { Icon: Layers, color: "text-violet-600", bgColor: "bg-violet-50", label: "Aménagement" },
  },
  {
    keywords: ["coherence", "territoriale"],
    meta: { Icon: Globe, color: "text-cyan-600", bgColor: "bg-cyan-50", label: "SCoT" },
  },
  {
    keywords: ["plan", "local"],
    meta: { Icon: LayoutGrid, color: "text-teal-600", bgColor: "bg-teal-50", label: "PLU" },
  },
  {
    keywords: ["reglement", "national"],
    meta: { Icon: BookOpen, color: "text-stone-600", bgColor: "bg-stone-50", label: "RNU" },
  },
  {
    keywords: ["urbanisme"],
    meta: { Icon: Map, color: "text-teal-600", bgColor: "bg-teal-50", label: "Urbanisme" },
  },
  {
    keywords: ["juridiction"],
    meta: { Icon: Scale, color: "text-violet-600", bgColor: "bg-violet-50", label: "Organisation judiciaire" },
  },
  {
    keywords: ["decentralis"],
    meta: { Icon: Network, color: "text-emerald-600", bgColor: "bg-emerald-50", label: "Décentralisation" },
  },
  {
    keywords: ["collectivit"],
    meta: { Icon: Building, color: "text-orange-600", bgColor: "bg-orange-50", label: "Collectivités" },
  },
  {
    keywords: ["administratif"],
    meta: { Icon: Building2, color: "text-indigo-600", bgColor: "bg-indigo-50", label: "Org. administrative" },
  },
  {
    keywords: ["etat"],
    meta: { Icon: Landmark, color: "text-blue-600", bgColor: "bg-blue-50", label: "Organisation de l'État" },
  },
  {
    keywords: ["principes"],
    meta: { Icon: Landmark, color: "text-blue-600", bgColor: "bg-blue-50", label: "Grands principes" },
  },
];

export function getCategoryMeta(source: {
  pdf: string;
  section: string;
}): CategoryMeta {
  const haystack = norm(`${source.pdf} ${source.section}`);
  for (const rule of RULES) {
    if (rule.keywords.every((k) => haystack.includes(norm(k)))) {
      return rule.meta;
    }
  }
  return DEFAULT;
}
