export { isElevenLabsConfigured, synthesizeElevenLabsTTS } from "@/lib/tts/elevenlabs-tts";
import { synthesizeElevenLabsTTS, isElevenLabsConfigured } from "@/lib/tts/elevenlabs-tts";
import { synthesizeGoogleTTS } from "@/lib/tts/google-tts";
import { readCachedTtsAudio, ttsTextHash, writeCachedTtsAudio } from "@/lib/tts/tts-cache";

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
  const hash = ttsTextHash(text);
  const cached = await readCachedTtsAudio(hash);
  if (cached) {
    return {
      audio: cached.audio,
      provider: cached.provider as Exclude<TtsProvider, "browser">,
    };
  }

  const eleven = await synthesizeElevenLabsTTS(text);
  if (eleven) {
    await writeCachedTtsAudio(hash, eleven, "elevenlabs");
    return { audio: eleven, provider: "elevenlabs" };
  }

  const google = await synthesizeGoogleTTS(text);
  if (google) {
    await writeCachedTtsAudio(hash, google, "google");
    return { audio: google, provider: "google" };
  }

  return null;
}
