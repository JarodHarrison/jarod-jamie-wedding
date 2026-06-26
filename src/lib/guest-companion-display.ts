import type { AdminGuest } from "@/types/wedding";

export type GuestCompanionSummary = {
  name: string;
  linked: boolean;
  guestId?: string;
};

export function getGuestCompanionSummary(
  guest: Pick<AdminGuest, "plusOneGuest" | "plusOneName">,
): GuestCompanionSummary | null {
  if (guest.plusOneGuest) {
    return {
      name: guest.plusOneGuest.name,
      linked: true,
      guestId: guest.plusOneGuest.id,
    };
  }

  const name = guest.plusOneName?.trim();
  if (name) {
    return { name, linked: false };
  }

  return null;
}
