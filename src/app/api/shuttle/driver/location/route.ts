import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireDriverSession } from "@/lib/shuttle/driver-session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const driver = await requireDriverSession();
    const body = await request.json();

    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return jsonError("Invalid coordinates.", 400);
    }

    const session = await prisma.shuttleSession.findFirst({
      where: { driverId: driver.id, status: "ACTIVE" },
      orderBy: { startedAt: "desc" },
    });

    if (!session) {
      return jsonError("No active tracking session.", 404);
    }

    const location = await prisma.shuttleLocation.create({
      data: {
        sessionId: session.id,
        latitude,
        longitude,
        speed: body.speed == null ? null : Number(body.speed),
        heading: body.heading == null ? null : Number(body.heading),
        accuracy: body.accuracy == null ? null : Number(body.accuracy),
      },
    });

    return NextResponse.json({
      location: {
        id: location.id,
        recordedAt: location.recordedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to save location.", 500);
  }
}
