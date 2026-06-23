import { SignJWT, jwtVerify } from "jose";
import crypto from "node:crypto";
import type { GoogleOAuthMode } from "@/lib/auth/google-oauth";

const MAX_AGE_SECONDS = 60 * 10;

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET environment variable is not set");
  return new TextEncoder().encode(secret);
}

/** Self-contained signed state — works in installed PWAs where OAuth cookies are often lost. */
export async function createOAuthState(mode: GoogleOAuthMode): Promise<string> {
  const nonce = crypto.randomBytes(16).toString("hex");
  return new SignJWT({ mode, nonce })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function validateOAuthState(state: string | null) {
  if (!state) return null;

  try {
    const { payload } = await jwtVerify(state, getSecret());
    const mode = payload.mode;
    if (mode !== "signin" && mode !== "signup") return null;
    if (typeof payload.nonce !== "string" || !payload.nonce) return null;
    return { nonce: payload.nonce, mode };
  } catch {
    return null;
  }
}
