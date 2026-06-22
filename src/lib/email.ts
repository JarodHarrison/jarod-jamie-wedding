const DEFAULT_NOTIFY_EMAIL = "j-rodandjamie@outlook.com";

export async function sendNotificationEmail(subject: string, text: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL ?? DEFAULT_NOTIFY_EMAIL;

  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — notification skipped:", subject);
    return false;
  }

  const from = process.env.EMAIL_FROM ?? "Jarod & Jamie Wedding <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[email] Failed to send:", err);
    return false;
  }

  return true;
}
