import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sendEmail } from "../src/lib/email";

function loadEnvFile(path: string) {
  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

async function main() {
  const envFile = process.argv[2] ?? ".env.vercel.production";
  loadEnvFile(resolve(process.cwd(), envFile));

  const to = process.argv[3] ?? process.env.NOTIFY_EMAIL ?? "theboys@jarodandjamiewedding.com";

  const ok = await sendEmail({
    to,
    subject: "Test email — Jarod & Jamie Wedding app is live",
    text: `Hi!

This is a test from your wedding app at jarodandjamiewedding.com.

Gmail API + OAuth is working. Guest welcome emails, invites, and broadcasts are ready.

With love,
Jarod & Jamie`,
    from: "updates",
  });

  if (!ok) {
    console.error("Failed to send test email.");
    process.exit(1);
  }

  console.log(`Test email sent to ${to}`);
}

void main();
