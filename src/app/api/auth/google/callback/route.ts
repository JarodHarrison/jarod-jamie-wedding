import { NextResponse } from "next/server";
import { exchangeGoogleCode, isGoogleOAuthConfigured } from "@/lib/auth/google-oauth";
import { getGoogleOAuthOrigin } from "@/lib/auth/request-origin";
import { validateOAuthState } from "@/lib/auth/oauth-state";
import {
  linkGoogleAccountToGuest,
  recordGoogleLoginForGuest,
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
  const origin = getGoogleOAuthOrigin(request);

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

    if (parsedState.mode === "link") {
      await linkGoogleAccountToGuest(parsedState.guestId!, profile.email);
      return NextResponse.redirect(new URL("/?auth=google_linked", origin));
    }

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

    const guest = await prisma.guest.findUnique({
      where: { email: profile.email },
      select: { id: true },
    });
    if (guest) {
      await recordGoogleLoginForGuest(guest.id, profile.email);
    }

    return response;
  } catch (err) {
    console.error("[google/callback]", err);
    const message = err instanceof Error ? err.message : "google_failed";
    if (message.includes("already exists") || message.includes("belongs to another")) {
      return redirectWithError(origin, "google_account_exists");
    }
    if (message.includes("linked to another")) {
      return redirectWithError(origin, "google_link_taken");
    }
    if (message.includes("unclaimed invite")) {
      return redirectWithError(origin, "google_link_unclaimed");
    }
    if (message.includes("already your primary")) {
      return redirectWithError(origin, "google_link_same_email");
    }
    if (message === "invalid_client") {
      return redirectWithError(origin, "google_invalid_client");
    }
    if (message === "redirect_uri_mismatch") {
      return redirectWithError(origin, "google_redirect_mismatch");
    }
    return redirectWithError(origin, "google_failed");
  }
}
