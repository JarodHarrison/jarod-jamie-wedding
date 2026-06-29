import crypto from "node:crypto";
import { getGmailAccessToken } from "@/lib/gmail-oauth";
import { encodeMimeHeaderValue } from "@/lib/email-templates";

type EmailAttachment = {
  filename: string;
  content: string;
  contentType?: string;
};

function encodeRawEmail(raw: string): string {
  return Buffer.from(raw)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function buildAlternativePart(text: string, html?: string): { body: string; contentType: string } {
  if (!html) {
    return {
      contentType: "text/plain; charset=UTF-8",
      body: text,
    };
  }

  const boundary = `alt_${crypto.randomBytes(8).toString("hex")}`;
  const body = [
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    html,
    `--${boundary}--`,
  ].join("\r\n");

  return {
    contentType: `multipart/alternative; boundary="${boundary}"`,
    body,
  };
}

function buildMimeMessage({
  from,
  to,
  subject,
  text,
  html,
  attachments = [],
}: {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: EmailAttachment[];
}) {
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodeMimeHeaderValue(subject)}`,
    "MIME-Version: 1.0",
  ];

  const alternative = buildAlternativePart(text, html);

  if (attachments.length === 0) {
    return [
      ...headers,
      `Content-Type: ${alternative.contentType}`,
      "",
      alternative.body,
    ].join("\r\n");
  }

  const mixedBoundary = `mixed_${crypto.randomBytes(8).toString("hex")}`;
  const parts = [
    ...headers,
    `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
    "",
    `--${mixedBoundary}`,
    `Content-Type: ${alternative.contentType}`,
    "",
    alternative.body,
  ];

  for (const attachment of attachments) {
    const encoded = Buffer.from(attachment.content, "utf8").toString("base64");
    const wrapped = encoded.replace(/.{1,76}/g, "$&\r\n").trim();
    parts.push(
      `--${mixedBoundary}`,
      `Content-Type: ${attachment.contentType ?? "application/octet-stream"}`,
      `Content-Disposition: attachment; filename="${attachment.filename}"`,
      "Content-Transfer-Encoding: base64",
      "",
      wrapped,
    );
  }

  parts.push(`--${mixedBoundary}--`);
  return parts.join("\r\n");
}

export async function sendViaGmailApi({
  from,
  to,
  subject,
  text,
  html,
  attachments = [],
}: {
  from: string;
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  attachments?: EmailAttachment[];
}): Promise<boolean> {
  const accessToken = await getGmailAccessToken();
  if (!accessToken) return false;

  const recipients = Array.isArray(to) ? to : [to];
  const raw = buildMimeMessage({
    from,
    to: recipients.join(", "),
    subject,
    text,
    html,
    attachments,
  });

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: encodeRawEmail(raw) }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("[gmail-send] Failed:", res.status, detail);
    return false;
  }

  return true;
}
