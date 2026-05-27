import { NextResponse } from "next/server";

export async function POST() {
  const guestId = "guest_" + crypto.randomUUID();

  const response = NextResponse.json({ guestId });

  response.cookies.set("guest_id", guestId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 jours
    httpOnly: false,
    sameSite: "lax",
  });

  return response;
}
