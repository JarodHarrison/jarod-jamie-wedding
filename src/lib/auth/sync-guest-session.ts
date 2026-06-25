import { prisma } from "@/lib/prisma";
import {
  guestHasRoomAllocation,
  tierForRoomAllocation,
} from "@/lib/on-site-access";
import {
  setSessionCookie,
  type GuestSession,
} from "@/lib/auth/session";

export async function syncGuestSessionFromDb(
  session: GuestSession,
): Promise<GuestSession | null> {
  const guest = await prisma.guest.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      tier: true,
      assignedRoomName: true,
    },
  });

  if (!guest) return null;

  let tier = guest.tier;

  if (guestHasRoomAllocation(guest.assignedRoomName)) {
    const promotedTier = tierForRoomAllocation(guest.tier);
    if (promotedTier) {
      await prisma.guest.update({
        where: { id: guest.id },
        data: { tier: promotedTier },
      });
      tier = promotedTier;
    }
  }

  const fresh: GuestSession = {
    type: "guest",
    id: guest.id,
    name: guest.name,
    email: guest.email,
    tier,
  };

  const changed =
    fresh.tier !== session.tier ||
    fresh.name !== session.name ||
    fresh.email !== session.email;

  if (changed) {
    await setSessionCookie(fresh);
  }

  return fresh;
}
