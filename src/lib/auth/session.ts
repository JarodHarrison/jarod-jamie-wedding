import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { GuestTier } from "@/types/wedding";

export type GuestSession = {
  type: "guest";
  id: string;
  name: string;
  email: string;
  tier: GuestTier;
};

export type AdminSession = {
  type: "admin";
  id: string;
  name: string;
  email: string;
};

export type SessionPayload = GuestSession | AdminSession;

const COOKIE_NAME = "wedding_session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET environment variable is not set");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.type !== "guest" && payload.type !== "admin") return null;
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getSession();
  if (!session || session.type !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

import { syncGuestSessionFromDb } from "@/lib/auth/sync-guest-session";

export async function requireGuestSession(): Promise<GuestSession> {
  const session = await getSession();
  if (!session || session.type !== "guest") {
    throw new Error("Unauthorized");
  }

  const fresh = await syncGuestSessionFromDb(session);
  if (!fresh) {
    throw new Error("Unauthorized");
  }

  return fresh;
}
