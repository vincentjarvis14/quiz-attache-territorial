import { BottomNav } from "@/components/bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      {/* Espace pour ne pas masquer le contenu derrière la barre d'onglets mobile */}
      <div
        aria-hidden
        className="h-[68px] bg-cream pb-[env(safe-area-inset-bottom)] sm:hidden"
      />
      <BottomNav />
    </>
  );
}
