/**
 * Gestion du mode invité
 * Stocke un ID unique dans le localStorage pour les utilisateurs sans compte
 */

const GUEST_ID_KEY = "quiz_guest_id";

export function getGuestId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GUEST_ID_KEY);
}

export function createGuestId(): string {
  const id = "guest_" + crypto.randomUUID();
  if (typeof window !== "undefined") {
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  return id;
}

export function getOrCreateGuestId(): string {
  const existing = getGuestId();
  if (existing) return existing;
  return createGuestId();
}

export function clearGuestId(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(GUEST_ID_KEY);
  }
}
