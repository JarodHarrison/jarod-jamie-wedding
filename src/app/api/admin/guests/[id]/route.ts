import { NextResponse } from "next/server";
import { hashPassword, generateTemporaryPassword } from "@/lib/auth/password";
import { requireAdminSession } from "@/lib/auth/session";
import { jsonError, normalizeEmail, isValidGuestTier } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    const body = await request.json();

    const data: {
      name?: string;
      email?: string;
      tier?: "PENTHOUSE" | "ON_SITE" | "OFF_SITE";
      passwordHash?: string;
    } = {};

    if (body.name !== undefined) {
      const name = body.name.trim();
      if (!name) return jsonError("Name cannot be empty.", 400);
      data.name = name;
    }

    if (body.email !== undefined) {
      const email = normalizeEmail(body.email);
      if (!email) return jsonError("Email cannot be empty.", 400);
      data.email = email;
    }

    if (body.tier !== undefined) {
      if (!isValidGuestTier(body.tier)) return jsonError("Invalid guest tier.", 400);
      data.tier = body.tier;
    }

    if (body.resetPassword === true) {
      const newPassword = body.password?.trim() || generateTemporaryPassword();
      data.passwordHash = await hashPassword(newPassword);

      const guest = await prisma.guest.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          tier: true,
          rsvpStatus: true,
          createdAt: true,
        },
      });

      return NextResponse.json({ guest, temporaryPassword: newPassword });
    }

    const guest = await prisma.guest.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        tier: true,
        rsvpStatus: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ guest });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to update guest.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    await prisma.guest.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to delete guest.", 500);
  }
}
