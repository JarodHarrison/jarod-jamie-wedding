import { annitaSpeechRate } from "@/lib/tts/speech-rate";

export function isElevenLabsConfigured() {
  return Boolean(process.env.ELEVENLABS_API_KEY?.trim() && process.env.ELEVENLABS_VOICE_ID?.trim());
}

export async function synthesizeElevenLabsTTS(text: string): Promise<Buffer | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim();
  if (!apiKey || !voiceId) return null;

  const modelId = process.env.ELEVENLABS_MODEL_ID?.trim() ?? "eleven_turbo_v2_5";

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      speed: annitaSpeechRate(),
      voice_settings: {
        stability: 0.35,
        similarity_boost: 0.8,
        style: 0.45,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("[elevenlabs-tts]", res.status, detail.slice(0, 300));
    return null;
  }

  return Buffer.from(await res.arrayBuffer());
}
