export function normalizeGuestName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function guestNameTokens(name: string): string[] {
  return normalizeGuestName(name).split(" ").filter(Boolean);
}

/** Prefer the fuller display name when one is first-name-only or missing a surname. */
export function preferFullerGuestName(existing: string, candidate: string): string {
  const existingTokens = guestNameTokens(existing);
  const candidateTokens = guestNameTokens(candidate);
  if (existingTokens.length === 0) return candidate.trim() || existing;
  if (candidateTokens.length === 0) return existing;
  if (existingTokens[0] !== candidateTokens[0]) return existing;
  if (candidateTokens.length > existingTokens.length) return candidate.trim();
  return existing;
}

export function namesShareFirstName(a: string, b: string): boolean {
  const left = guestNameTokens(a)[0];
  const right = guestNameTokens(b)[0];
  return Boolean(left && right && left === right);
}
