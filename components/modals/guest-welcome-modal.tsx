"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, X, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "guest_welcome_seen";

export function GuestWelcomeModal({ isGuest }: { isGuest: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isGuest) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    setIsOpen(true);
  }, [isGuest]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={dismiss}
          />

          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md rounded-t-2xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl sm:mx-4 sm:rounded-2xl sm:pb-6"
          >
            <button
              onClick={dismiss}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <ShieldAlert className="h-6 w-6 text-amber-500" />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-800">
              Vous progressez en mode invité
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Votre progression est enregistrée uniquement sur ce navigateur.
              Si vous changez d&apos;appareil ou effacez vos données de
              navigation, elle sera perdue. Créez un compte gratuit pour la
              sauvegarder et la retrouver partout.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <Link href="/sign-up" onClick={dismiss}>
                <Button variant="primary" size="lg" className="w-full">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Créer un compte gratuit
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="lg"
                className="w-full text-slate-500"
                onClick={dismiss}
              >
                Continuer en invité
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
