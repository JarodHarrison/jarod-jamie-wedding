import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import {
  guestProfileSelect,
  isGuestProfileSection,
  serializeGuestProfile,
  type GuestProfileSection,
} from "@/lib/guest-profile";
import { buildGuestProfileSectionUpdate } from "@/lib/guest-profile-update";
import { tierForClovellyAccommodation } from "@/lib/on-site-access";
import { syncGuestSessionFromDb } from "@/lib/auth/sync-guest-session";
import { requireGuestSession } from "@/lib/auth/session";
import { notifyRegistration } from "@/lib/registration-notify";
import { applyPlusOneLink } from "@/lib/plus-one-link";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireGuestSession();
    const guest = await prisma.guest.findUnique({
      where: { id: session.id },
      select: guestProfileSelect,
    });

    if (!guest) return jsonError("Guest not found.", 404);

    return NextResponse.json({ profile: serializeGuestProfile(guest) });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireGuestSession();
    const body = await request.json();
    const section = body.section as string;

    if (!isGuestProfileSection(section)) {
      return jsonError("Invalid form section.", 400);
    }

    const result = buildGuestProfileSectionUpdate(section, body);
    if (!result.ok) return jsonError(result.error, result.status);

    const existing = await prisma.guest.findUnique({
      where: { id: session.id },
      select: { tier: true },
    });

    if (!existing) return jsonError("Guest not found.", 404);

    const updateData = { ...result.data };

    if (section === "companion") {
      try {
        const plusOneGuestId = (updateData.plusOneGuestId as string | null) ?? null;
        if (plusOneGuestId) {
          await applyPlusOneLink(session.id, plusOneGuestId);
        } else {
          await applyPlusOneLink(session.id, null);
          await prisma.guest.update({
            where: { id: session.id },
            data: {
              plusOneName: (updateData.plusOneName as string | null) ?? null,
              profileUpdatedAt: new Date(),
            },
          });
        }
      } catch (linkError) {
        const message = linkError instanceof Error ? linkError.message : "Failed to link plus-one.";
        return jsonError(message, 400);
      }

      const guest = await prisma.guest.findUnique({
        where: { id: session.id },
        select: guestProfileSelect,
      });
      if (!guest) return jsonError("Guest not found.", 404);

      const profile = serializeGuestProfile(guest);
      notifyRegistration("companion", profile);
      return NextResponse.json({ profile, tierUpdated: false });
    }

    if (section === "accommodation") {
      const nextTier = tierForClovellyAccommodation(
        updateData.accommodationType as string | undefined,
        existing.tier,
      );
      if (nextTier) {
        updateData.tier = nextTier;
      }
    }

    const guest = await prisma.guest.update({
      where: { id: session.id },
      data: updateData,
      select: guestProfileSelect,
    });

    if (guest.tier !== session.tier) {
      await syncGuestSessionFromDb(session);
    }

    const profile = serializeGuestProfile(guest);
    notifyRegistration(section as GuestProfileSection, profile);

    return NextResponse.json({ profile, tierUpdated: guest.tier !== session.tier });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to save.", 500);
  }
}
