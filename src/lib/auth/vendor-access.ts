import type { PartyRole } from "@prisma/client";
import { guestHasAdminAccess } from "@/lib/auth/admin-access";
import { getSession, type SessionPayload } from "@/lib/auth/session";
import { canViewVendorPortal } from "@/lib/wedding-event";
import { prisma } from "@/lib/prisma";

export type VendorAccessFlags = {
  canManageVendors: boolean;
  canViewVendors: boolean;
  partyRole: PartyRole | null;
};

export async function getVendorAccessForSession(
  session: SessionPayload | null,
): Promise<VendorAccessFlags> {
  if (!session) {
    return { canManageVendors: false, canViewVendors: false, partyRole: null };
  }

  if (session.type === "admin") {
    return { canManageVendors: true, canViewVendors: true, partyRole: null };
  }

  const guest = await prisma.guest.findUnique({
    where: { id: session.id },
    select: { partyRole: true, email: true },
  });

  const isAdminGuest = await guestHasAdminAccess(session.email);
  if (isAdminGuest) {
    return {
      canManageVendors: true,
      canViewVendors: true,
      partyRole: guest?.partyRole ?? null,
    };
  }

  const isBestBitch = guest?.partyRole === "BEST_BITCH";
  const canViewVendors = isBestBitch && canViewVendorPortal();

  return {
    canManageVendors: false,
    canViewVendors,
    partyRole: guest?.partyRole ?? null,
  };
}

export async function requireVendorManagement() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const access = await getVendorAccessForSession(session);
  if (!access.canManageVendors) throw new Error("Unauthorized");

  return session;
}

export async function requireVendorView() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const access = await getVendorAccessForSession(session);
  if (!access.canViewVendors && !access.canManageVendors) throw new Error("Unauthorized");

  return session;
}
