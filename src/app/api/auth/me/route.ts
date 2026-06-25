import { NextResponse } from "next/server";
import { guestHasAdminAccess } from "@/lib/auth/admin-access";
import { guestIsMcOrAdmin } from "@/lib/auth/mc-access";
import { getVendorAccessForSession } from "@/lib/auth/vendor-access";
import { syncGuestSessionFromDb } from "@/lib/auth/sync-guest-session";
import { getSession } from "@/lib/auth/session";
import { hasOnSiteAppAccess } from "@/lib/on-site-access";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({
      user: null,
      admin: null,
      canAccessAdmin: false,
      canManageVendors: false,
      canViewVendors: false,
      canVerifyBingo: false,
      hasOnSiteAccess: false,
      partyRole: null,
    });
  }

  const vendorAccess = await getVendorAccessForSession(session);

  if (session.type === "guest") {
    const fresh = await syncGuestSessionFromDb(session);
    if (!fresh) {
      return NextResponse.json({
        user: null,
        admin: null,
        canAccessAdmin: false,
        canManageVendors: false,
        canViewVendors: false,
        canVerifyBingo: false,
        hasOnSiteAccess: false,
        partyRole: null,
      });
    }

    const guestFlags = await prisma.guest.findUnique({
      where: { id: fresh.id },
      select: { isMc: true, assignedRoomName: true },
    });
    const canAccessAdmin = await guestHasAdminAccess(fresh.email);
    const canVerifyBingo = await guestIsMcOrAdmin(fresh.email, guestFlags?.isMc ?? false);
    const hasOnSiteAccess = hasOnSiteAppAccess(fresh.tier, {
      assignedRoomName: guestFlags?.assignedRoomName,
    });

    return NextResponse.json({
      user: {
        id: fresh.id,
        name: fresh.name,
        email: fresh.email,
        tier: fresh.tier,
      },
      admin: null,
      canAccessAdmin,
      canVerifyBingo,
      hasOnSiteAccess,
      canManageVendors: vendorAccess.canManageVendors,
      canViewVendors: vendorAccess.canViewVendors,
      partyRole: vendorAccess.partyRole,
    });
  }

  return NextResponse.json({
    user: null,
    admin: { id: session.id, name: session.name, email: session.email },
    canAccessAdmin: true,
    canVerifyBingo: true,
    hasOnSiteAccess: true,
    canManageVendors: vendorAccess.canManageVendors,
    canViewVendors: vendorAccess.canViewVendors,
    partyRole: null,
  });
}
