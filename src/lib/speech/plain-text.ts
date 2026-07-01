const MAX_SPEECH_CHARS = 4000;

const URL_PATTERN = /https?:\/\/[^\s)]+|www\.[^\s)]+/gi;

/** Strip markdown-ish formatting so TTS reads naturally. */
export function plainTextForSpeech(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[Website\]\([^)]+\)/gi, " ")
    .replace(/\[Navigate\]\([^)]+\)/gi, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(URL_PATTERN, " ")
    .replace(/\b(\d+)\s*mins?\b/gi, "$1 minutes")
    .replace(/\b(\d+)\s*min\b/gi, "$1 minutes")
    .replace(/[*_#>~]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_SPEECH_CHARS);
}
