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

/**
 * True when an "add party member" name can safely attach to an existing guest
 * found by email. Full names with different surnames must not match.
 */
export function guestNamesCompatibleForEmailLink(inputName: string, existingName: string): boolean {
  const input = normalizeGuestName(inputName);
  const existing = normalizeGuestName(existingName);
  if (!input || !existing) return false;
  if (input === existing) return true;

  const inputTokens = guestNameTokens(inputName);
  const existingTokens = guestNameTokens(existingName);
  const inputFirst = inputTokens[0];
  const existingFirst = existingTokens[0];
  if (!inputFirst || inputFirst !== existingFirst) return false;

  const inputSurname = inputTokens.length >= 2 ? inputTokens[inputTokens.length - 1] : null;
  const existingSurname = existingTokens.length >= 2 ? existingTokens[existingTokens.length - 1] : null;
  if (inputSurname && existingSurname && inputSurname !== existingSurname) return false;
  return true;
}
