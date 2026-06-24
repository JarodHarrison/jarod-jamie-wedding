import { readFileSync } from "node:fs";

const envPath = process.argv[2] ?? ".env";
const env = readFileSync(envPath, "utf8");
const read = (key) => {
  const quoted = env.match(new RegExp(`^${key}="([^"]*)"`, "m"))?.[1];
  if (quoted !== undefined) return quoted;
  return env.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim();
};
const id = read("GOOGLE_CLIENT_ID");
const secret = read("GOOGLE_CLIENT_SECRET");

if (!id || !secret) {
  console.log(`${envPath}: missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET`);
  process.exit(1);
}

const params = new URLSearchParams({
  code: "test",
  client_id: id,
  client_secret: secret,
  redirect_uri: "https://jarodandjamiewedding.com/api/auth/google/callback",
  grant_type: "authorization_code",
});

const res = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: params,
});

const data = await res.json();
if (data.error === "invalid_client") {
  console.log(`${envPath}: INVALID secret`);
  process.exit(1);
}

if (data.error === "invalid_grant") {
  console.log(`${envPath}: VALID secret`);
  process.exit(0);
}

console.log(`${envPath}: unexpected response`, data.error ?? data);
process.exit(1);
