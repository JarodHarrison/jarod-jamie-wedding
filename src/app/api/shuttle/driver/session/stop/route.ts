import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireDriverSession } from "@/lib/shuttle/driver-session";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const driver = await requireDriverSession();

    const session = await prisma.shuttleSession.findFirst({
      where: { driverId: driver.id, status: "ACTIVE" },
      orderBy: { startedAt: "desc" },
    });

    if (!session) {
      return jsonError("No active tracking session.", 404);
    }

    await prisma.shuttleSession.update({
      where: { id: session.id },
      data: { status: "ENDED", endedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to stop tracking.", 500);
  }
}
