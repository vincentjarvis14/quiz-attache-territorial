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
    <Button variant="secondaryOutline" size="lg" onClick={handleGuestLogin}>
      Continuer en invité
    </Button>
  );
}
