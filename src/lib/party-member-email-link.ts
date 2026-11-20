import { guestNamesCompatibleForEmailLink } from "@/lib/guest-name";

export type PartyMemberEmailLinkExisting = {
  claimed: boolean;
  name: string;
  phone: string | null;
  dietaryNotes: string | null;
  songRequest: string | null;
  rsvpStatus: "PENDING" | "ACCEPTED" | "DECLINED";
  sayiPartyName: string | null;
  assignedRoomName: string | null;
  assignedRoomDetails: string | null;
  assignedRoomCheckIn: string | null;
  assignedRoomCheckOut: string | null;
  assignedRoomConfiguration: string | null;
};

export type PartyMemberEmailLinkInput = {
  name: string;
  phone?: string | null;
  dietaryNotes?: string | null;
  songRequest?: string | null;
  rsvpStatus?: "PENDING" | "ACCEPTED" | "DECLINED";
};

export type PartyMemberEmailLinkManager = {
  sayiPartyName: string | null;
  assignedRoomName: string | null;
  assignedRoomDetails: string | null;
  assignedRoomCheckIn: string | null;
  assignedRoomCheckOut: string | null;
  assignedRoomConfiguration: string | null;
};

export type PartyMemberEmailLinkUpdate = {
  phone: string | null;
  dietaryNotes: string | null;
  songRequest: string | null;
  rsvpStatus: "PENDING" | "ACCEPTED" | "DECLINED";
  sayiPartyName: string | null;
  assignedRoomName: string | null;
  assignedRoomDetails: string | null;
  assignedRoomCheckIn: string | null;
  assignedRoomCheckOut: string | null;
  assignedRoomConfiguration: string | null;
};

export type PartyMemberEmailLinkPlan =
  | { type: "reject"; message: string }
  | { type: "link"; data: PartyMemberEmailLinkUpdate };

function fillBlank(existing: string | null, incoming: string | null | undefined): string | null {
  if (existing?.trim()) return existing;
  return incoming?.trim() || null;
}

const CLAIMED_EMAIL_MESSAGE = "That email already belongs to someone who has signed in.";
const NAME_MISMATCH_MESSAGE =
  "That email is already on the guest list under a different name. Leave the email blank to add a new person, or ask them to sign in.";

export function planPartyMemberEmailLink(
  input: PartyMemberEmailLinkInput,
  existing: PartyMemberEmailLinkExisting,
  manager: PartyMemberEmailLinkManager,
): PartyMemberEmailLinkPlan {
  if (existing.claimed) {
    return { type: "reject", message: CLAIMED_EMAIL_MESSAGE };
  }

  if (!guestNamesCompatibleForEmailLink(input.name, existing.name)) {
    return { type: "reject", message: NAME_MISMATCH_MESSAGE };
  }

  return {
    type: "link",
    data: {
      phone: fillBlank(existing.phone, input.phone),
      dietaryNotes: fillBlank(existing.dietaryNotes, input.dietaryNotes),
      songRequest: fillBlank(existing.songRequest, input.songRequest),
      rsvpStatus:
        existing.rsvpStatus === "PENDING"
          ? (input.rsvpStatus ?? existing.rsvpStatus)
          : existing.rsvpStatus,
      sayiPartyName: existing.sayiPartyName ?? manager.sayiPartyName,
      assignedRoomName: existing.assignedRoomName ?? manager.assignedRoomName,
      assignedRoomDetails: existing.assignedRoomDetails ?? manager.assignedRoomDetails,
      assignedRoomCheckIn: existing.assignedRoomCheckIn ?? manager.assignedRoomCheckIn,
      assignedRoomCheckOut: existing.assignedRoomCheckOut ?? manager.assignedRoomCheckOut,
      assignedRoomConfiguration:
        existing.assignedRoomConfiguration ?? manager.assignedRoomConfiguration,
    },
  };
}
