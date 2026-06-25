export const BED_PREFERENCES = ["KING", "TWIN"] as const;

export type BedPreference = (typeof BED_PREFERENCES)[number];

export const BED_PREFERENCE_OPTIONS: { value: BedPreference; label: string; description: string }[] = [
  {
    value: "KING",
    label: "King bed",
    description: "One king-size bed",
  },
  {
    value: "TWIN",
    label: "Two double beds",
    description: "Twin / double configuration",
  },
];

export function isBedPreference(value: string | null | undefined): value is BedPreference {
  return value === "KING" || value === "TWIN";
}

export function bedPreferenceLabel(value: string | null | undefined): string | null {
  if (!isBedPreference(value)) return null;
  return BED_PREFERENCE_OPTIONS.find((option) => option.value === value)?.label ?? null;
}

export function guestShowsBedPreference(input: {
  accommodationType?: string | null;
  tier?: string | null;
  assignedRoomName?: string | null;
}): boolean {
  return (
    input.accommodationType === "ON_SITE" ||
    input.tier === "ON_SITE" ||
    input.tier === "PENTHOUSE" ||
    Boolean(input.assignedRoomName)
  );
}
