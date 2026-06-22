import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireDriverSession } from "@/lib/shuttle/driver-session";
import {
  createSessionStopStatuses,
  getActiveShuttleRoute,
  getActiveShuttleSession,
} from "@/lib/shuttle/service";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const driver = await requireDriverSession();
    const existing = await getActiveShuttleSession();

    if (existing) {
      return jsonError("A shuttle session is already active.", 409);
    }

    const route = await getActiveShuttleRoute();
    if (!route) {
      return jsonError("No active shuttle route configured.", 404);
    }

    const session = await prisma.shuttleSession.create({
      data: {
        routeId: route.id,
        driverId: driver.id,
        status: "ACTIVE",
      },
    });

    await createSessionStopStatuses(session.id, route.id);

    return NextResponse.json({
      session: {
        id: session.id,
        startedAt: session.startedAt.toISOString(),
        routeName: route.name,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to start tracking.", 500);
  }
}
