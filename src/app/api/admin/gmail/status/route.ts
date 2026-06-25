import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { jsonError } from "@/lib/api-utils";
import { isGmailOAuthConfigured } from "@/lib/gmail-oauth";
import { getEmailTransportMode } from "@/lib/email";

export async function GET() {
  try {
    await requireAdminAccess();

    const googleClientConfigured = Boolean(
      process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim(),
    );

    return NextResponse.json({
      gmailConnected: isGmailOAuthConfigured(),
      googleClientConfigured,
      senderEmail: process.env.GMAIL_SENDER_EMAIL?.trim() || null,
      smtpFallbackConfigured: Boolean(
        process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim(),
      ),
      transport: getEmailTransportMode(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to load email status.", 500);
  }
}
