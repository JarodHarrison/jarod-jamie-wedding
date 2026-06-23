export type GoogleOAuthMode = "signin" | "signup";

export function isGoogleOAuthConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function getGoogleRedirectUri(origin: string) {
  return `${origin}/api/auth/google/callback`;
}

export function buildGoogleAuthUrl(origin: string, state: string, mode: GoogleOAuthMode) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID not configured");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleRedirectUri(origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: mode === "signup" ? "consent select_account" : "select_account",
    access_type: "online",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(origin: string, code: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Google OAuth not configured");

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGoogleRedirectUri(origin),
      grant_type: "authorization_code",
    }),
  });

  const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(tokenData.error ?? "Failed to exchange Google authorization code.");
  }

  const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const profile = (await profileRes.json()) as {
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };

  if (!profileRes.ok || !profile.email) {
    throw new Error("Failed to load Google profile.");
  }

  if (!profile.email_verified) {
    throw new Error("Your Google email must be verified.");
  }

  return {
    email: profile.email.toLowerCase(),
    name: profile.name?.trim() || profile.email.split("@")[0] || "Guest",
  };
}
