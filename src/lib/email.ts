import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { isGmailOAuthConfigured } from "@/lib/gmail-oauth";
import { sendViaGmailApi } from "@/lib/gmail-send";

const DEFAULT_NOTIFY_EMAIL = "J-rodandJamie@outlook.com";
const WEDDING_NAME = "J-rod & Jamo";
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

type EmailAttachment = {
  filename: string;
  content: string;
  contentType?: string;
};

type SendEmailOptions = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  from?: EmailSender;
  attachments?: EmailAttachment[];
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
  const configured = process.env[envKey] ?? DEFAULT_SENDERS[sender];
  const email =
    configured.match(/<([^>]+)>/)?.[1] ??
    configured.match(/(\S+@\S+)/)?.[1] ??
    DEFAULT_SENDERS[sender].match(/<([^>]+)>/)?.[1];

  return `${WEDDING_NAME} <${email}>`;
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

export function getEmailTransportMode(): "gmail" | "smtp" | "none" {
  if (isGmailOAuthConfigured()) return "gmail";
  if (getSmtpOptions()) return "smtp";
  return "none";
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  from = "notifications",
  attachments = [],
}: SendEmailOptions): Promise<boolean> {
  const recipients = Array.isArray(to) ? to : [to];
  const fromAddress = getSenderAddress(from);

  if (isGmailOAuthConfigured()) {
    const ok = await sendViaGmailApi({
      from: fromAddress,
      to: recipients,
      subject,
      text,
      html,
      attachments,
    });
    if (ok) return true;
    console.warn("[email] Gmail API send failed, trying SMTP fallback if configured");
  }

  const mailer = getTransporter();
  if (!mailer) {
    console.warn(
      "[email] No mail transport configured — connect Gmail (GMAIL_REFRESH_TOKEN) or set SMTP_USER/SMTP_PASS:",
      subject,
    );
    return false;
  }

  try {
    await mailer.sendMail({
      from: fromAddress,
      to: recipients.join(", "),
      subject,
      text,
      html: html ?? textToHtml(text),
      attachments: attachments.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType ?? "application/octet-stream",
      })),
    });
    return true;
  } catch (error) {
    console.error("[email] Failed to send:", error);
    return false;
  }
}

export function getNotificationRecipients(): string[] {
  const raw = process.env.NOTIFY_EMAIL ?? DEFAULT_NOTIFY_EMAIL;
  return raw
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

export async function sendNotificationEmail(
  subject: string,
  text: string,
  html?: string,
): Promise<boolean> {
  const recipients = getNotificationRecipients();
  if (recipients.length === 0) {
    console.warn("[email] NOTIFY_EMAIL is empty — skipping notification:", subject);
    return false;
  }
  return sendEmail({ to: recipients, subject, text, html, from: "notifications" });
}
