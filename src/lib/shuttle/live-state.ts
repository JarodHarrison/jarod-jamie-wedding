import { formatEtaTime, getDrivingEta } from "@/lib/shuttle/eta";
import { buildGuestShuttleMessage } from "@/lib/shuttle/messages";
import {
  getActiveShuttleRoute,
  getActiveShuttleSession,
  getNextStop,
  sortStopStatuses,
} from "@/lib/shuttle/service";
import { isShuttleFeatureVisible, VENUE_STOP_SLUG } from "@/lib/shuttle/stops";
import type { ShuttleLiveState } from "@/types/shuttle";

export async function buildShuttleLiveState(): Promise<ShuttleLiveState> {
  const visible = isShuttleFeatureVisible();
  const route = await getActiveShuttleRoute();
  const session = await getActiveShuttleSession();

  if (!route) {
    return {
      visible,
      tracking: false,
      message: "Shuttle route is not configured yet.",
      sessionId: null,
      driverName: null,
      startedAt: null,
      location: null,
      stops: [],
      nextStop: null,
      venue: null,
      etas: { nextStop: null, venue: null },
    };
  }

  const ordered =
    session && session.routeId === route.id
      ? sortStopStatuses(route.stops, session.stopStatuses)
      : route.stops.map((stop) => ({
          stop,
          status: "PENDING" as const,
          arrivedAt: null,
          departedAt: null,
        }));

  const stops = ordered.map(({ stop, status, arrivedAt, departedAt }) => ({
    id: stop.id,
    slug: stop.slug,
    name: stop.name,
    address: stop.address,
    latitude: stop.latitude,
    longitude: stop.longitude,
    stopOrder: stop.stopOrder,
    status,
    arrivedAt: arrivedAt?.toISOString() ?? null,
    departedAt: departedAt?.toISOString() ?? null,
  }));

  const venue = stops.find((s) => s.slug === VENUE_STOP_SLUG) ?? null;
  const tracking = !!session && session.status === "ACTIVE";
  const latest = session?.locations[0] ?? null;
  const next = tracking ? getNextStop(ordered) : null;

  const nextStopView = next
    ? stops.find((s) => s.id === next.stop.id) ?? null
    : null;

  let etas: ShuttleLiveState["etas"] = { nextStop: null, venue: null };

  if (tracking && latest && next) {
    const origin = { latitude: latest.latitude, longitude: latest.longitude };
    const nextEta = await getDrivingEta(origin, {
      latitude: next.stop.latitude,
      longitude: next.stop.longitude,
    });
    if (nextEta) {
      etas.nextStop = {
        durationText: nextEta.durationText,
        arrivalIso: nextEta.arrivalIso,
        arrivalLabel: formatEtaTime(nextEta.arrivalIso),
      };
    }

    if (venue && venue.id !== next.stop.id) {
      const venueEta = await getDrivingEta(origin, {
        latitude: venue.latitude,
        longitude: venue.longitude,
      });
      if (venueEta) {
        etas.venue = {
          durationText: venueEta.durationText,
          arrivalIso: venueEta.arrivalIso,
          arrivalLabel: formatEtaTime(venueEta.arrivalIso),
        };
      }
    } else if (venue && nextEta) {
      etas.venue = etas.nextStop;
    }
  }

  const message = buildGuestShuttleMessage(
    tracking,
    nextStopView ? { name: nextStopView.name, status: nextStopView.status } : null,
    etas.nextStop?.arrivalLabel ?? null,
  );

  return {
    visible,
    tracking,
    message,
    sessionId: session?.id ?? null,
    driverName: session?.driver.name ?? null,
    startedAt: session?.startedAt.toISOString() ?? null,
    location: latest
      ? {
          latitude: latest.latitude,
          longitude: latest.longitude,
          heading: latest.heading,
          speed: latest.speed,
          recordedAt: latest.recordedAt.toISOString(),
        }
      : null,
    stops,
    nextStop: nextStopView,
    venue,
    etas,
  };
}
