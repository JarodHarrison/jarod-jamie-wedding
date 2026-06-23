import { synthesizeElevenLabsTTS, isElevenLabsConfigured } from "@/lib/tts/elevenlabs-tts";
import { synthesizeGoogleTTS } from "@/lib/tts/google-tts";

export type TtsProvider = "elevenlabs" | "google" | "browser";

export function getConfiguredTtsProviders(): TtsProvider[] {
  const providers: TtsProvider[] = ["browser"];
  if (process.env.GOOGLE_API_KEY?.trim()) providers.unshift("google");
  if (isElevenLabsConfigured()) providers.unshift("elevenlabs");
  return providers;
}

export async function synthesizeAnnitaSpeech(
  text: string,
): Promise<{ audio: Buffer; provider: Exclude<TtsProvider, "browser"> } | null> {
  const eleven = await synthesizeElevenLabsTTS(text);
  if (eleven) return { audio: eleven, provider: "elevenlabs" };

  const google = await synthesizeGoogleTTS(text);
  if (google) return { audio: google, provider: "google" };

  return null;
}
