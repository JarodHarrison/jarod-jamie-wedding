import { cookies } from "next/headers";
import crypto from "node:crypto";
import type { GoogleOAuthMode } from "@/lib/auth/google-oauth";

const OAUTH_STATE_COOKIE = "google_oauth_state";
const MAX_AGE = 60 * 10;

export function createOAuthState(mode: GoogleOAuthMode) {
  const nonce = crypto.randomBytes(16).toString("hex");
  return Buffer.from(JSON.stringify({ nonce, mode }), "utf8").toString("base64url");
}

export async function setOAuthStateCookie(state: string) {
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function readOAuthStateCookie(): Promise<{ nonce: string; mode: GoogleOAuthMode } | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as {
      nonce?: string;
      mode?: GoogleOAuthMode;
    };
    if (!parsed.nonce || (parsed.mode !== "signin" && parsed.mode !== "signup")) return null;
    return { nonce: parsed.nonce, mode: parsed.mode };
  } catch {
    return null;
  }
}

export async function clearOAuthStateCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(OAUTH_STATE_COOKIE);
}

export function parseOAuthState(state: string) {
  try {
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8")) as {
      nonce?: string;
      mode?: GoogleOAuthMode;
    };
    if (!parsed.nonce || (parsed.mode !== "signin" && parsed.mode !== "signup")) return null;
    return parsed as { nonce: string; mode: GoogleOAuthMode };
  } catch {
    return null;
  }
}

export async function validateOAuthState(state: string | null) {
  if (!state) return null;
  const parsed = parseOAuthState(state);
  const stored = await readOAuthStateCookie();
  await clearOAuthStateCookie();
  if (!parsed || !stored || parsed.nonce !== stored.nonce || parsed.mode !== stored.mode) {
    return null;
  }
  return parsed;
}
