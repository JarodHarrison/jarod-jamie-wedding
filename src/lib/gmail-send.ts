import crypto from "node:crypto";
import { getGmailAccessToken } from "@/lib/gmail-oauth";
import { encodeMimeHeaderValue } from "@/lib/email-templates";

function encodeRawEmail(raw: string): string {
  return Buffer.from(raw)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function buildMimeMessage({
  from,
  to,
  subject,
  text,
  html,
}: {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  if (!html) {
    return [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${encodeMimeHeaderValue(subject)}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: 8bit",
      "",
      text,
    ].join("\r\n");
  }

  const boundary = `wedding_${crypto.randomBytes(8).toString("hex")}`;
  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodeMimeHeaderValue(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
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
}

export async function sendViaGmailApi({
  from,
  to,
  subject,
  text,
  html,
}: {
  from: string;
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
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
