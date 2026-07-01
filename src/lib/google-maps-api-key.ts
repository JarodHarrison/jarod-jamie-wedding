/**
 * Server-side Google Maps / Places / Directions calls.
 * Prefer GOOGLE_MAPS_API_KEY, then NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
 * Do not use GOOGLE_API_KEY here — that is the Gemini key (AQ.…) and Places will reject it.
 */
export function googleMapsServerApiKey(): string | null {
  const dedicated = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (dedicated) return dedicated;

  const publicMaps = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  if (publicMaps) return publicMaps;

  return null;
}
