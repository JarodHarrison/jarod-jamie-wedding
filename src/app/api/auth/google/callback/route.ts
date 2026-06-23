import { NextResponse } from "next/server";
import { exchangeGoogleCode, isGoogleOAuthConfigured } from "@/lib/auth/google-oauth";
import { getRequestOrigin } from "@/lib/auth/request-origin";
import { validateOAuthState } from "@/lib/auth/oauth-state";
import {
  signInWithEmailAccountRedirect,
  signUpWithGoogleAccountRedirect,
} from "@/lib/auth/social-login";
import { notifyRegistration } from "@/lib/registration-notify";
import { sendGuestWelcomeEmail } from "@/lib/guest-emails";
import { guestProfileSelect, serializeGuestProfile } from "@/lib/guest-profile";
import { prisma } from "@/lib/prisma";

function redirectWithError(origin: string, code: string) {
  return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(code)}`, origin));
}

export async function GET(request: Request) {
  const origin = getRequestOrigin(request);

  if (!isGoogleOAuthConfigured()) {
    return redirectWithError(origin, "google_not_configured");
  }

  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) {
    return redirectWithError(origin, "google_denied");
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const parsedState = await validateOAuthState(state);
  if (!code || !parsedState) {
    return redirectWithError(origin, "google_state_invalid");
  }

  try {
    const profile = await exchangeGoogleCode(origin, code);

    if (parsedState.mode === "signup") {
      const response = await signUpWithGoogleAccountRedirect(
        profile.email,
        profile.name,
        new URL("/?auth=google_signup", origin),
      );
      const fullGuest = await prisma.guest.findUnique({
        where: { email: profile.email },
        select: guestProfileSelect,
      });
      if (fullGuest) {
        notifyRegistration("signup", serializeGuestProfile(fullGuest));
        void sendGuestWelcomeEmail({ name: fullGuest.name, email: fullGuest.email });
      }
      return response;
    }

    const response = await signInWithEmailAccountRedirect(
      profile.email,
      new URL("/?auth=google_signin", origin),
    );
    if (!response) {
      return redirectWithError(origin, "google_no_account");
    }

    return response;
  } catch (err) {
    console.error("[google/callback]", err);
    const message = err instanceof Error ? err.message : "google_failed";
    if (message.includes("already exists")) {
      return redirectWithError(origin, "google_account_exists");
    }
    return redirectWithError(origin, "google_failed");
  }
}
