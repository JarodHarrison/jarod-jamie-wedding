import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { resolveLinkedGuestSession } from "@/lib/auth/linked-guest";
import { syncGuestSessionFromDb } from "@/lib/auth/sync-guest-session";
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

export { COOKIE_NAME };

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: MAX_AGE,
    path: "/",
  };
}

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
  cookieStore.set(COOKIE_NAME, token, sessionCookieOptions());
}

export async function createSessionCookieValue(payload: SessionPayload): Promise<string> {
  return createSessionToken(payload);
}

export function applySessionCookie(
  response: { cookies: { set: (name: string, value: string, options: ReturnType<typeof sessionCookieOptions>) => void } },
  token: string,
) {
  response.cookies.set(COOKIE_NAME, token, sessionCookieOptions());
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", { ...sessionCookieOptions(), maxAge: 0 });
}

/** Clear the session cookie on a route response (reliable for fetch-based logout). */
export function clearSessionOnResponse(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
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

export async function requireGuestSession(): Promise<GuestSession> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  if (session.type === "guest") {
    const fresh = await syncGuestSessionFromDb(session);
    if (!fresh) {
      throw new Error("Unauthorized");
    }
    return fresh;
  }

  const linked = await resolveLinkedGuestSession(session.id);
  if (linked) {
    return linked;
  }

  throw new Error("Unauthorized");
}
