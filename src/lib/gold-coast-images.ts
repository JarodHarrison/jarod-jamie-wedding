/** Venue photos for the Gold Coast itinerary (not Stripe promo graphics). */

export const GOLD_COAST_VENUE_IMAGES = {
  "byron-lunch": "/gold-coast/venues/byron-bay.png",
  skydeck: "/gold-coast/venues/q1-skydeck.png",
  "movie-world": "/gold-coast/venues/movie-world.png",
  dreamworld: "/gold-coast/venues/dreamworld.png",
  "australia-zoo": "/gold-coast/venues/australia-zoo.png",
  draculas: "/gold-coast/draculas.png",
  "little-truffle": "/gold-coast/little-truffle.png",
} as const;

export type GoldCoastVenueImageId = keyof typeof GOLD_COAST_VENUE_IMAGES;

export function getGoldCoastVenueImage(id: GoldCoastVenueImageId): string {
  return GOLD_COAST_VENUE_IMAGES[id];
}
