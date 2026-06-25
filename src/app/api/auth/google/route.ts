import { NextResponse } from "next/server";
import {
  buildGoogleAuthUrl,
  isGoogleOAuthConfigured,
  type GoogleOAuthMode,
} from "@/lib/auth/google-oauth";
import { getGoogleOAuthOrigin } from "@/lib/auth/request-origin";
import { createOAuthState } from "@/lib/auth/oauth-state";
import { getSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(new URL("/?auth_error=google_not_configured", request.url));
  }

  const { searchParams } = new URL(request.url);
  const modeParam = searchParams.get("mode");
  const origin = getGoogleOAuthOrigin(request);

  let mode: GoogleOAuthMode = modeParam === "signup" ? "signup" : "signin";
  let guestId: string | undefined;

  if (modeParam === "link") {
    const session = await getSession();
    if (!session || session.type !== "guest") {
      return NextResponse.redirect(new URL("/?auth_error=google_link_requires_login", origin));
    }
    mode = "link";
    guestId = session.id;
  }

  const state = await createOAuthState(mode, guestId);
  const authUrl = buildGoogleAuthUrl(origin, state, mode);
  return NextResponse.redirect(authUrl);
}
