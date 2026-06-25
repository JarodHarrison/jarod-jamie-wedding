import { isValidGuestTier } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { ANNITA_NOTIFICATION_ICON } from "@/lib/notification-branding";
import type { GuestTier } from "@/types/wedding";

export type NotificationAudience =
  | "all"
  | "accepted"
  | "pending-rsvp"
  | GuestTier;

export function isNotificationAudience(value: string): value is NotificationAudience {
  return (
    value === "all" ||
    value === "accepted" ||
    value === "pending-rsvp" ||
    isValidGuestTier(value)
  );
}

type GuestRecipient = {
  id: string;
  rsvpStatus: string;
  tier: string;
};

export function filterGuestsByAudience<T extends GuestRecipient>(
  guests: T[],
  audience: NotificationAudience,
): T[] {
  return guests.filter((guest) => {
    if (audience === "all") return true;
    if (audience === "accepted") return guest.rsvpStatus === "ACCEPTED";
    if (audience === "pending-rsvp") return guest.rsvpStatus === "PENDING";
    return guest.tier === audience;
  });
}

export async function createInAppNotifications(
  guestIds: string[],
  title: string,
  body: string,
  imageUrl: string = ANNITA_NOTIFICATION_ICON,
): Promise<number> {
  if (guestIds.length === 0) return 0;

  const result = await prisma.inAppNotification.createMany({
    data: guestIds.map((guestId) => ({ guestId, title, body, imageUrl })),
  });

  return result.count;
}
