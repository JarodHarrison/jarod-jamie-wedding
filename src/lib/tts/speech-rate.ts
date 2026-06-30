const DEFAULT_SPEECH_RATE = 1.15;
const MIN_SPEECH_RATE = 0.85;
const MAX_SPEECH_RATE = 1.35;

export function annitaSpeechRate(): number {
  const raw = process.env.ANNITA_SPEECH_RATE?.trim();
  if (!raw) return DEFAULT_SPEECH_RATE;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return DEFAULT_SPEECH_RATE;

  return Math.min(MAX_SPEECH_RATE, Math.max(MIN_SPEECH_RATE, parsed));
}

/** Client-side default — keep in sync with server ANNITA_SPEECH_RATE when possible. */
export const CLIENT_ANNITA_SPEECH_RATE = 1.15;
