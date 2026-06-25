export const GUEST_OF_HOST_OPTIONS = [
  { value: "jarod", label: "Jarod (J-rod)" },
  { value: "jamie", label: "Jamie (Jamo)" },
  { value: "both", label: "Both — we know both grooms" },
] as const;

export const GUEST_RELATIONSHIP_OPTIONS = [
  { value: "family", label: "Family" },
  { value: "friend", label: "Friend" },
  { value: "partner", label: "Partner / plus-one" },
  { value: "work", label: "Work / colleague" },
  { value: "other", label: "Other" },
] as const;

export type GuestOfHost = (typeof GUEST_OF_HOST_OPTIONS)[number]["value"];
export type GuestRelationship = (typeof GUEST_RELATIONSHIP_OPTIONS)[number]["value"];

export function isGuestOfHost(value: string): value is GuestOfHost {
  return GUEST_OF_HOST_OPTIONS.some((option) => option.value === value);
}

export function isGuestRelationship(value: string): value is GuestRelationship {
  return GUEST_RELATIONSHIP_OPTIONS.some((option) => option.value === value);
}

export const PROFILE_PHOTO_MAX_BYTES = 750_000;
export const PROFILE_PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";
