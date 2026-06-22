import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireDriverSession } from "@/lib/shuttle/driver-session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const driver = await requireDriverSession();
    const body = await request.json();
    const action = body.action as string;

    if (action !== "arrived" && action !== "departed") {
      return jsonError("Invalid action.", 400);
    }

    const session = await prisma.shuttleSession.findFirst({
      where: { driverId: driver.id, status: "ACTIVE" },
      include: {
        route: { include: { stops: { orderBy: { stopOrder: "asc" } } } },
        stopStatuses: { include: { stop: true } },
      },
      orderBy: { startedAt: "desc" },
    });

    if (!session) {
      return jsonError("No active tracking session.", 404);
    }

    const current = session.stopStatuses.find((s) => s.status === "EN_ROUTE");
    if (!current) {
      return jsonError("No stop is currently en route.", 400);
    }

    const now = new Date();

    if (action === "arrived") {
      await prisma.shuttleStopStatus.update({
        where: { id: current.id },
        data: { status: "ARRIVED", arrivedAt: now },
      });
    } else {
      await prisma.shuttleStopStatus.update({
        where: { id: current.id },
        data: { status: "DEPARTED", departedAt: now },
      });

      const stops = session.route.stops;
      const currentIndex = stops.findIndex((s) => s.id === current.stopId);
      const nextStop = stops[currentIndex + 1];

      if (nextStop) {
        const nextStatus = session.stopStatuses.find((s) => s.stopId === nextStop.id);
        if (nextStatus) {
          await prisma.shuttleStopStatus.update({
            where: { id: nextStatus.id },
            data: { status: "EN_ROUTE" },
          });
        }
      } else {
        await prisma.shuttleStopStatus.update({
          where: { id: current.id },
          data: { status: "COMPLETED" },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to update stop status.", 500);
  }
}
