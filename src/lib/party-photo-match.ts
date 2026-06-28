import { normalizeGuestName } from "@/lib/guest-name";
import type { PartyRosterMember } from "@/lib/party-roster";

export type GuestProfilePhoto = {
  name: string;
  photoUrl: string;
};

export type PartyMemberWithPhoto = PartyRosterMember & {
  imageSrc?: string;
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

export function findPhotoForMember(
  member: PartyRosterMember,
  guests: GuestProfilePhoto[],
): string | undefined {
  const matchKeys = collectMatchKeys(member);
  const matchKeySet = new Set(matchKeys);

  for (const guest of guests) {
    const normalized = normalizeGuestName(guest.name);
    if (matchKeySet.has(normalized)) return guest.photoUrl;
  }

  const memberTokens = nameTokens(member.name);
  if (memberTokens.length === 0) return undefined;

  const [firstName, ...rest] = memberTokens;
  const lastName = rest.at(-1);

  for (const guest of guests) {
    const guestTokens = nameTokens(guest.name);
    if (guestTokens.length === 0 || guestTokens[0] !== firstName) continue;

    if (!lastName) {
      if (guestTokens.length === 1) return guest.photoUrl;
      continue;
    }

    if (guestTokens.includes(lastName)) return guest.photoUrl;
  }

  return undefined;
}

export function applyPhotosToRoster(
  members: PartyRosterMember[],
  guests: GuestProfilePhoto[],
): PartyMemberWithPhoto[] {
  const usedPhotoUrls = new Set<string>();

  return members.map((member) => {
    const photoUrl = findPhotoForMember(member, guests);
    if (!photoUrl || usedPhotoUrls.has(photoUrl)) {
      return member;
    }

    usedPhotoUrls.add(photoUrl);
    return { ...member, imageSrc: photoUrl };
  });
}
