// Niveau de maîtrise auto-déclaré par le lecteur — config partagée
// (data pure, importable côté serveur comme côté client).

export type MasteryLevel = "a_revoir" | "en_cours" | "maitrise";

export const MASTERY_LEVELS: MasteryLevel[] = [
  "a_revoir",
  "en_cours",
  "maitrise",
];

export type MasteryMeta = {
  label: string;
  short: string;
  dot: string; // pastille pleine
  text: string; // couleur du libellé
  bar: string; // liseré gauche de la card
  ring: string; // anneau de l'option sélectionnée
  activeBg: string; // fond de l'option sélectionnée
};

export const MASTERY_META: Record<MasteryLevel, MasteryMeta> = {
  a_revoir: {
    label: "À revoir",
    short: "À revoir",
    dot: "bg-red-500",
    text: "text-red-600",
    bar: "bg-red-400",
    ring: "ring-red-300",
    activeBg: "bg-red-50",
  },
  en_cours: {
    label: "En cours",
    short: "En cours",
    dot: "bg-amber-500",
    text: "text-amber-600",
    bar: "bg-amber-400",
    ring: "ring-amber-300",
    activeBg: "bg-amber-50",
  },
  maitrise: {
    label: "Maîtrisé",
    short: "Maîtrisé",
    dot: "bg-emerald-500",
    text: "text-emerald-600",
    bar: "bg-emerald-400",
    ring: "ring-emerald-300",
    activeBg: "bg-emerald-50",
  },
};
