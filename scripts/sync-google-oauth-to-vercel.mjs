import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

function parseEnv(path) {
  const env = readFileSync(path, "utf8");
  const get = (key) => {
    const quoted = env.match(new RegExp(`^${key}="([^"]*)"`, "m"))?.[1];
    if (quoted !== undefined) return quoted;
    return env.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim();
  };
  return {
    clientId: get("GOOGLE_CLIENT_ID"),
    clientSecret: get("GOOGLE_CLIENT_SECRET"),
    appUrl: "https://jarodandjamiewedding.com",
  };
}

async function secretIsValid(clientId, clientSecret) {
  const params = new URLSearchParams({
    code: "test",
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: "https://jarodandjamiewedding.com/api/auth/google/callback",
    grant_type: "authorization_code",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const data = await res.json();
  return data.error === "invalid_grant";
}

function vercelEnvAdd(name, value, environment) {
  const result = spawnSync(
    "npx",
    ["vercel", "env", "add", name, environment, "--force", "--yes"],
    {
      input: value,
      encoding: "utf8",
      stdio: ["pipe", "inherit", "inherit"],
      shell: true,
    },
  );
  if (result.status !== 0) {
    throw new Error(`Failed to set ${name} for ${environment}`);
  }
}

const { clientId, clientSecret, appUrl } = parseEnv(".env");
if (!clientId || !clientSecret) {
  console.error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env first.");
  process.exit(1);
}

if (!(await secretIsValid(clientId, clientSecret))) {
  console.error(
    "Google rejected GOOGLE_CLIENT_SECRET (invalid_client). Reset the secret in Google Cloud Console, update .env, then run this again.",
  );
  process.exit(1);
}

console.log("Secret looks valid. Syncing to Vercel production + preview…");
for (const env of ["production", "preview"]) {
  vercelEnvAdd("GOOGLE_CLIENT_ID", clientId, env);
  vercelEnvAdd("GOOGLE_CLIENT_SECRET", clientSecret, env);
  vercelEnvAdd("NEXT_PUBLIC_APP_URL", appUrl.replace(/\/$/, ""), env);
}

console.log("Done. Redeploy production for changes to take effect:");
console.log("  npx vercel deploy --prod");
