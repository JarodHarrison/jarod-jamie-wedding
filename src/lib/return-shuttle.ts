import { APP_BUILD_ID } from "@/lib/app-build-id";

export const RETURN_SHUTTLE_AIRPORTS = ["MCY", "BNE"] as const;

export type ReturnShuttleAirport = (typeof RETURN_SHUTTLE_AIRPORTS)[number];

export const RETURN_SHUTTLE_FLYER_PATH = "/transfers/airport-express-departure.png";

/** Cache-busted src for static flyer assets — use with native <img>, not next/image. */
export function returnShuttleFlyerSrc(): string {
  return `${RETURN_SHUTTLE_FLYER_PATH}?v=${encodeURIComponent(APP_BUILD_ID)}`;
}

export const RETURN_SHUTTLE = {
  date: "2026-09-27",
  displayDate: "Sunday 27 September",
  title: "Airport Express",
  description:
    "Departure-only coach from Spicers Clovelly Estate on Sunday 27 September — relax, unwind, and we'll get you to the airport in style.",
} as const;

export const RETURN_SHUTTLE_AIRPORT_DETAILS: Record<
  ReturnShuttleAirport,
  { departureTime: string; priceGuide: string }
> = {
  BNE: { departureTime: "11:00 am", priceGuide: "around $40 per person" },
  MCY: { departureTime: "10:45 am", priceGuide: "$20–$30 per person" },
};

export const CHARTER_GUEST_THRESHOLD = 6;

export function isReturnShuttleAirport(value: string): value is ReturnShuttleAirport {
  return RETURN_SHUTTLE_AIRPORTS.includes(value as ReturnShuttleAirport);
}

export function returnShuttleAirportLabel(code: string | null | undefined): string {
  if (code === "MCY") return "Sunshine Coast (MCY)";
  if (code === "BNE") return "Brisbane (BNE)";
  return code ?? "Unknown";
}

export function returnShuttleOptionLabel(code: ReturnShuttleAirport): string {
  const details = RETURN_SHUTTLE_AIRPORT_DETAILS[code];
  return `${returnShuttleAirportLabel(code)} — departs ${details.departureTime} (${details.priceGuide})`;
}
