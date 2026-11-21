import { prisma } from "@/lib/prisma";
import { isGuestOnlyEmail } from "@/lib/auth/account-roles";
import { adminRecordGrantsGuestAccess } from "@/lib/auth/admin-access-policy";
import { getSession, type AdminSession, type GuestSession } from "@/lib/auth/session";

export type AdminAccessSession = AdminSession | GuestSession;

export async function guestHasAdminAccess(email: string, guestId: string): Promise<boolean> {
  if (isGuestOnlyEmail(email) || !guestId) return false;

  const admin = await prisma.admin.findUnique({
    where: { email },
    select: { email: true, linkedGuestId: true },
  });
  return adminRecordGrantsGuestAccess(guestId, email, admin);
}

/** Admin session, or guest whose Admin row is bound to this guest (Make Admin). */
export async function requireAdminAccess(): Promise<AdminAccessSession> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  if (session.type === "admin") {
    return session;
  }

  if (await guestHasAdminAccess(session.email, session.id)) {
    return session;
  }

  throw new Error("Unauthorized");
}
