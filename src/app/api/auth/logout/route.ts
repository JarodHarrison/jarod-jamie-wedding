import { NextResponse } from "next/server";
import { clearSessionCookie, clearSessionOnResponse } from "@/lib/auth/session";

export async function POST() {
  await clearSessionCookie();
  return clearSessionOnResponse(NextResponse.json({ ok: true }));
}
