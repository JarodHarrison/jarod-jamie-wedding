import { readFileSync } from "node:fs";

const env = readFileSync(".env", "utf8");
const key = env.match(/^GOOGLE_API_KEY="([^"]+)"/m)?.[1];
const model = env.match(/^GEMINI_MODEL="([^"]+)"/m)?.[1] ?? "gemini-2.0-flash-lite";

if (!key) {
  console.log("NO_KEY");
  process.exit(1);
}

const models = [
  model,
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

let lastError = "unknown";

for (const candidate of [...new Set(models)]) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${candidate}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Reply with exactly: Annita is live" }] }],
        generationConfig: { maxOutputTokens: 32 },
      }),
    },
  );

  const data = await res.json();
  if (res.ok) {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    console.log("OK", candidate, text.slice(0, 80));
    process.exit(0);
  }

  lastError = `${candidate}: ${res.status} ${data.error?.message ?? "error"}`;
  console.log("TRY", lastError.slice(0, 120));
}

console.log("FAIL", lastError);
process.exit(1);
