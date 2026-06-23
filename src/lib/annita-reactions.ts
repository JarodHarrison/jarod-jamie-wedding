/** Detect gross or inappropriate guest messages — triggers Annita's disgusted face. */
const DISGUSTING_PATTERNS = [
  /\b(poop|poo|shit|turd|feces|faeces|diarrhea|diarrhoea|vomit|puke|barf)\b/i,
  /\b(fart|queef|booger|snot|phlegm|mucus)\b/i,
  /\b(cum|jizz|blowjob|handjob|anal|dildo|porn|hentai|orgasm|masturbat)\w*/i,
  /\b(nude|naked|stripper|onlyfans|nsfw)\b/i,
  /\b(rape|molest|pedo|incest|bestiality)\w*/i,
  /\b(nazi|hitler)\b/i,
  /\b(kill\s+(you|them|him|her)|murder\s+you)\b/i,
];

const DISGUSTING_PHRASES = [
  "eat shit",
  "go die",
  "suck my",
  "eat my",
  "smell like",
  "tastes like ass",
  "piece of shit",
];

export function isDisgustingUserMessage(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return false;

  if (DISGUSTING_PHRASES.some((phrase) => normalized.includes(phrase))) {
    return true;
  }

  return DISGUSTING_PATTERNS.some((pattern) => pattern.test(normalized));
}
