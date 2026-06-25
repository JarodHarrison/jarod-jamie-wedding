import { NextResponse } from "next/server";
import { exchangeDriveCode, validateDriveOAuthState } from "@/lib/google-drive";

function successHtml(refreshToken: string) {
  const escaped = refreshToken.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Google Drive connected</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem; color: #2a2723; }
    pre { background: #f7f4ee; border: 1px solid #e2d5c4; border-radius: 8px; padding: 0.75rem; overflow-x: auto; word-break: break-all; }
  </style>
</head>
<body>
  <h1>Google Drive connected</h1>
  <p>Add these to Vercel and redeploy:</p>
  <pre>GOOGLE_DRIVE_REFRESH_TOKEN="${escaped}"
GOOGLE_DRIVE_FOLDER_ID="your-folder-id-from-drive-url"</pre>
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
    return new NextResponse(`Google Drive authorization failed: ${oauthError}`, { status: 403 });
  }

  if (!code || !(await validateDriveOAuthState(state))) {
    return new NextResponse("Invalid or expired OAuth state. Please try connecting again.", {
      status: 400,
    });
  }

  try {
    const { refreshToken } = await exchangeDriveCode(url.origin, code);
    return new NextResponse(successHtml(refreshToken), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Drive connection failed.";
    return new NextResponse(message, { status: 500 });
  }
}
