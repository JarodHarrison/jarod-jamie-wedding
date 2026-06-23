const MAX_SPEECH_CHARS = 4000;

/** Strip markdown-ish formatting so TTS reads naturally. */
export function plainTextForSpeech(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_#>~]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_SPEECH_CHARS);
}
