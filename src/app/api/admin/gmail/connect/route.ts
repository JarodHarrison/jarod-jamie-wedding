import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { jsonError } from "@/lib/api-utils";
import { gmailConnectUnauthorizedHtml } from "@/lib/gmail-connect-pages";
import { buildGmailConnectUrl, createGmailOAuthState } from "@/lib/gmail-oauth";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  try {
    await requireAdminAccess();

    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    if (!clientId) {
      return jsonError("GOOGLE_CLIENT_ID is not configured.", 500);
    }

    const state = await createGmailOAuthState();
    const url = buildGmailConnectUrl(origin, state);

    return NextResponse.redirect(url);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return new NextResponse(gmailConnectUnauthorizedHtml(origin), {
        status: 401,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    return jsonError("Failed to start Gmail connection.", 500);
  }
}
