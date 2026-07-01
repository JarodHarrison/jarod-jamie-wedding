/** Opens the guest's maps app with driving directions (Google Maps on iOS/Android/desktop). */
export function buildMapsDirectionsUrl(args: {
  name: string;
  latitude?: number | null;
  longitude?: number | null;
}): string {
  if (
    typeof args.latitude === "number" &&
    typeof args.longitude === "number" &&
    Number.isFinite(args.latitude) &&
    Number.isFinite(args.longitude)
  ) {
    return `https://www.google.com/maps/dir/?api=1&destination=${args.latitude},${args.longitude}`;
  }

  const query = encodeURIComponent(`${args.name}, Sunshine Coast QLD`);
  return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
}
