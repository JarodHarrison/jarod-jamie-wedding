function gmailPage(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem; color: #2a2723; line-height: 1.5; }
    code { background: #f7f4ee; border: 1px solid #e2d5c4; border-radius: 6px; padding: 0.1rem 0.35rem; font-size: 0.9em; }
    pre { background: #f7f4ee; border: 1px solid #e2d5c4; border-radius: 8px; padding: 0.75rem; overflow-x: auto; }
    a.button { display: inline-block; margin-top: 1rem; padding: 0.75rem 1.25rem; background: #2a2723; color: #c3a379; text-decoration: none; border-radius: 999px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
    h1 { font-size: 1.25rem; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${body}
</body>
</html>`;
}

export function gmailCallbackHelpHtml(origin: string) {
  return gmailPage(
    "Start Gmail connection",
    `<p>This page is only used <strong>after</strong> Google redirects you back from sign-in. Don&apos;t open it directly.</p>
     <p>To connect email:</p>
     <ol>
       <li>Sign in to the wedding app as <strong>admin</strong>.</li>
       <li>Open <strong>Admin → Guest Updates</strong>.</li>
       <li>Click <strong>Connect Gmail</strong> (not this URL).</li>
       <li>Sign in as <code>theboys@jarodandjamiewedding.com</code> when Google asks.</li>
     </ol>
     <p>For Google Cloud Console only — paste this redirect URI (don&apos;t click it):</p>
     <pre>${origin}/api/admin/gmail/callback</pre>
     <a class="button" href="${origin}/api/admin/gmail/connect">Connect Gmail</a>
     <p style="margin-top:1rem"><a href="${origin}/">← Back to wedding app</a></p>`,
  );
}

export function gmailConnectUnauthorizedHtml(origin: string) {
  return gmailPage(
    "Sign in as admin first",
    `<p>You need to be signed in as an admin before connecting Gmail.</p>
     <ol>
       <li>Open the wedding app and sign in with your admin account.</li>
       <li>Go to <strong>Admin → Guest Updates</strong>.</li>
       <li>Click <strong>Connect Gmail</strong>.</li>
     </ol>
     <a class="button" href="${origin}/">Sign in to wedding app</a>`,
  );
}

export function gmailAccessDeniedHtml(origin: string) {
  return gmailPage(
    "Google blocked Gmail access",
    `<p>Google returned <code>access_denied</code>. The app code and redirect URI look correct — this is almost always a Google Cloud Console setting.</p>
     <h2 style="font-size:1rem;margin-top:1.5rem">Fix in Google Cloud Console</h2>
     <p>Open <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noopener">OAuth consent screen</a> for the project that owns client <code>511812132544-…</code>:</p>
     <ol>
       <li><strong>Enable Gmail API</strong> — APIs &amp; Services → Library → Gmail API → Enable.</li>
       <li><strong>Add the Gmail scope</strong> — OAuth consent screen → Edit app → Scopes → Add <code>…/auth/gmail.send</code>.</li>
       <li><strong>Add yourself as a test user</strong> — OAuth consent screen → Test users → Add <code>theboys@jarodandjamiewedding.com</code> (and any Google account you sign in with). Required while the app is in <em>Testing</em> — <code>gmail.send</code> is a restricted scope.</li>
       <li><strong>Or set User type to Internal</strong> — if this GCP project is under your Workspace org, choose Internal so any <code>@jarodandjamiewedding.com</code> user can authorize without test-user limits.</li>
       <li><strong>Add redirect URI</strong> — Credentials → your OAuth client → Authorized redirect URIs:
         <pre>${origin}/api/admin/gmail/callback</pre>
       </li>
       <li><strong>Workspace admin</strong> — if you use Google Workspace, an admin may need to allow third-party app access for this OAuth client under Admin → Security → API controls.</li>
     </ol>
     <p>Then sign in as <code>theboys@jarodandjamiewedding.com</code> (not a personal Gmail) and click Allow on the consent screen.</p>
     <a class="button" href="${origin}/api/admin/gmail/connect">Try Connect Gmail again</a>
     <p style="margin-top:1rem"><a href="${origin}/">← Back to wedding app</a></p>`,
  );
}
