import { NextResponse } from "next/server";
import {
  buildGoogleAuthUrl,
  isGoogleOAuthConfigured,
  type GoogleOAuthMode,
} from "@/lib/auth/google-oauth";
import { createOAuthState, setOAuthStateCookie } from "@/lib/auth/oauth-state";

export async function GET(request: Request) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(new URL("/?auth_error=google_not_configured", request.url));
  }

  const { searchParams } = new URL(request.url);
  const modeParam = searchParams.get("mode");
  const mode: GoogleOAuthMode = modeParam === "signup" ? "signup" : "signin";
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  const state = createOAuthState(mode);
  await setOAuthStateCookie(state);

  const authUrl = buildGoogleAuthUrl(origin, state, mode);
  return NextResponse.redirect(authUrl);
}
