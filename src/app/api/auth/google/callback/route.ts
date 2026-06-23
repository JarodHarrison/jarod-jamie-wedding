import { NextResponse } from "next/server";
import { exchangeGoogleCode, isGoogleOAuthConfigured } from "@/lib/auth/google-oauth";
import { validateOAuthState } from "@/lib/auth/oauth-state";
import {
  signInWithEmailAccountRedirect,
  signUpWithGoogleAccountRedirect,
} from "@/lib/auth/social-login";
import { notifyRegistration } from "@/lib/registration-notify";
import { sendGuestWelcomeEmail } from "@/lib/guest-emails";
import { guestProfileSelect, serializeGuestProfile } from "@/lib/guest-profile";
import { prisma } from "@/lib/prisma";

function redirectWithError(request: Request, code: string) {
  return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(code)}`, request.url));
}

export async function GET(request: Request) {
  if (!isGoogleOAuthConfigured()) {
    return redirectWithError(request, "google_not_configured");
  }

  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) {
    return redirectWithError(request, "google_denied");
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const parsedState = await validateOAuthState(state);
  if (!code || !parsedState) {
    return redirectWithError(request, "google_state_invalid");
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  try {
    const profile = await exchangeGoogleCode(origin, code);

    if (parsedState.mode === "signup") {
      const guest = await signUpWithGoogleAccountRedirect(profile.email, profile.name);
      const fullGuest = await prisma.guest.findUnique({
        where: { id: guest.id },
        select: guestProfileSelect,
      });
      if (fullGuest) {
        notifyRegistration("signup", serializeGuestProfile(fullGuest));
        void sendGuestWelcomeEmail({ name: fullGuest.name, email: fullGuest.email });
      }
      return NextResponse.redirect(new URL("/?auth=google_signup", request.url));
    }

    const signedIn = await signInWithEmailAccountRedirect(profile.email);
    if (!signedIn) {
      return redirectWithError(request, "google_no_account");
    }

    return NextResponse.redirect(new URL("/?auth=google_signin", request.url));
  } catch (err) {
    console.error("[google/callback]", err);
    const message = err instanceof Error ? err.message : "google_failed";
    if (message.includes("already exists")) {
      return redirectWithError(request, "google_account_exists");
    }
    return redirectWithError(request, "google_failed");
  }
}
