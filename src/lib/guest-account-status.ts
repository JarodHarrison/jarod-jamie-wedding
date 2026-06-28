export type GuestActivationSignals = {
  passwordPlaintext: string | null;
  linkedLoginCount?: number;
  passkeyCount?: number;
};

/** True once a guest has claimed the app (email/password, Google, or passkey). */
export function guestHasActivatedAppAccount(guest: GuestActivationSignals): boolean {
  if (guest.passwordPlaintext) return true;
  if ((guest.linkedLoginCount ?? 0) > 0) return true;
  if ((guest.passkeyCount ?? 0) > 0) return true;
  return false;
}
