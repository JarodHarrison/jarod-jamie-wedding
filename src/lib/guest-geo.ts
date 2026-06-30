import { HINTERLAND_ACCOMMODATIONS } from "@/lib/hinterland-accommodations";

export type GeoPoint = { latitude: number; longitude: number };

export const SPICERS_CLOVELLY_COORDINATES: GeoPoint = {
  latitude: -26.691,
  longitude: 152.892,
};

/** Sunshine Coast + hinterland — guests inside this box get distances from their location. */
const REGION_BOUNDS = {
  minLat: -27.12,
  maxLat: -26.02,
  minLng: 152.45,
  maxLng: 153.15,
};

const TOWN_CENTROIDS: Record<string, GeoPoint> = {
  montville: { latitude: -26.696, longitude: 152.881 },
  maleny: { latitude: -26.758, longitude: 152.852 },
  mapleton: { latitude: -26.631, longitude: 152.863 },
  palmwoods: { latitude: -26.689, longitude: 152.961 },
  flaxton: { latitude: -26.672, longitude: 152.916 },
  yandina: { latitude: -26.561, longitude: 152.959 },
  nambour: { latitude: -26.627, longitude: 152.959 },
  buderim: { latitude: -26.685, longitude: 153.057 },
  maroochydore: { latitude: -26.65, longitude: 153.1 },
  mooloolaba: { latitude: -26.682, longitude: 153.118 },
  noosa: { latitude: -26.384, longitude: 153.09 },
};

export type GuestGeoContext = {
  origin: GeoPoint;
  /** Human label for distance lines, e.g. "your stay in Maleny" */
  originLabel: string;
  /** True when distances are from the guest (in-region GPS or hinterland stay). */
  fromGuest: boolean;
};

export function isInSunshineCoastHinterland(point: GeoPoint): boolean {
  return (
    point.latitude >= REGION_BOUNDS.minLat &&
    point.latitude <= REGION_BOUNDS.maxLat &&
    point.longitude >= REGION_BOUNDS.minLng &&
    point.longitude <= REGION_BOUNDS.maxLng
  );
}

function townFromAddress(address: string | null | undefined): string | null {
  if (!address) return null;
  const lower = address.toLowerCase();
  for (const town of Object.keys(TOWN_CENTROIDS)) {
    if (lower.includes(town)) return town;
  }
  return null;
}

function coordsFromAccommodation(
  accommodationAddress: string | null | undefined,
  accommodationName: string | null | undefined,
): GeoPoint | null {
  const address = accommodationAddress?.trim() ?? "";
  const name = accommodationName?.trim() ?? "";

  if (name || address) {
    const match = HINTERLAND_ACCOMMODATIONS.find(
      (item) =>
        (name && item.name.toLowerCase() === name.toLowerCase()) ||
        (address && item.address.toLowerCase() === address.toLowerCase()),
    );
    if (match) {
      const town = TOWN_CENTROIDS[match.town.toLowerCase()];
      if (town) return town;
    }
  }

  const townKey = townFromAddress(address);
  if (townKey && TOWN_CENTROIDS[townKey]) return TOWN_CENTROIDS[townKey];

  return null;
}

export function resolveGuestGeoContext(args: {
  clientLatitude?: number | null;
  clientLongitude?: number | null;
  accommodationAddress?: string | null;
  accommodationName?: string | null;
  guestTier?: string | null;
}): GuestGeoContext {
  const spicers = SPICERS_CLOVELLY_COORDINATES;

  if (
    typeof args.clientLatitude === "number" &&
    typeof args.clientLongitude === "number" &&
    Number.isFinite(args.clientLatitude) &&
    Number.isFinite(args.clientLongitude)
  ) {
    const client = { latitude: args.clientLatitude, longitude: args.clientLongitude };
    if (isInSunshineCoastHinterland(client)) {
      return {
        origin: client,
        originLabel: "where you are",
        fromGuest: true,
      };
    }
  }

  const onSite = args.guestTier === "ON_SITE" || args.guestTier === "PENTHOUSE";
  if (onSite) {
    return {
      origin: spicers,
      originLabel: "Spicers Clovelly Estate",
      fromGuest: true,
    };
  }

  const stayCoords = coordsFromAccommodation(args.accommodationAddress, args.accommodationName);
  if (stayCoords && isInSunshineCoastHinterland(stayCoords)) {
    const town = townFromAddress(args.accommodationAddress);
    const stayName = args.accommodationName?.trim();
    const originLabel = stayName
      ? `your stay at ${stayName}`
      : town
        ? `your stay in ${town.charAt(0).toUpperCase()}${town.slice(1)}`
        : "your accommodation";

    return {
      origin: stayCoords,
      originLabel,
      fromGuest: true,
    };
  }

  return {
    origin: spicers,
    originLabel: "Spicers Clovelly Estate",
    fromGuest: false,
  };
}

export function haversineKm(from: GeoPoint, to: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(to.latitude - from.latitude);
  const dLng = toRad(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.latitude)) *
      Math.cos(toRad(to.latitude)) *
      Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Rough hinterland drive time from straight-line distance. */
export function estimateDriveMinutes(from: GeoPoint, to: GeoPoint): number {
  const km = haversineKm(from, to);
  if (km < 0.4) return 0;
  return Math.max(1, Math.round(km / 0.72));
}
