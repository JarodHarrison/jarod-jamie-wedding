import { NextResponse } from "next/server";
import { gmailCallbackHelpHtml, gmailAccessDeniedHtml } from "@/lib/gmail-connect-pages";
import { exchangeGmailCode, validateGmailOAuthState } from "@/lib/gmail-oauth";

function successHtml(senderEmail: string | null, refreshToken: string) {
  const escapedToken = refreshToken.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Gmail connected</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem; color: #2a2723; }
    code, pre { background: #f7f4ee; border: 1px solid #e2d5c4; border-radius: 8px; padding: 0.75rem; display: block; overflow-x: auto; word-break: break-all; }
    h1 { font-size: 1.25rem; }
    ol { line-height: 1.6; }
  </style>
</head>
<body>
  <h1>Gmail connected successfully</h1>
  <p>Signed in as <strong>${senderEmail ?? "your Workspace mailbox"}</strong>.</p>
  <p>Add these environment variables locally and on Vercel, then redeploy:</p>
  <pre>GMAIL_REFRESH_TOKEN="${escapedToken}"
GMAIL_SENDER_EMAIL="${senderEmail ?? "theboys@jarodandjamiewedding.com"}"</pre>
  <ol>
    <li>Copy the values above into <code>.env</code> and Vercel → Settings → Environment Variables.</li>
    <li>Enable the <strong>Gmail API</strong> in Google Cloud Console for this project.</li>
    <li>Paste the redirect URI into Google Cloud Console only — do not open it in your browser.</li>
    <li>To send as <code>updates@</code> or <code>noreply@</code>, add them as <strong>Send mail as</strong> aliases on your primary mailbox in Google Workspace.</li>
  </ol>
  <p><a href="/">← Back to the wedding app</a></p>
</body>
</html>`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    if (oauthError === "access_denied") {
      return new NextResponse(gmailAccessDeniedHtml(url.origin), {
        status: 403,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    return new NextResponse(`Gmail authorization failed: ${oauthError}`, { status: 400 });
  }

  if (!code) {
    return new NextResponse(gmailCallbackHelpHtml(url.origin), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const validated = await validateGmailOAuthState(state);
  if (!validated) {
    return new NextResponse("Invalid or expired OAuth state. Please try connecting again.", {
      status: 400,
    });
  }

  try {
    const origin = url.origin;
    const { refreshToken, senderEmail } = await exchangeGmailCode(origin, code);
    return new NextResponse(successHtml(senderEmail, refreshToken), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gmail connection failed.";
    return new NextResponse(message, { status: 500 });
  }
}
