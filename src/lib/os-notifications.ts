"use client";

import {
  ANNITA_NOTIFICATION_ICON,
  APP_NOTIFICATION_ICON,
  isGameOrAnnitaNotification,
} from "@/lib/notification-branding";
import { APP_BUILD_ID } from "@/lib/app-build-id";

type OsNotificationPayload = {
  title: string;
  body: string;
  tag?: string;
  imageUrl?: string | null;
};

export function osNotificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
}

export async function ensureNotificationServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  try {
    const build = encodeURIComponent(APP_BUILD_ID);
    return await navigator.serviceWorker.register(`/sw.js?build=${build}`, { scope: "/" });
  } catch {
    return null;
  }
}

export async function requestOsNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!osNotificationsSupported()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export async function showOsNotification(payload: OsNotificationPayload): Promise<void> {
  if (!osNotificationsSupported() || Notification.permission !== "granted") return;

  const registration = (await navigator.serviceWorker.getRegistration()) ?? (await ensureNotificationServiceWorker());
  if (!registration) return;

  const useAnnita = isGameOrAnnitaNotification(payload);
  const icon = useAnnita ? ANNITA_NOTIFICATION_ICON : APP_NOTIFICATION_ICON;

  await registration.showNotification(payload.title, {
    body: payload.body,
    icon,
    badge: APP_NOTIFICATION_ICON,
    tag: payload.tag ?? payload.title,
  });
}
