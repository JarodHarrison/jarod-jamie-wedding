import type { AdminGuest } from "@/types/wedding";

export type GuestStatCategory =
  | "rsvp-in"
  | "on-site"
  | "off-site"
  | "transfers"
  | "photos"
  | "bingo-playing"
  | "bingo-done"
  | "story-authors";

export const GUEST_STAT_LABELS: Record<GuestStatCategory, string> = {
  "rsvp-in": "RSVP In",
  "on-site": "On-site",
  "off-site": "Off-site",
  transfers: "Transfers",
  photos: "Profile Photos",
  "bingo-playing": "Bingo — Playing",
  "bingo-done": "Bingo — Completed",
  "story-authors": "Stories",
};

export const CLIENT_FILTERED_STAT_CATEGORIES = new Set<GuestStatCategory>([
  "rsvp-in",
  "on-site",
  "off-site",
  "transfers",
  "photos",
]);

export type GuestStatListEntry = { id: string; name: string };

export function filterGuestsForStat(
  guests: AdminGuest[],
  category: GuestStatCategory,
): GuestStatListEntry[] {
  const filtered = guests.filter((guest) => {
    switch (category) {
      case "rsvp-in":
        return guest.rsvpStatus === "ACCEPTED";
      case "on-site":
        return guest.tier === "ON_SITE" || guest.tier === "PENTHOUSE";
      case "off-site":
        return guest.tier === "OFF_SITE";
      case "transfers":
        return guest.transferSubmittedAt !== null;
      case "photos":
        return guest.hasProfilePhoto;
      default:
        return false;
    }
  });

  return filtered
    .map((guest) => ({ id: guest.id, name: guest.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
