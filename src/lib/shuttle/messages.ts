import type { ShuttleStopStatusType } from "@prisma/client";

type StopInfo = {
  name: string;
  status: ShuttleStopStatusType;
};

export function buildGuestShuttleMessage(
  tracking: boolean,
  nextStop: StopInfo | null,
  nextStopEta: string | null,
): string {
  if (!tracking) {
    return "The shuttle is not currently tracking. Please be ready at your scheduled pickup time.";
  }

  if (!nextStop) {
    return "The shuttle location is temporarily unavailable. Please be ready at your scheduled pickup time.";
  }

  if (nextStop.status === "ARRIVED") {
    return `The shuttle has arrived at ${nextStop.name}.`;
  }

  if (nextStopEta) {
    return `The shuttle is on the way to ${nextStop.name}. Estimated arrival: ${nextStopEta}.`;
  }

  return `The shuttle is on the way to ${nextStop.name}.`;
}
