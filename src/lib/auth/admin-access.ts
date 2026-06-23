import { prisma } from "@/lib/prisma";
import { getSession, type AdminSession, type GuestSession } from "@/lib/auth/session";

export type AdminAccessSession = AdminSession | GuestSession;

export async function guestHasAdminAccess(email: string): Promise<boolean> {
  const admin = await prisma.admin.findUnique({
    where: { email },
    select: { id: true },
  });
  return !!admin;
}

/** Admin session, or guest whose email is also in the Admin table (Make Admin). */
export async function requireAdminAccess(): Promise<AdminAccessSession> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  if (session.type === "admin") {
    return session;
  }

  if (await guestHasAdminAccess(session.email)) {
    return session;
  }

  throw new Error("Unauthorized");
}
