import { guestHasAdminAccess } from "@/lib/auth/admin-access";
import { getSession, type AdminSession, type GuestSession } from "@/lib/auth/session";
import { normalizeEmail } from "@/lib/api-utils";
import { BUCKS_PARTY_ORGANISER_EMAILS } from "@/lib/bucks-party";
import { prisma } from "@/lib/prisma";

export type BucksPartyAccessSession = AdminSession | GuestSession;

const ORGANISER_EMAIL_SET = new Set(
  BUCKS_PARTY_ORGANISER_EMAILS.map((email) => normalizeEmail(email)),
);

export function emailIsBucksPartyOrganiser(email: string): boolean {
  return ORGANISER_EMAIL_SET.has(normalizeEmail(email));
}

export async function guestIsBucksPartyAdmin(guestId: string, email: string): Promise<boolean> {
  if (await guestHasAdminAccess(email)) return true;
  if (emailIsBucksPartyOrganiser(email)) {
    // Keep the DB flag in sync so organiser lists stay accurate
    await prisma.guest
      .update({
        where: { id: guestId },
        data: { isBucksPartyAdmin: true },
      })
      .catch(() => undefined);
    return true;
  }

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: { isBucksPartyAdmin: true },
  });
  return Boolean(guest?.isBucksPartyAdmin);
}

/** Full wedding admin or guest with isBucksPartyAdmin / organiser email. */
export async function requireBucksPartyAccess(): Promise<BucksPartyAccessSession> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  if (session.type === "admin") return session;

  if (await guestIsBucksPartyAdmin(session.id, session.email)) {
    return session;
  }

  throw new Error("Unauthorized");
}
