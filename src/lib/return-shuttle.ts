export const RETURN_SHUTTLE_AIRPORTS = ["MCY", "BNE"] as const;

export type ReturnShuttleAirport = (typeof RETURN_SHUTTLE_AIRPORTS)[number];

export const RETURN_SHUTTLE = {
  date: "2026-10-27",
  time: "11:00",
  displayDate: "Monday 27 October",
  displayTime: "11:00 am",
  description:
    "We're organising a return coach leaving Spicers at 11:00 am on Monday 27 October, with drop-offs at Sunshine Coast (MCY) and Brisbane (BNE) airports.",
} as const;

export const CHARTER_GUEST_THRESHOLD = 6;

export function isReturnShuttleAirport(value: string): value is ReturnShuttleAirport {
  return RETURN_SHUTTLE_AIRPORTS.includes(value as ReturnShuttleAirport);
}

export function returnShuttleAirportLabel(code: string | null | undefined): string {
  if (code === "MCY") return "Sunshine Coast (MCY)";
  if (code === "BNE") return "Brisbane (BNE)";
  return code ?? "Unknown";
}
