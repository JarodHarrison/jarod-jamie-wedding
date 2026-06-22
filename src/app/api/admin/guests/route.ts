import { NextResponse } from "next/server";
import {
  buildPasswordFields,
  generateTemporaryPassword,
  MIN_PASSWORD_LENGTH,
} from "@/lib/auth/password";
import { requireAdminSession } from "@/lib/auth/session";
import { jsonError, normalizeEmail, isValidGuestTier } from "@/lib/api-utils";
import { adminGuestSelect, serializeAdminGuest } from "@/lib/guest-profile";
import { sendGuestInviteEmail } from "@/lib/guest-emails";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdminSession();
    const guests = await prisma.guest.findMany({
      orderBy: { name: "asc" },
      select: adminGuestSelect,
    });
    const adminEmails = new Set(
      (await prisma.admin.findMany({ select: { email: true } })).map((a) => a.email),
    );
    return NextResponse.json({
      guests: guests.map((g) => ({
        ...serializeAdminGuest(g),
        isAdmin: adminEmails.has(g.email),
      })),
    });
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

    const passwordFields = await buildPasswordFields(password);

    const guest = await prisma.guest.create({
      data: {
        name,
        email,
        tier,
        passwordHash: passwordFields.passwordHash,
        passwordPlaintext: passwordFields.passwordPlaintext,
      },
      select: adminGuestSelect,
    });

    void sendGuestInviteEmail({ name, email, password });

    return NextResponse.json(
      {
        guest: serializeAdminGuest(guest),
        temporaryPassword: password,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to create guest.", 500);
  }
}
