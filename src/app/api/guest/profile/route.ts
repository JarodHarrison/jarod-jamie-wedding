import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { buildRsvpHydrationUpdate } from "@/lib/rsvp-form-defaults";
import { guestProfileSelect, isGuestProfileSection, serializeGuestProfile, type GuestProfileSection } from "@/lib/guest-profile";
import { buildGuestProfileSectionUpdate } from "@/lib/guest-profile-update";
import { tierForClovellyAccommodation } from "@/lib/on-site-access";
import { syncGuestSessionFromDb } from "@/lib/auth/sync-guest-session";
import { requireGuestSession } from "@/lib/auth/session";
import { notifyRegistration } from "@/lib/registration-notify";
import { applyPlusOneLink } from "@/lib/plus-one-link";
import { ensurePlusOneGuestFromName } from "@/lib/guest-party";
import { syncTransferMatchesForGuest } from "@/lib/transfer-match";
import { checkTransferCharterAlerts } from "@/lib/transfer-charter-alert";
import { prisma } from "@/lib/prisma";
import { isVisionModerationEnabled } from "@/lib/google-vision-moderation";

export async function GET() {
  try {
    const session = await requireGuestSession();
    let guest = await prisma.guest.findUnique({
      where: { id: session.id },
      select: guestProfileSelect,
    });

    if (!guest) return jsonError("Guest not found.", 404);

    const sayiCustomData =
      guest.sayiCustomData && typeof guest.sayiCustomData === "object" && !Array.isArray(guest.sayiCustomData)
        ? (guest.sayiCustomData as Record<string, string>)
        : null;

    const hydration = buildRsvpHydrationUpdate({
      phone: guest.phone,
      plusOneName: guest.plusOneName,
      plusOneGuestId: guest.plusOneGuestId,
      dietaryNotes: guest.dietaryNotes,
      songRequest: guest.songRequest,
      sayiCustomData,
      sayiImportedAt: guest.sayiImportedAt,
    });

    if (hydration) {
      guest = await prisma.guest.update({
        where: { id: session.id },
        data: hydration,
        select: guestProfileSelect,
      });
    }

    return NextResponse.json({
      profile: serializeGuestProfile(guest),
      visionModerationEnabled: isVisionModerationEnabled(),
    });
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

    const existingGuest = await prisma.guest.findUnique({
      where: { id: session.id },
      select: guestProfileSelect,
    });

    if (!existingGuest) return jsonError("Guest not found.", 404);

    if (section === "party-bio" && !existingGuest.isMc && !existingGuest.isCelebrant) {
      return jsonError("Party bio is only available for the celebrant and MCs.", 403);
    }

    const result = buildGuestProfileSectionUpdate(section, body, {
      existing: existingGuest,
    });
    if (!result.ok) return jsonError(result.error, result.status);

    const updateData = { ...result.data };

    if (section === "companion") {
      try {
        const plusOneGuestId = (updateData.plusOneGuestId as string | null) ?? null;
        if (plusOneGuestId) {
          await applyPlusOneLink(session.id, plusOneGuestId);
        } else {
          // Name-only companion: create/link a real guest so they appear on the Guest List
          await ensurePlusOneGuestFromName(
            session.id,
            (updateData.plusOneName as string | null) ?? null,
          );
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
        existingGuest.tier,
      );
      if (nextTier) {
        updateData.tier = nextTier;
      }
    }

    // RSVP plus-one name is expanded into a real Guest after the main update
    const rsvpPlusOneName =
      section === "rsvp" ? ((updateData.plusOneName as string | null) ?? null) : undefined;

    const guest = await prisma.guest.update({
      where: { id: session.id },
      data: updateData,
      select: guestProfileSelect,
    });

    if (section === "rsvp") {
      try {
        await ensurePlusOneGuestFromName(session.id, rsvpPlusOneName ?? null);
      } catch (linkError) {
        console.error("[guest/profile rsvp plus-one]", linkError);
      }
    }

    const refreshed =
      section === "rsvp"
        ? await prisma.guest.findUnique({
            where: { id: session.id },
            select: guestProfileSelect,
          })
        : guest;
    if (!refreshed) return jsonError("Guest not found.", 404);

    if (refreshed.tier !== session.tier) {
      await syncGuestSessionFromDb(session);
    }

    const profile = serializeGuestProfile(refreshed);
    notifyRegistration(section, profile);

    if (section === "transfer") {
      void syncTransferMatchesForGuest(session.id)
        .then(() => checkTransferCharterAlerts())
        .catch((error) => {
          console.error("[guest/profile transfer match]", error);
        });
    }

    return NextResponse.json({ profile, tierUpdated: refreshed.tier !== session.tier });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to save.", 500);
  }
}
