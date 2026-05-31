import { cookies } from "next/headers";
import { createSupabaseServerClient } from "./supabase-server";

export async function auth(): Promise<string | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (data.user?.id) return data.user.id;
  } catch {
    // Supabase indisponible — on tente le fallback invité
  }

  try {
    const cookieStore = await cookies();
    const guestId = cookieStore.get("guest_id")?.value;
    if (guestId) return guestId;
  } catch {
    // Cookie store indisponible
  }

  return null;
}

export async function getUser() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    return data.user || null;
  } catch {
    return null;
  }
}
