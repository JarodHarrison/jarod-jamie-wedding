import { NextResponse } from "next/server";
import { buildPasswordFields } from "@/lib/auth/password";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";
import { jsonError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ valid: false });
  }

  const record = await prisma.guestPasswordResetToken.findUnique({
    where: { token },
    include: { guest: { select: { name: true, email: true } } },
  });

  const valid =
    !!record && !record.usedAt && record.expiresAt.getTime() > Date.now();

  return NextResponse.json({
    valid,
    guestName: valid ? record.guest.name : undefined,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = (body.token ?? "").trim();
    const password = body.password ?? "";

    if (!token) {
      return jsonError("Reset link is invalid.", 400);
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return jsonError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, 400);
    }

    const record = await prisma.guestPasswordResetToken.findUnique({
      where: { token },
      include: { guest: true },
    });

    if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
      return jsonError("This reset link has expired or already been used.", 400);
    }

    const passwordFields = await buildPasswordFields(password);

    await prisma.$transaction([
      prisma.guest.update({
        where: { id: record.guestId },
        data: {
          passwordHash: passwordFields.passwordHash,
          passwordPlaintext: passwordFields.passwordPlaintext,
        },
      }),
      prisma.guestPasswordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ message: "Password updated. You can sign in now." });
  } catch (error) {
    console.error("[reset-password]", error);
    return jsonError("Failed to reset password. Please try again.", 500);
  }
}
