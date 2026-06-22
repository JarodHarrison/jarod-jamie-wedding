const DEFAULT_NOTIFY_EMAIL = "j-rodandjamie@outlook.com";

type SendEmailOptions = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
};

export function getEmailFromAddress() {
  return process.env.EMAIL_FROM ?? "Jarod & Jamie Wedding <onboarding@resend.dev>";
}

export async function sendEmail({ to, subject, text, html }: SendEmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — email skipped:", subject);
    return false;
  }

  const recipients = Array.isArray(to) ? to : [to];

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getEmailFromAddress(),
      to: recipients,
      subject,
      text,
      ...(html ? { html } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[email] Failed to send:", err);
    return false;
  }

  return true;
}

export async function sendNotificationEmail(subject: string, text: string): Promise<boolean> {
  const to = process.env.NOTIFY_EMAIL ?? DEFAULT_NOTIFY_EMAIL;
  return sendEmail({ to, subject, text });
}
