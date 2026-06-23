import { prisma } from "@/lib/prisma";
import {
  setSessionCookie,
  type GuestSession,
} from "@/lib/auth/session";

export async function syncGuestSessionFromDb(
  session: GuestSession,
): Promise<GuestSession | null> {
  const guest = await prisma.guest.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, tier: true },
  });

  if (!guest) return null;

  const fresh: GuestSession = {
    type: "guest",
    id: guest.id,
    name: guest.name,
    email: guest.email,
    tier: guest.tier,
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
