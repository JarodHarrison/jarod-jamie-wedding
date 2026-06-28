import { prisma } from "@/lib/prisma";
import { syncGuestSessionFromDb } from "@/lib/auth/sync-guest-session";
import type { GuestSession } from "@/lib/auth/session";
import type { GuestTier } from "@/types/wedding";

const linkedGuestSelect = {
  id: true,
  name: true,
  email: true,
  tier: true,
} as const;

export type LinkedGuestRecord = {
  id: string;
  name: string;
  email: string;
  tier: GuestTier;
};

export async function getLinkedGuestForAdmin(
  adminId: string,
): Promise<LinkedGuestRecord | null> {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { linkedGuest: { select: linkedGuestSelect } },
  });

  return admin?.linkedGuest ?? null;
}

export async function resolveLinkedGuestSession(
  adminId: string,
): Promise<GuestSession | null> {
  const guest = await getLinkedGuestForAdmin(adminId);
  if (!guest) return null;

  return syncGuestSessionFromDb({
    type: "guest",
    id: guest.id,
    name: guest.name,
    email: guest.email,
    tier: guest.tier,
  });
}

export function toWeddingUser(guest: LinkedGuestRecord) {
  return {
    id: guest.id,
    name: guest.name,
    email: guest.email,
    tier: guest.tier,
  };
}
