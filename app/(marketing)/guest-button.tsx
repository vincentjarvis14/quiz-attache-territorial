"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function GuestButton() {
  const router = useRouter();

  const handleGuestLogin = async () => {
    // Crée un ID invité via l'API (qui définit un cookie)
    await fetch("/api/guest", { method: "POST" });
    router.push("/learn");
  };

  return (
    <Button
      size="lg"
      variant="secondaryOutline"
      className="min-w-[200px] text-lg"
      onClick={handleGuestLogin}
    >
      👤 Jouer en invité
    </Button>
  );
}
