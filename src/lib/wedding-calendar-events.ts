import { LAKESIDE_MEET_GREET } from "@/lib/on-site-access";
import { WEDDING_TIMEZONE } from "@/lib/wedding-event";

export type WeddingCalendarEvent = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  /** ISO 8601 with offset */
  start: string;
  end: string;
};

const VENUE = "Spicers Clovelly Estate, 68 Mapleton Road, Montville QLD 4560";

function parseTimeOnDate(isoDate: string, time: string): Date {
  const normalized = time.trim().toLowerCase().replace(/\s+/g, " ");
  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) {
    throw new Error(`Unsupported time format: ${time}`);
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  const meridiem = match[3];

  if (meridiem === "pm" && hours < 12) hours += 12;
  if (meridiem === "am" && hours === 12) hours = 0;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return new Date(`${isoDate}T${hh}:${mm}:00+10:00`);
}

function eventWindow(
  isoDate: string,
  time: string,
  durationMinutes: number,
  partial?: Omit<WeddingCalendarEvent, "start" | "end">,
): WeddingCalendarEvent {
  const startDate = parseTimeOnDate(isoDate, time);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60_000);

  return {
    id: partial?.id ?? `${isoDate}-${time}`,
    title: partial?.title ?? "Wedding event",
    description: partial?.description,
    location: partial?.location,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
}

export const WEDDING_CALENDAR_EVENTS: Record<string, WeddingCalendarEvent> = {
  "lakeside-meet-greet": eventWindow("2026-09-25", "6:00pm", 180, {
    id: "lakeside-meet-greet",
    title: LAKESIDE_MEET_GREET.title,
    description: LAKESIDE_MEET_GREET.desc,
    location: LAKESIDE_MEET_GREET.loc,
  }),
  ceremony: eventWindow("2026-09-26", "3:00pm", 75, {
    id: "ceremony",
    title: "Jarod & Jamie — The Ceremony",
    description: "Colourful cocktail attire. Adults-only ceremony.",
    location: VENUE,
  }),
  "garden-party": eventWindow("2026-09-26", "4:30pm", 90, {
    id: "garden-party",
    title: "Garden Party",
    description: "Canapés, drinks, face painter, and glitter bar on the Upper Lawn.",
    location: `${VENUE} — Upper Lawn`,
  }),
  reception: eventWindow("2026-09-26", "6:00pm", 300, {
    id: "reception",
    title: "Wedding Reception",
    description: "Dinner, drinks, and dancing in The Pavilion.",
    location: `${VENUE} — The Pavilion`,
  }),
  "family-breakfast": eventWindow("2026-09-27", "9:00am", 120, {
    id: "family-breakfast",
    title: "Family Breakfast",
    description: "A relaxed farewell breakfast at Spicers Clovelly Estate.",
    location: VENUE,
  }),
  "gc-byron-lunch": eventWindow("2026-09-22", "11:00am", 120, {
    id: "gc-byron-lunch",
    title: "Byron Bay Lunch",
    description: "Coastal lunch stop in Byron Bay during the Gold Coast trip.",
    location: "Byron Bay, NSW",
  }),
  "gc-skydeck": eventWindow("2026-09-22", "5:00pm", 90, {
    id: "gc-skydeck",
    title: "Q1 Skydeck",
    description: "Sunset views from SkyPoint, Surfers Paradise.",
    location: "SkyPoint, Surfers Paradise",
  }),
  "gc-movie-world": eventWindow("2026-09-23", "10:00am", 420, {
    id: "gc-movie-world",
    title: "Warner Bros. Movie World",
    description: "Theme park day on the Gold Coast trip.",
    location: "Warner Bros. Movie World, Gold Coast",
  }),
  "gc-dreamworld": eventWindow("2026-09-24", "10:00am", 420, {
    id: "gc-dreamworld",
    title: "Dreamworld",
    description: "Theme park day on the Gold Coast trip.",
    location: "Dreamworld, Gold Coast",
  }),
  "gc-draculas": eventWindow("2026-09-24", "7:00pm", 150, {
    id: "gc-draculas",
    title: "Dracula's Cabaret",
    description: "Evening cabaret show in Broadbeach.",
    location: "Dracula's Cabaret, Broadbeach",
  }),
  "gc-australia-zoo": eventWindow("2026-09-25", "10:00am", 270, {
    id: "gc-australia-zoo",
    title: "Australia Zoo",
    description: "Wildlife day before heading to the hinterland.",
    location: "Australia Zoo, Beerwah",
  }),
};

export function getCalendarEvent(eventId: string): WeddingCalendarEvent | null {
  return WEDDING_CALENDAR_EVENTS[eventId] ?? null;
}

export function listCalendarEvents(): WeddingCalendarEvent[] {
  return Object.values(WEDDING_CALENDAR_EVENTS);
}

export const CALENDAR_TIMEZONE_LABEL = WEDDING_TIMEZONE;
