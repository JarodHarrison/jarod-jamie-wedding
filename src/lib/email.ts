import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

const DEFAULT_NOTIFY_EMAIL = "j-rodandjamie@outlook.com";
const WEDDING_NAME = "Jarod & Jamie Wedding";
const DOMAIN = "jarodandjamiewedding.com";

/** notifications@ — admin alerts when guests register or update forms */
/** updates@ — guest-facing announcements and invites from the couple */
/** noreply@ — automated password reset emails */
export type EmailSender = "notifications" | "updates" | "noreply";

const DEFAULT_SENDERS: Record<EmailSender, string> = {
  notifications: `${WEDDING_NAME} <notifications@${DOMAIN}>`,
  updates: `${WEDDING_NAME} <updates@${DOMAIN}>`,
  noreply: `${WEDDING_NAME} <noreply@${DOMAIN}>`,
};

type SendEmailOptions = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  from?: EmailSender;
};

function getSmtpOptions(): SMTPTransport.Options | null {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!user || !pass) return null;

  const port = Number(process.env.SMTP_PORT ?? "587");

  return {
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user, pass },
  };
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  const options = getSmtpOptions();
  if (!options) return null;
  transporter ??= nodemailer.createTransport(options);
  return transporter;
}

export function getSenderAddress(sender: EmailSender): string {
  const envKey = `EMAIL_FROM_${sender.toUpperCase()}` as
    | "EMAIL_FROM_NOTIFICATIONS"
    | "EMAIL_FROM_UPDATES"
    | "EMAIL_FROM_NOREPLY";
  return process.env[envKey] ?? DEFAULT_SENDERS[sender];
}

/** @deprecated Use getSenderAddress with a specific EmailSender */
export function getEmailFromAddress() {
  return process.env.EMAIL_FROM ?? getSenderAddress("notifications");
}

export function textToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  from = "notifications",
}: SendEmailOptions): Promise<boolean> {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn("[email] SMTP_USER/SMTP_PASS not set — email skipped:", subject);
    return false;
  }

  const recipients = Array.isArray(to) ? to : [to];

  try {
    await mailer.sendMail({
      from: getSenderAddress(from),
      to: recipients.join(", "),
      subject,
      text,
      html: html ?? textToHtml(text),
    });
    return true;
  } catch (error) {
    console.error("[email] Failed to send:", error);
    return false;
  }
}

export async function sendNotificationEmail(subject: string, text: string): Promise<boolean> {
  const to = process.env.NOTIFY_EMAIL ?? DEFAULT_NOTIFY_EMAIL;
  return sendEmail({ to, subject, text, from: "notifications" });
}
