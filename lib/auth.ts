import { cookies } from "next/headers";
import { supabase } from "./supabase";

/**
 * Récupère l'ID de l'utilisateur connecté via Supabase Auth ou le cookie invité.
 * Retourne null si non connecté.
 */
export async function auth(): Promise<string | null> {
  try {
    // 1. Essayer Supabase Auth
    const { data } = await supabase.auth.getSession();
    if (data.session?.user?.id) {
      return data.session.user.id;
    }

    // 2. Essayer le cookie invité
    const cookieStore = await cookies();
    const guestId = cookieStore.get("guest_id")?.value;
    if (guestId) {
      return guestId;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Récupère l'utilisateur connecté complet.
 */
export async function getUser() {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user || null;
  } catch {
    return null;
  }
}
