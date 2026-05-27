"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/learn");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4">
      <div className="mb-8 text-center">
        <div className="mb-4 text-5xl">🔐</div>
        <h1 className="text-2xl font-bold text-slate-800">Connexion</h1>
        <p className="mt-1 text-slate-500">
          Connecte-toi pour continuer ta préparation
        </p>
      </div>

      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-emerald-500 focus:outline-none"
            placeholder="marie@exemple.fr"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-emerald-500 focus:outline-none"
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 py-6 text-lg hover:bg-emerald-600"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Pas encore de compte ?{" "}
        <a href="/sign-up" className="text-emerald-600 hover:underline">
          S&apos;inscrire
        </a>
      </p>
    </div>
  );
}
