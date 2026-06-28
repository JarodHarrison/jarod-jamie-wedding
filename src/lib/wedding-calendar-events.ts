import { LAKESIDE_MEET_GREET } from "@/lib/on-site-access";
import { WEDDING_TIMEZONE } from "@/lib/wedding-event";

export type WeddingCalendarEvent = {
  id: string;
  title: string;
  description?: string;
  location: string;
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
  partial: Omit<WeddingCalendarEvent, "start" | "end">,
): WeddingCalendarEvent {
  const startDate = parseTimeOnDate(isoDate, time);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60_000);

  return {
    ...partial,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
}

export const WEDDING_CALENDAR_EVENTS: Record<string, WeddingCalendarEvent> = {
  "lakeside-meet-greet": eventWindow("2026-09-25", "6:00pm", 180, {
    id: "lakeside-meet-greet",
    title: LAKESIDE_MEET_GREET.title,
    description: LAKESIDE_MEET_GREET.desc,
    location: `Lake View Deck, ${VENUE}`,
  }),
  ceremony: eventWindow("2026-09-26", "3:00pm", 75, {
    id: "ceremony",
    title: "Jarod & Jamie — The Ceremony",
    description: "Colourful cocktail attire. Adults-only ceremony.",
    location: VENUE,
  }),
};

export function getCalendarEvent(eventId: string): WeddingCalendarEvent | null {
  return WEDDING_CALENDAR_EVENTS[eventId] ?? null;
}

export const CALENDAR_TIMEZONE_LABEL = WEDDING_TIMEZONE;
