import { ANNITA } from "@/lib/annita";

/** Square Annita avatar for in-app and OS notifications (games, bingo, admin push). */
export const ANNITA_NOTIFICATION_ICON = ANNITA.avatarSrc;

/** J&J app icon for general PWA / OS notification badge. */
export const APP_NOTIFICATION_ICON = "/icon-192";

const GAME_NOTIFICATION_TITLES = [
  "bingo",
  "bingo to verify",
  "drag queen",
  "overtaken",
  "catching up",
  "almost there",
  "so close",
  "people are catching up",
  "verified",
];

export function isGameOrAnnitaNotification(notification: {
  title: string;
  imageUrl?: string | null;
}): boolean {
  const title = notification.title.toLowerCase();
  if (GAME_NOTIFICATION_TITLES.some((phrase) => title.includes(phrase))) return true;
  if (notification.imageUrl?.includes("annita")) return true;
  return false;
}

export function notificationAvatarUrl(notification: {
  title: string;
  imageUrl?: string | null;
}): string | null {
  if (isGameOrAnnitaNotification(notification)) return ANNITA_NOTIFICATION_ICON;
  return notification.imageUrl ?? null;
}

export function notificationHeroImageUrl(notification: {
  title: string;
  imageUrl?: string | null;
}): string | null {
  if (isGameOrAnnitaNotification(notification)) return null;
  return notification.imageUrl ?? null;
}
