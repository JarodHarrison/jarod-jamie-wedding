import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { KIOSK_SESSION_HOURS } from "@/lib/kiosk";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const admin = await requireAdminAccess();
    const body = await request.json();
    const code = (body.code ?? "").toString().trim().toUpperCase();

    if (!code) {
      return jsonError("Kiosk code is required.", 400);
    }

    const session = await prisma.kioskSession.findUnique({
      where: { displayCode: code },
    });

    if (!session) {
      return jsonError("Kiosk code not found. Check the TV screen.", 404);
    }

    if (session.status === "ENDED") {
      return jsonError("This kiosk session has ended. Refresh the TV to start a new one.", 400);
    }

    const expiresAt = new Date(Date.now() + KIOSK_SESSION_HOURS * 60 * 60 * 1000);

    const updated = await prisma.kioskSession.update({
      where: { id: session.id },
      data: {
        status: "ACTIVE",
        activatedAt: new Date(),
        activatedByAdminEmail: admin.email,
        expiresAt,
      },
    });

    return NextResponse.json({
      ok: true,
      displayCode: updated.displayCode,
      expiresAt: updated.expiresAt?.toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Sign in as admin to activate the kiosk.", 401);
    }
    return jsonError("Failed to activate kiosk.", 500);
  }
}
