import { SignJWT, jwtVerify } from "jose";
import crypto from "node:crypto";

export const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";

const STATE_MAX_AGE_SECONDS = 60 * 10;

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET environment variable is not set");
  return new TextEncoder().encode(secret);
}

function readGoogleEnv(name: "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET") {
  const value = process.env[name]?.trim().replace(/^"|"$/g, "");
  return value || undefined;
}

export function isGmailOAuthConfigured() {
  return Boolean(
    readGoogleEnv("GOOGLE_CLIENT_ID") &&
      readGoogleEnv("GOOGLE_CLIENT_SECRET") &&
      process.env.GMAIL_REFRESH_TOKEN?.trim(),
  );
}

export function getGmailRedirectUri(origin: string) {
  return `${origin}/api/admin/gmail/callback`;
}

export async function createGmailOAuthState(): Promise<string> {
  const nonce = crypto.randomBytes(16).toString("hex");
  return new SignJWT({ purpose: "gmail-connect", nonce })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${STATE_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function validateGmailOAuthState(state: string | null) {
  if (!state) return null;

  try {
    const { payload } = await jwtVerify(state, getSecret());
    if (payload.purpose !== "gmail-connect") return null;
    if (typeof payload.nonce !== "string" || !payload.nonce) return null;
    return { nonce: payload.nonce };
  } catch {
    return null;
  }
}

export function buildGmailConnectUrl(origin: string, state: string) {
  const clientId = readGoogleEnv("GOOGLE_CLIENT_ID");
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID not configured");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGmailRedirectUri(origin),
    response_type: "code",
    scope: GMAIL_SEND_SCOPE,
    state,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGmailCode(origin: string, code: string) {
  const clientId = readGoogleEnv("GOOGLE_CLIENT_ID");
  const clientSecret = readGoogleEnv("GOOGLE_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Google OAuth not configured");

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGmailRedirectUri(origin),
      grant_type: "authorization_code",
    }),
  });

  const tokenData = (await tokenRes.json()) as {
    access_token?: string;
    refresh_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenRes.ok || !tokenData.access_token) {
    const detail = tokenData.error_description ?? tokenData.error ?? "token_exchange_failed";
    throw new Error(detail);
  }

  if (!tokenData.refresh_token) {
    throw new Error(
      "Google did not return a refresh token. Revoke app access in your Google account, then connect again.",
    );
  }

  const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const profile = (await profileRes.json()) as { email?: string };

  return {
    refreshToken: tokenData.refresh_token,
    senderEmail: profile.email?.toLowerCase() ?? null,
  };
}

export async function getGmailAccessToken(): Promise<string | null> {
  const clientId = readGoogleEnv("GOOGLE_CLIENT_ID");
  const clientSecret = readGoogleEnv("GOOGLE_CLIENT_SECRET");
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN?.trim();
  if (!clientId || !clientSecret || !refreshToken) return null;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const tokenData = (await tokenRes.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenRes.ok || !tokenData.access_token) {
    console.error(
      "[gmail-oauth] refresh failed:",
      tokenData.error_description ?? tokenData.error ?? tokenRes.status,
    );
    return null;
  }

  return tokenData.access_token;
}
