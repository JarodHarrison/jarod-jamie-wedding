import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { jsonError } from "@/lib/api-utils";
import { getEmailTransportMode, sendEmail } from "@/lib/email";
import { isGmailOAuthConfigured } from "@/lib/gmail-oauth";

export async function POST(request: Request) {
  try {
    await requireAdminAccess();

    const body = await request.json().catch(() => ({}));
    const to = (body.to ?? process.env.NOTIFY_EMAIL ?? "theboys@jarodandjamiewedding.com").trim();

    if (!to) {
      return jsonError("No recipient email configured.", 400);
    }

    const mode = getEmailTransportMode();
    if (mode === "none") {
      return jsonError(
        "Email is not configured. Connect Gmail in Guest Updates, or set SMTP credentials.",
        400,
      );
    }

    const subject = "Test email — Jarod & Jamie Wedding app";
    const text = `This is a test email from your wedding app.

Transport: ${mode}${isGmailOAuthConfigured() ? " (Google Workspace OAuth)" : ""}

If you received this, guest welcome emails, invites, and broadcasts are ready to go.

With love,
Jarod & Jamie`;

    const ok = await sendEmail({
      to,
      subject,
      text,
      from: "updates",
    });

    if (!ok) {
      return jsonError("Failed to send test email. Check server logs.", 500);
    }

    return NextResponse.json({
      ok: true,
      to,
      transport: mode,
      message: `Test email sent to ${to} via ${mode}.`,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to send test email.", 500);
  }
}
