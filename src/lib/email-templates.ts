export function encodeMimeHeaderValue(value: string): string {
  if (/^[\x20-\x7E]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function weddingEmailShell(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Jarod &amp; Jamie</title>
</head>
<body style="margin:0;padding:0;background:#f7f4ee;font-family:Georgia,'Times New Roman',serif;color:#2a2723;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ee;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e8e0d4;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 8px;text-align:center;">
              <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#c3a379;font-weight:bold;">Jarod &amp; Jamie</p>
              <p style="margin:8px 0 0;font-size:13px;color:#8a8278;">26 September 2026 · Spicers Clovelly Estate, Montville</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 32px;font-size:15px;line-height:1.65;">${content}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(label: string, href: string): string {
  return `<p style="margin:0 0 24px;text-align:center;">
    <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;background:#2a2723;color:#c3a379;text-decoration:none;border-radius:999px;font-size:12px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;">${escapeHtml(label)}</a>
  </p>`;
}

export function guestWelcomeEmailHtml(name: string, appUrl: string): string {
  return weddingEmailShell(`
    <p style="margin:0 0 16px;">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 16px;">Thanks for registering for our wedding weekend. Your guest account is ready.</p>
    <p style="margin:0 0 24px;">Open the app anytime to RSVP, plan travel, explore Montville, and chat with <strong>Annita Help</strong>, our wedding concierge.</p>
    ${ctaButton("Open the wedding app", appUrl)}
    <p style="margin:0;color:#8a8278;font-size:14px;">With love,<br/>Jarod &amp; Jamie</p>
  `);
}

export function guestInviteEmailHtml(
  name: string,
  appUrl: string,
  passwordBlock: string,
): string {
  return weddingEmailShell(`
    <p style="margin:0 0 16px;">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 16px;">We have created a guest account for you on our wedding app.</p>
    ${passwordBlock}
    ${ctaButton("Open the wedding app", appUrl)}
    <p style="margin:0;color:#8a8278;font-size:14px;">With love,<br/>Jarod &amp; Jamie</p>
  `);
}

export function passwordResetEmailHtml(name: string, resetUrl: string): string {
  return weddingEmailShell(`
    <p style="margin:0 0 16px;">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 16px;">We received a request to reset your password for Jarod &amp; Jamie's wedding app.</p>
    ${ctaButton("Reset password", resetUrl)}
    <p style="margin:0 0 8px;font-size:14px;color:#8a8278;">This link expires in one hour.</p>
    <p style="margin:0;font-size:14px;color:#8a8278;">If you did not request this, you can safely ignore this email.</p>
  `);
}

export function guestUpdateEmailHtml(name: string, messageHtml: string, appUrl: string): string {
  return weddingEmailShell(`
    <p style="margin:0 0 16px;">Hi ${escapeHtml(name)},</p>
    ${messageHtml}
    ${ctaButton("Open the wedding app", appUrl)}
    <p style="margin:0;color:#8a8278;font-size:14px;">With love,<br/>Jarod &amp; Jamie</p>
  `);
}

export function adminGuestEventEmailHtml(title: string, detailLines: string[], adminUrl: string): string {
  const rows = detailLines
    .map(
      (line) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #f0ebe3;font-size:14px;color:#2a2723;">${escapeHtml(line)}</td></tr>`,
    )
    .join("");

  return weddingEmailShell(`
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#c3a379;font-weight:bold;">Admin update</p>
    <p style="margin:0 0 20px;font-size:20px;line-height:1.3;">${escapeHtml(title)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">${rows}</table>
    ${ctaButton("View guest list", adminUrl)}
  `);
}

export function messageBlocksToHtml(message: string): string {
  return message
    .split(/\n{2,}/)
    .map((block) => `<p style="margin:0 0 16px;">${escapeHtml(block).replace(/\n/g, "<br/>")}</p>`)
    .join("");
}
