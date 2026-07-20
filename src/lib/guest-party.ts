import { createUnclaimedPasswordFields } from "@/lib/auth/password";
import { normalizeEmail } from "@/lib/api-utils";
import { guestHasActivatedAppAccount } from "@/lib/guest-account-status";
import { isPlaceholderImportEmail } from "@/lib/guest-claim";
import { GUEST_IMPORT_EMAIL_DOMAIN } from "@/lib/guest-spreadsheet-import";
import { normalizeGuestName } from "@/lib/guest-name";
import { applyPlusOneLink } from "@/lib/plus-one-link";
import { prisma } from "@/lib/prisma";

export const partyMemberSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  dietaryNotes: true,
  songRequest: true,
  rsvpStatus: true,
  guestOfHost: true,
  guestRelationship: true,
  guestRelationshipNote: true,
  plusOneName: true,
  plusOneGuestId: true,
  managedByGuestId: true,
  assignedRoomName: true,
  sayiPartyName: true,
  tier: true,
  profilePhotoMime: true,
  profileUpdatedAt: true,
  passwordPlaintext: true,
  _count: {
    select: {
      linkedLogins: true,
      passkeyCredentials: true,
    },
  },
} as const;

export type PartyMemberRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  dietaryNotes: string | null;
  songRequest: string | null;
  rsvpStatus: "PENDING" | "ACCEPTED" | "DECLINED";
  guestOfHost: string | null;
  guestRelationship: string | null;
  guestRelationshipNote: string | null;
  plusOneName: string | null;
  plusOneGuestId: string | null;
  managedByGuestId: string | null;
  assignedRoomName: string | null;
  sayiPartyName: string | null;
  tier: "PENTHOUSE" | "ON_SITE" | "OFF_SITE";
  profilePhotoMime: string | null;
  profileUpdatedAt: Date | null;
  passwordPlaintext: string | null;
  _count: { linkedLogins: number; passkeyCredentials: number };
};

export function partyMemberIsClaimed(member: PartyMemberRecord): boolean {
  return guestHasActivatedAppAccount({
    passwordPlaintext: member.passwordPlaintext,
    linkedLoginCount: member._count.linkedLogins,
    passkeyCount: member._count.passkeyCredentials,
  });
}

export function serializePartyMember(member: PartyMemberRecord, viewerId: string) {
  const claimed = partyMemberIsClaimed(member);
  const canManage = !claimed && member.id !== viewerId;
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    isPlaceholderEmail: isPlaceholderImportEmail(member.email),
    phone: member.phone,
    dietaryNotes: member.dietaryNotes,
    songRequest: member.songRequest,
    rsvpStatus: member.rsvpStatus,
    guestOfHost: member.guestOfHost,
    guestRelationship: member.guestRelationship,
    guestRelationshipNote: member.guestRelationshipNote,
    plusOneName: member.plusOneName,
    plusOneGuestId: member.plusOneGuestId,
    managedByGuestId: member.managedByGuestId,
    assignedRoomName: member.assignedRoomName,
    sayiPartyName: member.sayiPartyName,
    tier: member.tier,
    claimed,
    canManage,
    isSelf: member.id === viewerId,
    isPlusOneOfViewer: member.plusOneGuestId === viewerId,
    hasProfilePhoto: Boolean(member.profilePhotoMime),
    photoUrl: member.profilePhotoMime
      ? `/api/guest/profile/photo?guestId=${member.id}&v=${member.profileUpdatedAt?.getTime() ?? member.id}`
      : null,
  };
}

export type SerializedPartyMember = ReturnType<typeof serializePartyMember>;

/** Guests sharing room, Sayi party, plus-one link, or managed-by relationship. */
export async function findPartyMemberIds(guestId: string): Promise<string[]> {
  const me = await prisma.guest.findUnique({
    where: { id: guestId },
    select: {
      id: true,
      plusOneGuestId: true,
      sayiPartyName: true,
      assignedRoomName: true,
      managedByGuestId: true,
    },
  });
  if (!me) return [];

  const ids = new Set<string>([me.id]);
  if (me.plusOneGuestId) ids.add(me.plusOneGuestId);
  if (me.managedByGuestId) ids.add(me.managedByGuestId);

  const managed = await prisma.guest.findMany({
    where: { managedByGuestId: guestId },
    select: { id: true },
  });
  for (const row of managed) ids.add(row.id);

  const orFilters: Array<Record<string, unknown>> = [];
  if (me.sayiPartyName?.trim()) {
    orFilters.push({ sayiPartyName: me.sayiPartyName.trim() });
  }
  if (me.assignedRoomName?.trim()) {
    orFilters.push({ assignedRoomName: me.assignedRoomName });
  }

  if (orFilters.length > 0) {
    const peers = await prisma.guest.findMany({
      where: { OR: orFilters },
      select: { id: true },
    });
    for (const peer of peers) ids.add(peer.id);
  }

  // Anyone who lists me as plus-one
  const reversePlusOnes = await prisma.guest.findMany({
    where: { plusOneGuestId: guestId },
    select: { id: true },
  });
  for (const row of reversePlusOnes) ids.add(row.id);

  return [...ids];
}

