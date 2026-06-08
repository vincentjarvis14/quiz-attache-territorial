"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CalendarDays, LogOut } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getMyProfile, updateMyProfile, type MyProfile } from "@/actions/profile";

const DEFAULT_NAME = "Utilisateur";

// Emojis d'avatar — en lien avec le concours d'attaché territorial.
const AVATAR_EMOJIS = [
  "🎯", // objectif concours
  "🎓", // réussite / diplôme
  "📚", // révisions
  "🏛️", // administration / territorial
  "⚖️", // droit
  "🗳️", // démocratie locale
  "🏙️", // urbanisme
  "🌳", // environnement territorial
  "🧠", // mémorisation
  "✍️", // épreuves écrites
  "📋", // notes de synthèse
  "🏆", // ambition
];

/** Initiales pour la pastille avatar : depuis le nom, sinon l'email. */
function initials(name: string, email: string | null): string {
  const n = name.trim();
  if (n && n !== DEFAULT_NAME) {
    const parts = n.split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

/** Jours restants avant le concours (à partir d'une date ISO "YYYY-MM-DD"). */
function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function ProfileMenu() {
  const router = useRouter();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [avatar, setAvatar] = useState<string>(""); // emoji, "" = initiales
  const [saving, setSaving] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMyProfile().then((p) => {
      if (!p) return;
      setProfile(p);
      setName(p.name === DEFAULT_NAME ? "" : p.name);
      setExamDate(p.examDate);
      setAvatar(p.avatar ?? "");
    });
  }, []);

  // Fermer au clic extérieur / Échap
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!profile) return null;

  const display = name.trim() || (profile.name === DEFAULT_NAME ? "Mon profil" : profile.name);
  const inits = initials(name || profile.name, profile.email);
  const dLeft = daysUntil(examDate || profile.examDate);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateMyProfile({ name, examDate, avatar });
      setProfile(updated);
      setOpen(false);
      router.refresh(); // rafraîchit le bandeau J-X du dashboard
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // Contenu de la pastille : emoji choisi sinon initiales.
  const avatarFace = (size: "sm" | "lg") =>
    avatar ? (
      <span className={size === "sm" ? "text-[16px]" : "text-[20px]"}>{avatar}</span>
    ) : (
      <span className="font-bold text-white">{inits}</span>
    );

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-full p-0.5 pr-1 transition-colors hover:bg-ink/[0.04]"
      >
        <span
          className={
            "flex h-8 w-8 items-center justify-center rounded-full text-[12px] " +
            (avatar ? "bg-coral-50" : "bg-coral-500")
          }
        >
          {avatarFace("sm")}
        </span>
        <span className="hidden max-w-[120px] truncate text-[13px] font-semibold text-ink sm:inline">
          {display}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Profil"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 rounded-2xl border border-ink/8 bg-white p-4 shadow-[0_12px_40px_-8px_rgba(31,29,27,0.18)]"
        >
          <div className="mb-3 flex items-center gap-3">
            <span
              className={
                "flex h-11 w-11 items-center justify-center rounded-full text-sm " +
                (avatar ? "bg-coral-50" : "bg-coral-500")
              }
            >
              {avatarFace("lg")}
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-ink">{display}</div>
              {profile.email && (
                <div className="truncate text-[12px] text-ink/50">{profile.email}</div>
              )}
              {profile.isGuest && (
                <div className="text-[12px] text-ink/50">Mode invité</div>
              )}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-ink/45">
              Nom
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              maxLength={40}
              className="w-full rounded-xl border border-ink/10 bg-cream/40 px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-coral-400"
            />
          </label>

          <div className="mt-3">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink/45">
              Avatar
            </span>
            <div className="grid grid-cols-6 gap-1.5">
              {AVATAR_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setAvatar((cur) => (cur === e ? "" : e))}
                  aria-pressed={avatar === e}
                  className={
                    "flex h-8 w-8 items-center justify-center rounded-lg text-[16px] transition-colors " +
                    (avatar === e
                      ? "bg-coral-100 ring-2 ring-coral-400"
                      : "bg-cream/50 hover:bg-coral-50")
                  }
                >
                  {e}
                </button>
              ))}
            </div>
            <span className="mt-1.5 block text-[11px] text-ink/40">
              {avatar
                ? "Touchez à nouveau pour revenir aux initiales."
                : "Aucun emoji : pastille à initiales."}
            </span>
          </div>

          <label className="mt-3 block">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-ink/45">
              Date du concours
            </span>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full rounded-xl border border-ink/10 bg-cream/40 px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-coral-400"
            />
            {examDate && dLeft >= 0 && (
              <span className="mt-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-coral-600">
                <CalendarDays className="h-3.5 w-3.5" />
                J-{dLeft} avant l'épreuve
              </span>
            )}
          </label>

          <button
            onClick={save}
            disabled={saving}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-coral-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-600 disabled:opacity-60"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>

          {!profile.isGuest && (
            <button
              onClick={logout}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-ink/10 py-2.5 text-sm font-semibold text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink"
            >
              <LogOut className="h-4 w-4" strokeWidth={2.5} />
              Se déconnecter
            </button>
          )}
        </div>
      )}
    </div>
  );
}
