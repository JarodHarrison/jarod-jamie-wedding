import {
  GUEST_OF_HOST_OPTIONS,
  GUEST_RELATIONSHIP_OPTIONS,
} from "@/lib/guest-identity";

export type GuestProfileCardData = {
  name: string;
  plusOneName?: string | null;
  guestOfHost?: string | null;
  guestRelationship?: string | null;
  guestRelationshipNote?: string | null;
};

export function formatGuestOfHost(value: string): string {
  const match = GUEST_OF_HOST_OPTIONS.find((option) => option.value === value);
  if (match) return match.label;
  return value;
}

export function formatGuestRelationship(value: string, note?: string | null): string {
  if (value === "other" && note?.trim()) return note.trim();
  const match = GUEST_RELATIONSHIP_OPTIONS.find((option) => option.value === value);
  if (match) return match.label;
  return value;
}

export function guestConnectionSummary(data: GuestProfileCardData): string | null {
  const { guestOfHost, guestRelationship, guestRelationshipNote } = data;
  if (!guestOfHost || !guestRelationship) return null;

  const hostLabel = formatGuestOfHost(guestOfHost);
  const relationshipLabel = formatGuestRelationship(guestRelationship, guestRelationshipNote);

  if (guestOfHost === "both") {
    return `${relationshipLabel} of Jarod & Jamie`;
  }

  const shortHost =
    guestOfHost === "jarod" ? "Jarod" : guestOfHost === "jamie" ? "Jamie" : hostLabel;

  return `${relationshipLabel} of ${shortHost}`;
}

export function hasGuestProfileCard(data: GuestProfileCardData): boolean {
  const hasCompanion = Boolean(data.plusOneName?.trim());
  const hasConnection = Boolean(data.guestOfHost && data.guestRelationship);
  return hasCompanion || hasConnection;
}