export async function loadPartyMembers(guestId: string) {
  const ids = await findPartyMemberIds(guestId);
  const members = await prisma.guest.findMany({
    where: { id: { in: ids } },
    select: partyMemberSelect,
    orderBy: { name: "asc" },
  });
  return members.map((member) => serializePartyMember(member as PartyMemberRecord, guestId));
}

export async function assertCanManagePartyMember(managerId: string, targetId: string) {
  if (managerId === targetId) {
    throw new Error("Use your own profile to edit your details.");
  }

  const partyIds = await findPartyMemberIds(managerId);
  if (!partyIds.includes(targetId)) {
    throw new Error("That guest is not in your party.");
  }

  const target = await prisma.guest.findUnique({
    where: { id: targetId },
    select: partyMemberSelect,
  });
  if (!target) throw new Error("Guest not found.");

  if (partyMemberIsClaimed(target as PartyMemberRecord)) {
    throw new Error("They've already signed into the app. Ask them to update their own profile.");
  }

  return target as PartyMemberRecord;
}

export function slugPlaceholderEmail(name: string): string {
  const slug =
    normalizeGuestName(name)
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 40) || "guest";
  return `${slug}@${GUEST_IMPORT_EMAIL_DOMAIN}`;
}

export async function uniquePlaceholderEmail(name: string): Promise<string> {
  let email = slugPlaceholderEmail(name);
  let attempt = 0;
  while (attempt < 20) {
    const existing = await prisma.guest.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!existing) return email;
    attempt += 1;
    email = `${slugPlaceholderEmail(name).replace(`@${GUEST_IMPORT_EMAIL_DOMAIN}`, "")}-${attempt}@${GUEST_IMPORT_EMAIL_DOMAIN}`;
  }
  return `${slugPlaceholderEmail(name).replace(`@${GUEST_IMPORT_EMAIL_DOMAIN}`, "")}-${Date.now()}@${GUEST_IMPORT_EMAIL_DOMAIN}`;
}

export type PartyMemberUpdateInput = {
  name?: string;
  email?: string;
  phone?: string | null;
  dietaryNotes?: string | null;
  songRequest?: string | null;
  rsvpStatus?: "PENDING" | "ACCEPTED" | "DECLINED";
  guestOfHost?: string | null;
  guestRelationship?: string | null;
  guestRelationshipNote?: string | null;
  linkAsPlusOne?: boolean;
};

export async function updateManagedPartyMember(
  managerId: string,
  targetId: string,
  input: PartyMemberUpdateInput,
) {
  const target = await assertCanManagePartyMember(managerId, targetId);

  const data: Record<string, unknown> = {
    managedByGuestId: managerId,
    profileUpdatedAt: new Date(),
  };

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (name.length < 2) throw new Error("Please enter their full name.");
    data.name = name;
  }

  if (input.email !== undefined) {
    const email = normalizeEmail(input.email);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Please enter a valid email address.");
    }
    const taken = await prisma.guest.findUnique({
      where: { email },
      select: { id: true },
    });
    if (taken && taken.id !== targetId) {
      throw new Error("That email is already used by another guest.");
    }
    data.email = email;
  }

  if (input.phone !== undefined) data.phone = input.phone?.trim() || null;
  if (input.dietaryNotes !== undefined) data.dietaryNotes = input.dietaryNotes?.trim() || null;
  if (input.songRequest !== undefined) data.songRequest = input.songRequest?.trim() || null;
  if (input.rsvpStatus !== undefined) data.rsvpStatus = input.rsvpStatus;
  if (input.guestOfHost !== undefined) data.guestOfHost = input.guestOfHost?.trim() || null;
  if (input.guestRelationship !== undefined) {
    data.guestRelationship = input.guestRelationship?.trim() || null;
  }
  if (input.guestRelationshipNote !== undefined) {
    data.guestRelationshipNote = input.guestRelationshipNote?.trim() || null;
  }

  // Inherit party context from manager when missing
  const manager = await prisma.guest.findUnique({
    where: { id: managerId },
    select: { sayiPartyName: true, assignedRoomName: true, tier: true },
  });
  if (manager?.sayiPartyName && !target.sayiPartyName) {
    data.sayiPartyName = manager.sayiPartyName;
  }

  await prisma.guest.update({
    where: { id: targetId },
    data,
  });

  if (input.linkAsPlusOne === true) {
    await applyPlusOneLink(managerId, targetId);
  }

  const members = await loadPartyMembers(managerId);
  return members;
}

