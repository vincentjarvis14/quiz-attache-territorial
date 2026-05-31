"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function GuestButton() {
  const router = useRouter();

  const handleGuestLogin = async () => {
    await fetch("/api/guest", { method: "POST" });
    router.push("/learn");
  };

  return (
    <Button
      variant="ghost"
      size="lg"
      onClick={handleGuestLogin}
      className="text-ink/50 hover:bg-ink/5 hover:text-ink"
    >
      Continuer en invité
    </Button>
  );
}
