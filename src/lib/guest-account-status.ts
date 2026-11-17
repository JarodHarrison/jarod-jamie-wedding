export type GuestActivationSignals = {
  passwordPlaintext: string | null;
  linkedLoginCount?: number;
  passkeyCount?: number;
};

export type GuestActivationCountRecord = {
  passwordPlaintext: string | null;
  _count?: {
    linkedLogins?: number;
    passkeyCredentials?: number;
  };
};

/** Prisma select used when deciding whether a guest row is still claimable. */
export const guestActivationCountSelect = {
  passwordPlaintext: true,
  _count: {
    select: {
      linkedLogins: true,
      passkeyCredentials: true,
    },
  },
} as const;

/** Unclaimed imported invites have no stored password, Google login, or passkey. */
export const unclaimedGuestAccountWhere = {
  passwordPlaintext: null,
  linkedLogins: { none: {} },
  passkeyCredentials: { none: {} },
} as const;

export function activationSignalsFromGuest(
  guest: GuestActivationCountRecord,
): GuestActivationSignals {
  return {
    passwordPlaintext: guest.passwordPlaintext,
    linkedLoginCount: guest._count?.linkedLogins ?? 0,
    passkeyCount: guest._count?.passkeyCredentials ?? 0,
  };
}

/** True once a guest has claimed the app (email/password, Google, or passkey). */
export function guestHasActivatedAppAccount(guest: GuestActivationSignals): boolean {
  if (guest.passwordPlaintext) return true;
  if ((guest.linkedLoginCount ?? 0) > 0) return true;
  if ((guest.passkeyCount ?? 0) > 0) return true;
  return false;
}

export function guestRecordIsActivated(guest: GuestActivationCountRecord): boolean {
  return guestHasActivatedAppAccount(activationSignalsFromGuest(guest));
}
