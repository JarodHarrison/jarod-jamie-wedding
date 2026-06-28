import { normalizeEmail } from "@/lib/api-utils";
import { normalizeGuestName } from "@/lib/guest-name";
import type { GuestProfileCardData } from "@/lib/guest-profile-card";
import type { PartyRosterMember } from "@/lib/party-roster";
import {
  partyFamilyGroups,
  partyGrooms,
  partyWeddingParty,
} from "@/lib/party-roster";

export type GuestProfilePhoto = GuestProfileCardData & {
  email?: string;
  photoUrl: string;
};

export type PartyMemberWithPhoto = PartyRosterMember & {
  imageSrc?: string;
  guestProfile?: GuestProfileCardData;
};

function nameTokens(name: string): string[] {
  return normalizeGuestName(name).split(" ").filter(Boolean);
}

function collectMatchKeys(member: PartyRosterMember): string[] {
  const keys = new Set<string>();
  for (const label of [member.name, ...(member.matchNames ?? [])]) {
    const normalized = normalizeGuestName(label);
    if (normalized) keys.add(normalized);
  }
  return [...keys];
}

function toGuestProfileCard(guest: GuestProfilePhoto): GuestProfileCardData {
  return {
    name: guest.name,
    plusOneName: guest.plusOneName,
    guestOfHost: guest.guestOfHost,
    guestRelationship: guest.guestRelationship,
    guestRelationshipNote: guest.guestRelationshipNote,
  };
}

export function findPhotoForMember(
  member: PartyRosterMember,
  guests: GuestProfilePhoto[],
): GuestProfilePhoto | undefined {
  const matchKeys = collectMatchKeys(member);
  const matchKeySet = new Set(matchKeys);
  const matchEmailSet = new Set(
    (member.matchEmails ?? []).map((email) => normalizeEmail(email)).filter(Boolean),
  );

  for (const guest of guests) {
    if (guest.email && matchEmailSet.has(normalizeEmail(guest.email))) {
      return guest;
    }
  }

  for (const guest of guests) {
    const normalized = normalizeGuestName(guest.name);
    if (matchKeySet.has(normalized)) return guest;
  }

  const memberTokens = nameTokens(member.name);
  if (memberTokens.length === 0) return undefined;

  const [firstName, ...rest] = memberTokens;
  const lastName = rest.at(-1);

  for (const guest of guests) {
    const guestTokens = nameTokens(guest.name);
    if (guestTokens.length === 0 || guestTokens[0] !== firstName) continue;

    if (!lastName) {
      if (guestTokens.length === 1) return guest;
      continue;
    }

    if (guestTokens.includes(lastName)) return guest;
  }

  return undefined;
}

export function applyPhotosToRoster(
  members: PartyRosterMember[],
  guests: GuestProfilePhoto[],
): PartyMemberWithPhoto[] {
  const usedPhotoUrls = new Set<string>();

  return members.map((member) => {
    const guest = findPhotoForMember(member, guests);
    const photoUrl = guest?.photoUrl;
    if (!photoUrl || usedPhotoUrls.has(photoUrl)) {
      return member;
    }

    usedPhotoUrls.add(photoUrl);
    return {
      ...member,
      imageSrc: photoUrl,
      guestProfile: guest
        ? {
            ...toGuestProfileCard(guest),
            name: member.name,
            hideConnection: member.role === "Groom",
          }
        : undefined,
    };
  });
}

export function findGuestProfileByPhoto(
  guests: GuestProfilePhoto[],
  photoUrl: string,
): GuestProfileCardData | undefined {
  const guest = guests.find((entry) => entry.photoUrl === photoUrl);
  return guest ? toGuestProfileCard(guest) : undefined;
}

const allPartyRosterMembers: PartyRosterMember[] = [
  ...partyGrooms,
  ...partyWeddingParty,
  ...partyFamilyGroups.flatMap((group) => [...group.members]),
];

/** Prefer roster display name (e.g. Jarod Harrison over J-rod H) and groom card rules. */
export function rosterProfileOverlay(
  guest: GuestProfilePhoto,
): Pick<GuestProfileCardData, "name" | "hideConnection"> {
  for (const member of allPartyRosterMembers) {
    if (findPhotoForMember(member, [guest])) {
      return {
        name: member.name,
        hideConnection: member.role === "Groom",
      };
    }
  }
  return { name: guest.name };
}
