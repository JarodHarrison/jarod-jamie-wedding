import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import {
  guestProfileSelect,
  isGuestProfileSection,
  serializeGuestProfile,
  type GuestProfileSection,
} from "@/lib/guest-profile";
import { buildGuestProfileSectionUpdate } from "@/lib/guest-profile-update";
import { requireGuestSession } from "@/lib/auth/session";
import { notifyRegistration } from "@/lib/registration-notify";
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

    const guest = await prisma.guest.update({
      where: { id: session.id },
      data: result.data,
      select: guestProfileSelect,
    });

    const profile = serializeGuestProfile(guest);
    notifyRegistration(section as GuestProfileSection, profile);

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to save.", 500);
  }
}
