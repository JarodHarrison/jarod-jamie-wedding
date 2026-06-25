import { sendEmail } from "@/lib/email";
import {
  escapeHtml,
  guestInviteEmailHtml,
  guestUpdateEmailHtml,
  guestWelcomeEmailHtml,
  messageBlocksToHtml,
  passwordResetEmailHtml,
} from "@/lib/email-templates";

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://jarod-jamie-wedding-delta.vercel.app";
}

function guestEmailFooter() {
  return `\n\nWith love,\nJarod & Jamie\n26 September 2026 · Spicers Clovelly Estate, Montville QLD\n\n#J-rodandJamo`;
}

export async function sendGuestWelcomeEmail(guest: { name: string; email: string }) {
  const appUrl = getAppUrl();
  const subject = "Welcome! You're in for Jarod & Jamie's wedding";
  const text = `Hi ${guest.name},

Thanks for registering for our wedding weekend. Your guest account is ready.

Open the wedding app anytime to RSVP, plan travel, explore Montville, and chat with Annita Help, our wedding concierge.

${appUrl}${guestEmailFooter()}`;

  return sendEmail({
    to: guest.email,
    subject,
    text,
    html: guestWelcomeEmailHtml(guest.name, appUrl),
    from: "updates",
  });
}

export async function sendGuestInviteEmail(guest: {
  name: string;
  email: string;
  password?: string;
}) {
  const appUrl = getAppUrl();
  const subject = "You're invited to Jarod & Jamie's wedding app";
  const passwordLine = guest.password
    ? `\n\nSign in with:\nEmail: ${guest.email}\nPassword: ${guest.password}\n`
    : `\n\nSign in with your email: ${guest.email}\n`;

  const text = `Hi ${guest.name},

We have created a guest account for you on our wedding app.${passwordLine}

${appUrl}${guestEmailFooter()}`;

  const passwordHtml = guest.password
    ? `<p style="margin:0 0 16px;padding:16px;background:#f7f4ee;border-radius:12px;font-size:14px;"><strong>Sign in with:</strong><br/>Email: ${escapeHtml(guest.email)}<br/>Password: ${escapeHtml(guest.password)}</p>`
    : `<p style="margin:0 0 16px;">Sign in with your email: <strong>${escapeHtml(guest.email)}</strong></p>`;

  return sendEmail({
    to: guest.email,
    subject,
    text,
    html: guestInviteEmailHtml(guest.name, appUrl, passwordHtml),
    from: "updates",
  });
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

If you did not request this, you can safely ignore this email.${guestEmailFooter()}`;

  return sendEmail({
    to: guest.email,
    subject,
    text,
    html: passwordResetEmailHtml(guest.name, guest.resetUrl),
    from: "noreply",
  });
}

export async function sendGuestUpdateEmail(
  guest: { name: string; email: string },
  subject: string,
  message: string,
) {
  const appUrl = getAppUrl();
  const text = `Hi ${guest.name},

${message}

Open the wedding app: ${appUrl}${guestEmailFooter()}`;

  return sendEmail({
    to: guest.email,
    subject,
    text,
    html: guestUpdateEmailHtml(guest.name, messageBlocksToHtml(message), appUrl),
    from: "updates",
  });
}
