import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    await requireAdminAccess();
    const body = await request.json();
    const displayCode = (body.displayCode ?? "").toString().trim().toUpperCase();
    const feedToken = (body.feedToken ?? "").toString().trim();

    if (!displayCode && !feedToken) {
      return jsonError("Provide a kiosk code or feed token.", 400);
    }

    await prisma.kioskSession.updateMany({
      where: displayCode ? { displayCode } : { feedToken },
      data: { status: "ENDED" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to end kiosk session.", 500);
  }
}
