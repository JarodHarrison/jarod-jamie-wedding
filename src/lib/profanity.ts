const BLOCKED = [
  "fuck",
  "shit",
  "bitch",
  "cunt",
  "nigger",
  "faggot",
  "retard",
  "whore",
  "slut",
];

export function containsProfanity(text: string): boolean {
  const normalized = text.toLowerCase().replace(/[^a-z\s]/g, " ");
  return BLOCKED.some((word) => {
    const pattern = new RegExp(`\\b${word}\\b`, "i");
    return pattern.test(normalized);
  });
}
