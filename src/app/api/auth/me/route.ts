import { NextResponse } from "next/server";
import { guestHasAdminAccess } from "@/lib/auth/admin-access";
import { getVendorAccessForSession } from "@/lib/auth/vendor-access";
import { syncGuestSessionFromDb } from "@/lib/auth/sync-guest-session";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({
      user: null,
      admin: null,
      canAccessAdmin: false,
      canManageVendors: false,
      canViewVendors: false,
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
        partyRole: null,
      });
    }

    const canAccessAdmin = await guestHasAdminAccess(fresh.email);
    return NextResponse.json({
      user: {
        id: fresh.id,
        name: fresh.name,
        email: fresh.email,
        tier: fresh.tier,
      },
      admin: null,
      canAccessAdmin,
      canManageVendors: vendorAccess.canManageVendors,
      canViewVendors: vendorAccess.canViewVendors,
      partyRole: vendorAccess.partyRole,
    });
  }

  return NextResponse.json({
    user: null,
    admin: { id: session.id, name: session.name, email: session.email },
    canAccessAdmin: true,
    canManageVendors: vendorAccess.canManageVendors,
    canViewVendors: vendorAccess.canViewVendors,
    partyRole: null,
  });
}
