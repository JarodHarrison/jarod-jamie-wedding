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
 * Claim fallback for imported guests when the signup name is only a first name.
 * A full name with a different surname must not take over another guest's row.
 */
export function findUniqueFirstNameGuest<T extends { name: string }>(
  signupName: string,
  candidates: T[],
): T | null {
  const tokens = guestNameTokens(signupName);
  if (tokens.length !== 1) return null;

  const firstName = tokens[0];
  if (firstName.length < 3) return null;

  const matches = candidates.filter((guest) => {
    const guestNorm = normalizeGuestName(guest.name);
    return guestNorm.startsWith(`${firstName} `) || guestNorm === firstName;
  });

  return matches.length === 1 ? matches[0] : null;
}
