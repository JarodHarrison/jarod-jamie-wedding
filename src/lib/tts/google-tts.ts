export async function synthesizeGoogleTTS(text: string): Promise<Buffer | null> {
  const key = process.env.GOOGLE_API_KEY?.trim();
  if (!key) return null;

  const voiceName = process.env.GOOGLE_TTS_VOICE?.trim() ?? "en-AU-Neural2-C";
  const languageCode = voiceName.split("-").slice(0, 2).join("-") || "en-AU";

  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode, name: voiceName },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 1.05,
          pitch: 2,
        },
      }),
    },
  );

  if (!res.ok) return null;

  const data = (await res.json()) as { audioContent?: string };
  if (!data.audioContent) return null;

  return Buffer.from(data.audioContent, "base64");
}
