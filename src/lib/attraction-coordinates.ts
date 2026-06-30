import type { GeoPoint } from "@/lib/guest-geo";

/** Approximate coordinates for curated venues — used for guest-relative drive estimates. */
export const ATTRACTION_COORDINATES: Record<string, GeoPoint> = {
  "The Long Apron": { latitude: -26.691, longitude: 152.892 },
  "Flame Hill Vineyard": { latitude: -26.701, longitude: 152.875 },
  "Brouhaha Brewery": { latitude: -26.758, longitude: 152.852 },
  "Mapleton Public House": { latitude: -26.631, longitude: 152.863 },
  "Spirit House": { latitude: -26.561, longitude: 152.959 },
  "The Tamarind": { latitude: -26.758, longitude: 152.848 },
  "Rick's Garage": { latitude: -26.689, longitude: 152.961 },
  "Secrets on the Lake": { latitude: -26.672, longitude: 152.916 },
  "Maleny Cheese": { latitude: -26.758, longitude: 152.855 },
  "Tiffany's Maleny": { latitude: -26.758, longitude: 152.85 },
  "Montville Artisan Village": { latitude: -26.696, longitude: 152.881 },
  "Nutworks": { latitude: -26.561, longitude: 152.959 },
  "The Ginger Factory": { latitude: -26.561, longitude: 152.959 },
  "Maleny Dairies": { latitude: -26.758, longitude: 152.855 },
  "Kondalilla National Park": { latitude: -26.731, longitude: 152.867 },
  "Mapleton Falls": { latitude: -26.631, longitude: 152.863 },
  "Mary Cairncross Reserve": { latitude: -26.758, longitude: 152.852 },
};
