export const SHUTTLE_STOPS = [
  {
    slug: "montville_inn",
    name: "Montville Mountain Inn",
    address: "118 Main Street, Montville",
    latitude: -26.6888,
    longitude: 152.8925,
    stopOrder: 1,
  },
  {
    slug: "kondalilla",
    name: "Kondalilla Eco Resort",
    address: "61 Kondalilla Falls Road",
    latitude: -26.7267,
    longitude: 152.8667,
    stopOrder: 2,
  },
  {
    slug: "maleny",
    name: "Maleny Community Centre",
    address: "23 Maple Street, Maleny",
    latitude: -26.76,
    longitude: 152.8493,
    stopOrder: 3,
  },
  {
    slug: "spicers",
    name: "Spicers Clovelly Estate",
    address: "38–68 Balmoral Road, Montville",
    latitude: -26.6975,
    longitude: 152.8789,
    stopOrder: 4,
  },
] as const;

export const VENUE_STOP_SLUG = "spicers";

import { isShuttleLiveWindow } from "@/lib/wedding-event";

export function isShuttleFeatureVisible(now = new Date()): boolean {
  return isShuttleLiveWindow(now);
}
