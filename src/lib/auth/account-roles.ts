import { normalizeEmail } from "@/lib/api-utils";

/** Jarod's personal Gmail — guest experience only (no admin tab or tier overrides). */
export const JAROD_GUEST_EMAIL = "jarod.harrison87@gmail.com";

/** Jarod's Outlook — full admin dashboard and all tier-gated features. */
export const JAROD_ADMIN_EMAIL = "jarod.harrison@outlook.com";

export function isGuestOnlyEmail(email: string): boolean {
  return normalizeEmail(email) === JAROD_GUEST_EMAIL;
}

export function isAdminPreferredEmail(email: string): boolean {
  return normalizeEmail(email) === JAROD_ADMIN_EMAIL;
}
