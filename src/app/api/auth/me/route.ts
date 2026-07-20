import { NextResponse } from "next/server";
import { guestHasAdminAccess } from "@/lib/auth/admin-access";
import { emailIsBucksPartyOrganiser } from "@/lib/auth/bucks-party-access";
import { guestIsMcOrAdmin } from "@/lib/auth/mc-access";
import { getVendorAccessForSession } from "@/lib/auth/vendor-access";
import { getLinkedGuestForAdmin, toWeddingUser } from "@/lib/auth/linked-guest";
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
      canAccessBucksOrganiser: false,
      hasOnSiteAccess: false,
      bucksPartyAttending: false,
      glowUpRegistered: false,
      glowUpInterest: null,
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
        canAccessBucksOrganiser: false,
        hasOnSiteAccess: false,
        bucksPartyAttending: false,
        glowUpRegistered: false,
        glowUpInterest: null,
        partyRole: null,
      });
    }

    const guestFlags = await prisma.guest.findUnique({
      where: { id: fresh.id },
      select: {
        isMc: true,
        isBucksPartyAdmin: true,
        assignedRoomName: true,
        glowUpInterest: true,
        goldCoastTrip: { select: { id: true } },
        bucksPartyRsvp: { select: { attending: true } },
        glowUpPartyInterest: { select: { interest: true } },
      },
    });
    const canAccessAdmin = await guestHasAdminAccess(fresh.email);
    const canVerifyBingo = await guestIsMcOrAdmin(fresh.email, guestFlags?.isMc ?? false);
    const hasOnSiteAccess = hasOnSiteAppAccess(fresh.tier, {
      assignedRoomName: guestFlags?.assignedRoomName,
    });
    const canAccessBucksOrganiser =
      canAccessAdmin ||
      Boolean(guestFlags?.isBucksPartyAdmin) ||
      emailIsBucksPartyOrganiser(fresh.email);
    const glowUpInterest =
      guestFlags?.glowUpPartyInterest?.interest ?? guestFlags?.glowUpInterest ?? null;
    const glowUpRegistered = Boolean(glowUpInterest);

    if (
      emailIsBucksPartyOrganiser(fresh.email) &&
      guestFlags &&
      !guestFlags.isBucksPartyAdmin
    ) {
      void prisma.guest
        .update({
          where: { id: fresh.id },
          data: { isBucksPartyAdmin: true },
        })
        .catch(() => undefined);
    }

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
      canAccessBucksOrganiser,
      hasOnSiteAccess,
      hasGoldCoastTrip: Boolean(guestFlags?.goldCoastTrip),
      bucksPartyAttending: Boolean(guestFlags?.bucksPartyRsvp?.attending),
      glowUpRegistered,
      glowUpInterest,
      canManageVendors: vendorAccess.canManageVendors,
      canViewVendors: vendorAccess.canViewVendors,
      partyRole: vendorAccess.partyRole,
    });
  }

  const linkedGuest = await getLinkedGuestForAdmin(session.id);
  const linkedGuestFlags = linkedGuest
    ? await prisma.guest.findUnique({
        where: { id: linkedGuest.id },
        select: {
          goldCoastTrip: { select: { id: true } },
          bucksPartyRsvp: { select: { attending: true } },
          glowUpInterest: true,
          glowUpPartyInterest: { select: { interest: true } },
        },
      })
    : null;

  const linkedGlowUpInterest =
    linkedGuestFlags?.glowUpPartyInterest?.interest ?? linkedGuestFlags?.glowUpInterest ?? null;

  return NextResponse.json({
    user: linkedGuest ? toWeddingUser(linkedGuest) : null,
    admin: { id: session.id, name: session.name, email: session.email },
    canAccessAdmin: true,
    canVerifyBingo: true,
    canAccessBucksOrganiser: true,
    hasOnSiteAccess: true,
    hasGoldCoastTrip: Boolean(linkedGuestFlags?.goldCoastTrip),
    bucksPartyAttending: Boolean(linkedGuestFlags?.bucksPartyRsvp?.attending),
    glowUpRegistered: Boolean(linkedGlowUpInterest),
    glowUpInterest: linkedGlowUpInterest,
    canManageVendors: vendorAccess.canManageVendors,
    canViewVendors: vendorAccess.canViewVendors,
    partyRole: null,
  });
}
