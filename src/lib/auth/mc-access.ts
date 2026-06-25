import { guestHasAdminAccess } from "@/lib/auth/admin-access";
import { requireGuestSession } from "@/lib/auth/session";

export async function guestIsMcOrAdmin(email: string, isMc: boolean): Promise<boolean> {
  if (isMc) return true;
  return guestHasAdminAccess(email);
}

export async function requireMcOrAdminAccess() {
  const session = await requireGuestSession();
  const { prisma } = await import("@/lib/prisma");

  const guest = await prisma.guest.findUnique({
    where: { id: session.id },
    select: { isMc: true, email: true, name: true },
  });

  if (!guest) {
    throw new Error("Unauthorized");
  }

  const allowed = await guestIsMcOrAdmin(guest.email, guest.isMc);
  if (!allowed) {
    throw new Error("Unauthorized");
  }

  return { ...session, isMc: guest.isMc };
}
