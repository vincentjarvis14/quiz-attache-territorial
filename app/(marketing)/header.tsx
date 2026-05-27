"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export const Header = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsSignedIn(!!data.session);
    });
  }, []);

  return (
    <header className="h-20 w-full border-b border-purple-100/60 bg-white/80 backdrop-blur-xl px-4">
      <div className="mx-auto flex h-full items-center justify-between lg:max-w-screen-lg">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 shadow-lg shadow-purple-200">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-emerald-600 bg-clip-text text-transparent">
            Quiz Territorial
          </h1>
        </Link>

        <div className="flex gap-x-3">
          {isSignedIn ? (
            <Link href="/learn">
              <Button size="lg" variant="primaryOutline">
                Tableau de bord
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-in">
                <Button size="lg" variant="ghost">
                  Connexion
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="lg" variant="primary">
                  S'inscrire
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
