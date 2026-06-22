import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type DriverSession = {
  type: "driver";
  id: string;
  name: string;
};

const COOKIE_NAME = "driver_session";
const MAX_AGE = 60 * 60 * 12;

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET environment variable is not set");
  return new TextEncoder().encode(secret);
}

export async function createDriverSessionToken(payload: DriverSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifyDriverSessionToken(token: string): Promise<DriverSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.type !== "driver") return null;
    return payload as unknown as DriverSession;
  } catch {
    return null;
  }
}

export async function setDriverSessionCookie(payload: DriverSession): Promise<void> {
  const token = await createDriverSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function clearDriverSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getDriverSession(): Promise<DriverSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyDriverSessionToken(token);
}

export async function requireDriverSession(): Promise<DriverSession> {
  const session = await getDriverSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}
