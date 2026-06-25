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
    },
  });

  return candidates.find((guest) => normalizeGuestName(guest.name) === normalized) ?? null;
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