export async function createPartyMember(
  managerId: string,
  input: {
    name: string;
    email?: string | null;
    phone?: string | null;
    dietaryNotes?: string | null;
    songRequest?: string | null;
    rsvpStatus?: "PENDING" | "ACCEPTED" | "DECLINED";
    linkAsPlusOne?: boolean;
  },
) {
  const name = input.name.trim();
  if (name.length < 2) throw new Error("Please enter their full name.");

  const manager = await prisma.guest.findUnique({
    where: { id: managerId },
    select: {
      id: true,
      sayiPartyName: true,
      assignedRoomName: true,
      assignedRoomDetails: true,
      assignedRoomCheckIn: true,
      assignedRoomCheckOut: true,
      assignedRoomConfiguration: true,
      tier: true,
      plusOneGuestId: true,
    },
  });
  if (!manager) throw new Error("Guest not found.");

  let email = input.email ? normalizeEmail(input.email) : null;
  if (email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Please enter a valid email address.");
    }
    const taken = await prisma.guest.findUnique({ where: { email }, select: { id: true } });
    if (taken) {
      // Link existing unclaimed profile into party by managing them
      const existing = await prisma.guest.findUnique({
        where: { id: taken.id },
        select: {
          ...partyMemberSelect,
          assignedRoomDetails: true,
          assignedRoomCheckIn: true,
          assignedRoomCheckOut: true,
          assignedRoomConfiguration: true,
        },
      });
      if (!existing) throw new Error("Guest not found.");
      if (partyMemberIsClaimed(existing as PartyMemberRecord)) {
        throw new Error("That email already belongs to someone who has signed in.");
      }
      await prisma.guest.update({
        where: { id: taken.id },
        data: {
          name,
          phone: input.phone?.trim() || existing.phone,
          dietaryNotes: input.dietaryNotes?.trim() || existing.dietaryNotes,
          songRequest: input.songRequest?.trim() || existing.songRequest,
          rsvpStatus: input.rsvpStatus ?? existing.rsvpStatus,
          managedByGuestId: managerId,
          sayiPartyName: existing.sayiPartyName ?? manager.sayiPartyName,
          assignedRoomName: existing.assignedRoomName ?? manager.assignedRoomName,
          assignedRoomDetails: existing.assignedRoomDetails ?? manager.assignedRoomDetails,
          assignedRoomCheckIn: existing.assignedRoomCheckIn ?? manager.assignedRoomCheckIn,
          assignedRoomCheckOut: existing.assignedRoomCheckOut ?? manager.assignedRoomCheckOut,
          assignedRoomConfiguration:
            existing.assignedRoomConfiguration ?? manager.assignedRoomConfiguration,
          profileUpdatedAt: new Date(),
        },
      });
      if (input.linkAsPlusOne) await applyPlusOneLink(managerId, taken.id);
      return loadPartyMembers(managerId);
    }
  } else {
    email = await uniquePlaceholderEmail(name);
  }

  const passwordFields = await createUnclaimedPasswordFields();
  const created = await prisma.guest.create({
    data: {
      name,
      email,
      passwordHash: passwordFields.passwordHash,
      passwordPlaintext: passwordFields.passwordPlaintext,
      phone: input.phone?.trim() || null,
      dietaryNotes: input.dietaryNotes?.trim() || null,
      songRequest: input.songRequest?.trim() || null,
      rsvpStatus: input.rsvpStatus ?? "PENDING",
      managedByGuestId: managerId,
      sayiPartyName: manager.sayiPartyName,
      assignedRoomName: manager.assignedRoomName,
      assignedRoomDetails: manager.assignedRoomDetails,
      assignedRoomCheckIn: manager.assignedRoomCheckIn,
      assignedRoomCheckOut: manager.assignedRoomCheckOut,
      assignedRoomConfiguration: manager.assignedRoomConfiguration,
      tier: manager.tier === "PENTHOUSE" ? "PENTHOUSE" : manager.assignedRoomName ? "ON_SITE" : "OFF_SITE",
      accommodationType: manager.assignedRoomName ? "ON_SITE" : null,
      accommodationName: manager.assignedRoomName
        ? `Spicers Clovelly Estate: ${manager.assignedRoomName}`
        : null,
      accommodationAddress: manager.assignedRoomName
        ? "68 Montville-Maleny Rd, Montville QLD 4560"
        : null,
    },
    select: { id: true },
  });

  if (input.linkAsPlusOne || !manager.plusOneGuestId) {
    // Link as plus-one when requested, or when manager has no plus-one yet and creating one person
    if (input.linkAsPlusOne) {
      await applyPlusOneLink(managerId, created.id);
    }
  }

  // Clear text-only plusOneName if it matches
  await prisma.guest.updateMany({
    where: {
      id: managerId,
      plusOneGuestId: null,
      plusOneName: { equals: name, mode: "insensitive" },
    },
    data: { plusOneName: null },
  });

  return loadPartyMembers(managerId);
}

/** Clear management when a guest claims their own account. */
export async function clearGuestManagementOnClaim(guestId: string) {
  await prisma.guest.update({
    where: { id: guestId },
    data: { managedByGuestId: null },
  });
}
