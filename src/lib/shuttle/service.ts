import type { ShuttleStop, ShuttleStopStatus, ShuttleStopStatusType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type StopWithStatus = ShuttleStop & { status: ShuttleStopStatus };

export async function getActiveShuttleRoute() {
  return prisma.shuttleRoute.findFirst({
    where: { active: true },
    include: {
      stops: { orderBy: { stopOrder: "asc" } },
    },
  });
}

export async function getActiveShuttleSession() {
  return prisma.shuttleSession.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { startedAt: "desc" },
    include: {
      route: { include: { stops: { orderBy: { stopOrder: "asc" } } } },
      driver: { select: { id: true, name: true } },
      stopStatuses: { include: { stop: true } },
      locations: { orderBy: { recordedAt: "desc" }, take: 1 },
    },
  });
}

export function sortStopStatuses(
  stops: ShuttleStop[],
  statuses: (ShuttleStopStatus & { stop: ShuttleStop })[],
) {
  const byStopId = new Map(statuses.map((s) => [s.stopId, s]));
  return stops.map((stop) => {
    const row = byStopId.get(stop.id);
    return {
      stop,
      status: row?.status ?? ("PENDING" as ShuttleStopStatusType),
      arrivedAt: row?.arrivedAt ?? null,
      departedAt: row?.departedAt ?? null,
    };
  });
}

export function getNextStop(
  ordered: ReturnType<typeof sortStopStatuses>,
): (typeof ordered)[number] | null {
  const enRoute = ordered.find((s) => s.status === "EN_ROUTE");
  if (enRoute) return enRoute;

  const pending = ordered.find((s) => s.status === "PENDING");
  if (pending) return pending;

  const arrived = ordered.find((s) => s.status === "ARRIVED");
  if (arrived) return arrived;

  return ordered.find((s) => s.status !== "COMPLETED" && s.status !== "DEPARTED") ?? null;
}

export async function createSessionStopStatuses(sessionId: string, routeId: string) {
  const stops = await prisma.shuttleStop.findMany({
    where: { routeId },
    orderBy: { stopOrder: "asc" },
  });

  await prisma.shuttleStopStatus.createMany({
    data: stops.map((stop, index) => ({
      sessionId,
      stopId: stop.id,
      status: index === 0 ? "EN_ROUTE" : "PENDING",
    })),
  });
}
