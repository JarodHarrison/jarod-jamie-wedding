import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { listLinkedGoogleAccounts, unlinkGoogleAccountFromGuest } from "@/lib/auth/social-login";
import { isGoogleOAuthConfigured } from "@/lib/auth/google-oauth";
import { requireGuestSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await requireGuestSession();
    const accounts = await listLinkedGoogleAccounts(session.id);
    return NextResponse.json({
      googleEnabled: isGoogleOAuthConfigured(),
      ...accounts,
    });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireGuestSession();
    const email = new URL(request.url).searchParams.get("email")?.trim();
    if (!email) {
      return jsonError("Email is required.", 400);
    }

    await unlinkGoogleAccountFromGuest(session.id, email);
    const accounts = await listLinkedGoogleAccounts(session.id);
    return NextResponse.json({ ok: true, ...accounts });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError(error instanceof Error ? error.message : "Failed to unlink account.", 400);
  }
}
