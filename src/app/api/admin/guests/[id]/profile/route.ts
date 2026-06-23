import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import {
  guestProfileSelect,
  isGuestProfileSection,
  serializeGuestProfile,
} from "@/lib/guest-profile";
import { buildGuestProfileSectionUpdate } from "@/lib/guest-profile-update";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminAccess();
    const { id } = await context.params;
    const body = await request.json();
    const section = body.section as string;

    if (!isGuestProfileSection(section)) {
      return jsonError("Invalid form section.", 400);
    }

    const existing = await prisma.guest.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return jsonError("Guest not found.", 404);

    const result = buildGuestProfileSectionUpdate(section, body, { isAdmin: true });
    if (!result.ok) return jsonError(result.error, result.status);

    const guest = await prisma.guest.update({
      where: { id },
      data: result.data,
      select: guestProfileSelect,
    });

    return NextResponse.json({ profile: serializeGuestProfile(guest) });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to update guest profile.", 500);
  }
}
