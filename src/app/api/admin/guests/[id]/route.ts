import { NextResponse } from "next/server";
import {
  buildPasswordFields,
  generateTemporaryPassword,
} from "@/lib/auth/password";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { jsonError, normalizeEmail, isValidGuestTier } from "@/lib/api-utils";
import { adminGuestSelect, serializeAdminGuest } from "@/lib/guest-profile";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminAccess();
    const { id } = await context.params;
    const body = await request.json();

    const data: {
      name?: string;
      email?: string;
      tier?: "PENTHOUSE" | "ON_SITE" | "OFF_SITE";
      partyRole?: "BEST_BITCH" | null;
      isMc?: boolean;
      passwordHash?: string;
      passwordPlaintext?: string | null;
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

    if (body.partyRole !== undefined) {
      data.partyRole = body.partyRole === "BEST_BITCH" ? "BEST_BITCH" : null;
    }

    if (body.isMc !== undefined) {
      data.isMc = Boolean(body.isMc);
    }

    let newPassword: string | undefined;

    if (body.resetPassword === true) {
      newPassword = body.password?.trim() || generateTemporaryPassword();
    } else if (typeof body.password === "string" && body.password.trim()) {
      newPassword = body.password.trim();
    }

    if (newPassword !== undefined) {
      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        return jsonError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, 400);
      }
      const passwordFields = await buildPasswordFields(newPassword);
      data.passwordHash = passwordFields.passwordHash;
      data.passwordPlaintext = passwordFields.passwordPlaintext;
    }

    const guest = await prisma.guest.update({
      where: { id },
      data,
      select: adminGuestSelect,
    });

    const adminEmails = new Set(
      (await prisma.admin.findMany({ select: { email: true } })).map((a) => a.email),
    );

    const profile = {
      ...serializeAdminGuest(guest),
      isAdmin: adminEmails.has(guest.email),
    };

    if (newPassword !== undefined) {
      return NextResponse.json({
        guest: profile,
        passwordPlaintext: newPassword,
        temporaryPassword: body.resetPassword === true ? newPassword : undefined,
      });
    }

    return NextResponse.json({ guest: profile });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to update guest.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdminAccess();
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
