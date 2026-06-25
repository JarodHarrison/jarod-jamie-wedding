import { normalizeEmail } from "@/lib/api-utils";
import { GUEST_IMPORT_EMAIL_DOMAIN } from "@/lib/guest-spreadsheet-import";
import type { GuestSpreadsheetRow } from "@/lib/guest-spreadsheet-import";
import { normalizeGuestName } from "@/lib/guest-name";
import { prisma } from "@/lib/prisma";

export function isPlaceholderImportEmail(email: string): boolean {
  return normalizeEmail(email).endsWith(`@${GUEST_IMPORT_EMAIL_DOMAIN}`);
}

export async function findGuestByNormalizedName(name: string) {
  const normalized = normalizeGuestName(name);
  if (!normalized) return null;

  const candidates = await prisma.guest.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      tier: true,
      rsvpStatus: true,
      rsvpSubmittedAt: true,
    },
  });

  return candidates.find((guest) => normalizeGuestName(guest.name) === normalized) ?? null;
}

export async function findImportableGuestByName(name: string) {
  const normalized = normalizeGuestName(name);
  if (!normalized) return null;

  const candidates = await prisma.guest.findMany({
    where: {
      email: { endsWith: `@${GUEST_IMPORT_EMAIL_DOMAIN}` },
    },
    select: {
      id: true,
      name: true,
      email: true,
      tier: true,
      rsvpStatus: true,
      rsvpSubmittedAt: true,
      passwordPlaintext: true,
    },
  });

  return candidates.find((guest) => normalizeGuestName(guest.name) === normalized) ?? null;
}

const claimableGuestSelect = {
  id: true,
  name: true,
  email: true,
  tier: true,
  rsvpStatus: true,
  rsvpSubmittedAt: true,
  passwordPlaintext: true,
} as const;

/** Match imported / pre-created guest rows when someone signs up with Google or email. */
export async function findClaimableGuestForSignup(name: string, email: string) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedName = normalizeGuestName(name);

  const byEmail = await prisma.guest.findUnique({
    where: { email: normalizedEmail },
    select: claimableGuestSelect,
  });
  if (byEmail && !byEmail.passwordPlaintext) {
    return byEmail;
  }

  const importable = await findImportableGuestByName(name);
  if (importable) return importable;

  if (!normalizedName) return null;

  const candidates = await prisma.guest.findMany({
    where: {
      passwordPlaintext: null,
      OR: [
        { email: { endsWith: `@${GUEST_IMPORT_EMAIL_DOMAIN}` } },
        { sayiImportedAt: { not: null } },
      ],
    },
    select: claimableGuestSelect,
  });

  const exactMatches = candidates.filter(
    (guest) => normalizeGuestName(guest.name) === normalizedName,
  );
  if (exactMatches.length === 1) return exactMatches[0];
  if (exactMatches.length > 1) {
    return (
      exactMatches.find((guest) => isPlaceholderImportEmail(guest.email)) ?? exactMatches[0]
    );
  }

  const firstName = normalizedName.split(" ")[0];
  if (firstName.length >= 3) {
    const firstNameMatches = candidates.filter((guest) => {
      const guestNorm = normalizeGuestName(guest.name);
      return guestNorm.startsWith(`${firstName} `) || guestNorm === firstName;
    });
    if (firstNameMatches.length === 1) return firstNameMatches[0];
  }

  return null;
}

export async function findGuestByLoginEmail(email: string) {
  const normalized = normalizeEmail(email);

  const guest = await prisma.guest.findUnique({
    where: { email: normalized },
    select: { id: true, name: true, email: true, tier: true },
  });
  if (guest) return guest;

  const linked = await prisma.guestLinkedLogin.findUnique({
    where: { email: normalized },
    select: {
      guest: { select: { id: true, name: true, email: true, tier: true } },
    },
  });

  return linked?.guest ?? null;
}

export async function findExistingGuestForImport(row: GuestSpreadsheetRow) {
  const byEmail = await prisma.guest.findUnique({
    where: { email: row.email },
    select: { id: true },
  });
  if (byEmail) return byEmail;

  if (row.sayiPartyName) {
    const partyGuests = await prisma.guest.findMany({
      where: { sayiPartyName: row.sayiPartyName },
      select: { id: true, name: true },
    });
    const partyMatch = partyGuests.find(
      (guest) => normalizeGuestName(guest.name) === normalizeGuestName(row.name),
    );
    if (partyMatch) return { id: partyMatch.id };
  }

  if (row.emailGenerated || row.sayiPartyName) {
    const byName = await findGuestByNormalizedName(row.name);
    if (byName) return { id: byName.id };
  }

  return null;
}
