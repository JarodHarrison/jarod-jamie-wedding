import { SignJWT, jwtVerify } from "jose";

const DRIVE_FILE_SCOPE = "https://www.googleapis.com/auth/drive.file";

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET environment variable is not set");
  return new TextEncoder().encode(secret);
}

export async function createDriveOAuthState(): Promise<string> {
  return new SignJWT({ purpose: "drive-connect" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(getSecret());
}

export async function validateDriveOAuthState(state: string | null) {
  if (!state) return null;
  try {
    const { payload } = await jwtVerify(state, getSecret());
    if (payload.purpose !== "drive-connect") return null;
    return true;
  } catch {
    return null;
  }
}

export async function exchangeDriveCode(origin: string, code: string) {
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
      redirect_uri: getDriveRedirectUri(origin),
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
    throw new Error(tokenData.error_description ?? tokenData.error ?? "token_exchange_failed");
  }

  if (!tokenData.refresh_token) {
    throw new Error(
      "Google did not return a refresh token. Revoke app access and connect Drive again.",
    );
  }

  return { refreshToken: tokenData.refresh_token };
}

function readGoogleEnv(name: "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET") {
  const value = process.env[name]?.trim().replace(/^"|"$/g, "");
  return value || undefined;
}

export function isGoogleDriveConfigured() {
  return Boolean(
    readGoogleEnv("GOOGLE_CLIENT_ID") &&
      readGoogleEnv("GOOGLE_CLIENT_SECRET") &&
      process.env.GOOGLE_DRIVE_REFRESH_TOKEN?.trim(),
  );
}

export function getDriveRedirectUri(origin: string) {
  return `${origin}/api/admin/drive/callback`;
}

export function buildDriveConnectUrl(origin: string, state: string) {
  const clientId = readGoogleEnv("GOOGLE_CLIENT_ID");
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID not configured");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getDriveRedirectUri(origin),
    response_type: "code",
    scope: DRIVE_FILE_SCOPE,
    state,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function getDriveAccessToken(): Promise<string | null> {
  const clientId = readGoogleEnv("GOOGLE_CLIENT_ID");
  const clientSecret = readGoogleEnv("GOOGLE_CLIENT_SECRET");
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN?.trim();
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
      "[google-drive] refresh failed:",
      tokenData.error_description ?? tokenData.error ?? tokenRes.status,
    );
    return null;
  }

  return tokenData.access_token;
}

export async function uploadGuestPhotoToDrive({
  fileName,
  mime,
  buffer,
  guestName,
  guestEmail,
  caption,
}: {
  fileName: string;
  mime: string;
  buffer: Buffer;
  guestName: string;
  guestEmail: string;
  caption?: string | null;
}) {
  const accessToken = await getDriveAccessToken();
  if (!accessToken) return null;

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
  const description = [
    `Posted by ${guestName}`,
    `Guest email: ${guestEmail}`,
    caption ? `Caption: ${caption}` : null,
    `Uploaded via Jarod & Jamie Wedding app`,
  ]
    .filter(Boolean)
    .join("\n");

  const metadata: Record<string, unknown> = {
    name: fileName,
    description,
    mimeType: mime,
  };
  if (folderId) metadata.parents = [folderId];

  const boundary = `wedding_drive_${Date.now()}`;
  const body = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
    ),
    Buffer.from(`--${boundary}\r\nContent-Type: ${mime}\r\n\r\n`),
    buffer,
    Buffer.from(`\r\n--${boundary}--`),
  ]);

  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  const data = (await res.json()) as { id?: string; error?: { message?: string } };
  if (!res.ok || !data.id) {
    console.error("[google-drive] upload failed:", data.error?.message ?? res.status);
    return null;
  }

  return data.id;
}
