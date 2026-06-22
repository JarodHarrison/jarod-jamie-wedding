import { NextResponse } from "next/server";
import { hashPassword, generateTemporaryPassword } from "@/lib/auth/password";
import { requireAdminSession } from "@/lib/auth/session";
import { jsonError, normalizeEmail, isValidGuestTier } from "@/lib/api-utils";
import { guestProfileSelect, serializeGuestProfile } from "@/lib/guest-profile";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdminSession();
    const guests = await prisma.guest.findMany({
      orderBy: { name: "asc" },
      select: guestProfileSelect,
    });
    return NextResponse.json({ guests: guests.map(serializeGuestProfile) });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = await request.json();
    const name = (body.name ?? "").trim();
    const email = normalizeEmail(body.email ?? "");
    const tier = body.tier ?? "OFF_SITE";
    const password = body.password?.trim() || generateTemporaryPassword();

    if (!name || !email) {
      return jsonError("Name and email are required.", 400);
    }
    if (!isValidGuestTier(tier)) {
      return jsonError("Invalid guest tier.", 400);
    }

    const existing = await prisma.guest.findUnique({ where: { email } });
    if (existing) {
      return jsonError("A guest with this email already exists.", 409);
    }

    const guest = await prisma.guest.create({
      data: {
        name,
        email,
        tier,
        passwordHash: await hashPassword(password),
      },
      select: {
        id: true,
        name: true,
        email: true,
        tier: true,
        rsvpStatus: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ guest, temporaryPassword: password }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to create guest.", 500);
  }
}
