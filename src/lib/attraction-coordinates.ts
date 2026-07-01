import type { GeoPoint } from "@/lib/guest-geo";
import { buildMapsDirectionsUrl } from "@/lib/maps-directions";

/** Approximate coordinates for curated venues — drive estimates and map directions. */
export const ATTRACTION_COORDINATES: Record<string, GeoPoint> = {
  // Eat & drink
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
  // What to do
  "Montville Artisan Village": { latitude: -26.696, longitude: 152.881 },
  "Maleny Botanic Gardens": { latitude: -26.769, longitude: 152.855 },
  "Mary Cairncross Reserve": { latitude: -26.758, longitude: 152.852 },
  "Clock Shop": { latitude: -26.696, longitude: 152.882 },
  "Maleny Dairies": { latitude: -26.758, longitude: 152.855 },
  "Baroon Pocket Dam": { latitude: -26.672, longitude: 152.916 },
  "Buderim Forest Park": { latitude: -26.685, longitude: 153.057 },
  "The Barrel at Clouds Vineyard": { latitude: -26.696, longitude: 152.878 },
  "Mapleton Falls": { latitude: -26.631, longitude: 152.863 },
  "Art on Cairncross": { latitude: -26.758, longitude: 152.852 },
  // Adventures
  "Kondalilla National Park": { latitude: -26.731, longitude: 152.867 },
  "TreeTop Challenge: Big Pineapple": { latitude: -26.242, longitude: 152.961 },
  "Mt Ngungun Summit": { latitude: -26.876, longitude: 152.92 },
  "Aussie World": { latitude: -26.243, longitude: 152.961 },
  "Eumundi Markets": { latitude: -26.478, longitude: 152.951 },
  "Wildlife HQ Zoo": { latitude: -26.242, longitude: 152.961 },
  "Sunshine Castle": { latitude: -26.618, longitude: 153.037 },
  "Amaze World": { latitude: -26.718, longitude: 153.041 },
  "Point Cartwright Lighthouse": { latitude: -26.683, longitude: 153.145 },
  "Maleny Trail": { latitude: -26.758, longitude: 152.853 },
  // Oddities
  "The Big Pineapple": { latitude: -26.242, longitude: 152.961 },
  "The Ginger Factory": { latitude: -26.561, longitude: 152.959 },
  Nutworks: { latitude: -26.561, longitude: 152.959 },
  "Kenilworth Country Bakery": { latitude: -26.604, longitude: 152.864 },
  "The Majestic Theatre": { latitude: -26.366, longitude: 152.856 },
  "Maleny Lane": { latitude: -26.758, longitude: 152.852 },
  "Chenrezig Institute": { latitude: -26.727, longitude: 152.949 },
  "Opals Down Under": { latitude: -26.689, longitude: 152.961 },
  "Yandina Station": { latitude: -26.561, longitude: 152.955 },
  "Banana Bender Pub": { latitude: -26.243, longitude: 152.962 },
};

export function attractionCoordinates(title: string): GeoPoint | undefined {
  return ATTRACTION_COORDINATES[title];
}

export function directionsUrlForAttraction(title: string): string {
  const coords = attractionCoordinates(title);
  return buildMapsDirectionsUrl({
    name: title,
    latitude: coords?.latitude,
    longitude: coords?.longitude,
  });
}
