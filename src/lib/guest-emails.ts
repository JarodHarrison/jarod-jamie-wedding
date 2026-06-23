import { sendEmail } from "@/lib/email";

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://jarod-jamie-wedding-delta.vercel.app";
}

function guestEmailFooter() {
  return `\n\nWith love,\nJarod & Jamie\n26 September 2026 · Spicers Clovelly Estate, Montville QLD\n\n#J-rodandJamo`;
}

export async function sendGuestWelcomeEmail(guest: { name: string; email: string }) {
  const appUrl = getAppUrl();
  const subject = "Welcome — you're in for Jarod & Jamie's wedding!";
  const text = `Hi ${guest.name},

Thanks for registering for our wedding weekend! Your guest account is ready.

Open the wedding app anytime to RSVP, plan travel, explore Montville, and chat with Annita Help — our fabulous wedding concierge.

${appUrl}${guestEmailFooter()}`;

  const html = `
    <p>Hi ${guest.name},</p>
    <p>Thanks for registering for our wedding weekend! Your guest account is ready.</p>
    <p>Open the wedding app anytime to RSVP, plan travel, explore Montville, and chat with <strong>Annita Help</strong> — our fabulous wedding concierge.</p>
    <p><a href="${appUrl}">Open the wedding app</a></p>
    <p>With love,<br/>Jarod &amp; Jamie<br/>26 September 2026 · Spicers Clovelly Estate, Montville QLD</p>
  `;

  return sendEmail({ to: guest.email, subject, text, html, from: "updates" });
}

export async function sendGuestInviteEmail(guest: {
  name: string;
  email: string;
  password?: string;
}) {
  const appUrl = getAppUrl();
  const subject = "You're invited — Jarod & Jamie's wedding app";
  const passwordLine = guest.password
    ? `\n\nSign in with:\nEmail: ${guest.email}\nPassword: ${guest.password}\n`
    : `\n\nSign in with your email: ${guest.email}\n`;

  const text = `Hi ${guest.name},

We've created a guest account for you on our wedding app.${passwordLine}

${appUrl}${guestEmailFooter()}`;

  const passwordHtml = guest.password
    ? `<p><strong>Sign in with:</strong><br/>Email: ${guest.email}<br/>Password: ${guest.password}</p>`
    : `<p>Sign in with your email: <strong>${guest.email}</strong></p>`;

  const html = `
    <p>Hi ${guest.name},</p>
    <p>We've created a guest account for you on our wedding app.</p>
    ${passwordHtml}
    <p><a href="${appUrl}">Open the wedding app</a></p>
    <p>With love,<br/>Jarod &amp; Jamie</p>
  `;

  return sendEmail({ to: guest.email, subject, text, html, from: "updates" });
}

export async function sendPasswordResetEmail(guest: {
  name: string;
  email: string;
  resetUrl: string;
}) {
  const subject = "Reset your wedding app password";
  const text = `Hi ${guest.name},

We received a request to reset your password for Jarod & Jamie's wedding app.

Reset your password (link expires in 1 hour):
${guest.resetUrl}

If you didn't request this, you can safely ignore this email.${guestEmailFooter()}`;

  const html = `
    <p>Hi ${guest.name},</p>
    <p>We received a request to reset your password for Jarod &amp; Jamie's wedding app.</p>
    <p><a href="${guest.resetUrl}">Reset your password</a></p>
    <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    <p>With love,<br/>Jarod &amp; Jamie</p>
  `;

  return sendEmail({ to: guest.email, subject, text, html, from: "noreply" });
}

export async function sendGuestUpdateEmail(guest: { name: string; email: string }, subject: string, message: string) {
  const appUrl = getAppUrl();
  const text = `Hi ${guest.name},

${message}

Open the wedding app: ${appUrl}${guestEmailFooter()}`;

  const html = `
    <p>Hi ${guest.name},</p>
    ${message
      .split(/\n{2,}/)
      .map((block) => `<p>${block.replace(/\n/g, "<br/>")}</p>`)
      .join("")}
    <p><a href="${appUrl}">Open the wedding app</a></p>
    <p>With love,<br/>Jarod &amp; Jamie<br/>26 September 2026 · Spicers Clovelly Estate, Montville QLD</p>
  `;

  return sendEmail({ to: guest.email, subject, text, html, from: "updates" });
}
