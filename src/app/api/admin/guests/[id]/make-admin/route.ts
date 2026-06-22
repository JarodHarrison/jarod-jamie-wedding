import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/session";
import { jsonError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await context.params;

    const guest = await prisma.guest.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, passwordHash: true },
    });

    if (!guest) return jsonError("Guest not found.", 404);

    const existing = await prisma.admin.findUnique({ where: { email: guest.email } });
    if (existing) {
      return jsonError("This guest is already an admin.", 409);
    }

    const admin = await prisma.admin.create({
      data: {
        name: guest.name,
        email: guest.email,
        passwordHash: guest.passwordHash,
      },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({
      admin,
      message: `${guest.name} can now sign in with their existing password and will have admin access.`,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to grant admin access.", 500);
  }
}
