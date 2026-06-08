import type { Metadata } from "next";

import { AppHeader } from "../learn/app-header";
import { RechercheSemantique } from "./recherche-semantique";

export const metadata: Metadata = {
  title: "Recherche",
  description: "Recherchez parmi vos questions de révision.",
};

export default function RechercheIaPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
        <RechercheSemantique />
      </main>
    </>
  );
}
