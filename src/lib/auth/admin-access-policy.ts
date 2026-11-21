import { normalizeEmail } from "@/lib/api-utils";
import { isGuestOnlyEmail } from "@/lib/auth/account-roles";

export type AdminAccessRecord = {
  email: string;
  linkedGuestId: string | null;
};

/**
 * Guest-session admin is only for a guest that was explicitly promoted
 * (Make Admin) and bound to that guest id. Sharing an Admin mailbox is
 * not enough: host admin emails are public, and email/password signup
 * does not verify mailbox ownership.
 */
export function adminRecordGrantsGuestAccess(
  guestId: string,
  guestEmail: string,
  admin: AdminAccessRecord | null,
): boolean {
  if (!guestId || isGuestOnlyEmail(guestEmail) || !admin) return false;
  if (normalizeEmail(admin.email) !== normalizeEmail(guestEmail)) return false;
  return admin.linkedGuestId === guestId;
}

/**
 * Unverified email/password signup must not create or claim a guest for an
 * Admin login unless that Admin row is already bound to this guest.
 */
export function shouldBlockUnverifiedAdminSignup(
  existingGuestId: string | null,
  admin: AdminAccessRecord | null,
): boolean {
  if (!admin) return false;
  if (!existingGuestId) return true;
  return admin.linkedGuestId !== existingGuestId;
}
