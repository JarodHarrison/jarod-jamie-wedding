import { BUCKS_PARTY_SHARE_BLURB } from "@/lib/bucks-party-calendar";
import type { WeddingCalendarEvent } from "@/lib/wedding-calendar-events";

export const BUCKS_PARTY_CONFIG_ID = "default";

export type BucksPartyConfigData = {
  id: string;
  dateLabel: string;
  dateShort: string;
  timeLabel: string;
  placeLabel: string;
  placeNote: string | null;
  detailsNote: string | null;
  dressCode: string | null;
  whatToBring: string | null;
  meetingPoint: string | null;
  transportNote: string | null;
  agendaNote: string | null;
  startAt: string;
  endAt: string;
  calendarDescription: string | null;
  calendarLocation: string | null;
  shareBlurb: string | null;
  updatedAt: string;
};

export const DEFAULT_BUCKS_PARTY_CONFIG = {
  dateLabel: "29 August 2026",
  dateShort: "29.08",
  timeLabel: "Coming Soon",
  placeLabel: "TBA",
  placeNote:
    "We just need a hot minute to figure out exactly how much trouble we can legally get away with.",
  detailsNote: null as string | null,
  dressCode: null as string | null,
  whatToBring: null as string | null,
  meetingPoint: null as string | null,
  transportNote: null as string | null,
  agendaNote: null as string | null,
  startAt: new Date("2026-08-29T16:00:00+10:00"),
  endAt: new Date("2026-08-30T02:00:00+10:00"),
  calendarDescription:
    "The ultimate joint bucks. Place TBA · time coming soon. Double the grooms, double the mayhem. Details via email & SMS.",
  calendarLocation: "TBA: Australia (details via email & SMS)",
  shareBlurb: BUCKS_PARTY_SHARE_BLURB,
};

export function bucksPartyCalendarEvent(config: BucksPartyConfigData): WeddingCalendarEvent {
  return {
    id: "bucks-party",
    title: "J-rod & Jamo: Ultimate Joint Bucks",
    description:
      config.calendarDescription ??
      DEFAULT_BUCKS_PARTY_CONFIG.calendarDescription ??
      undefined,
    location:
      config.calendarLocation ??
      DEFAULT_BUCKS_PARTY_CONFIG.calendarLocation ??
      "TBA",
    start: config.startAt,
    end: config.endAt,
  };
}

export function bucksPartyShareBlurb(config: BucksPartyConfigData): string {
  if (config.shareBlurb?.trim()) return config.shareBlurb.trim();
  return `🚨 BRACE YOURSELVES 🚨
🚨 THE ULTIMATE JOINT BUCKS IS HAPPENING 🚨

J-rod & Jamo: ${config.dateLabel}
${config.placeLabel} · ${config.timeLabel}

Get in, losers. We're getting married. 💍🥂

RSVP:`;
}

/** Closing line shown on the public page: taken from the share message. */
export function bucksPartyPunchline(config: BucksPartyConfigData): string {
  const lines = bucksPartyShareBlurb(config)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (/^RSVP\s*:?\s*$/i.test(line)) continue;
    if (/^https?:\/\//i.test(line)) continue;
    if (/BRACE YOURSELVES/i.test(line)) continue;
    if (/ULTIMATE JOINT BUCKS IS HAPPENING/i.test(line)) continue;
    if (/^J-rod/i.test(line)) continue;
    if (/Place TBA|Coming Soon/i.test(line) && !/Get in/i.test(line)) continue;
    // Skip pure place · time meta lines unless they are the punchline
    if (/·/.test(line) && !/Get in|married|losers/i.test(line)) continue;
    return line;
  }

  return "Get in, losers. We're getting married. 💍🥂";
}

export type BucksPartyEventUpdateInput = {
  dateLabel?: string;
  dateShort?: string;
  timeLabel?: string;
  placeLabel?: string;
  placeNote?: string | null;
  detailsNote?: string | null;
  dressCode?: string | null;
  whatToBring?: string | null;
  meetingPoint?: string | null;
  transportNote?: string | null;
  agendaNote?: string | null;
  startAt?: string;
  endAt?: string;
  calendarDescription?: string | null;
  calendarLocation?: string | null;
  shareBlurb?: string | null;
};

function cleanText(value: unknown, maxLen: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLen);
}

function cleanOptionalText(value: unknown, maxLen: number): string | null | undefined {
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLen);
}

function parseIsoDate(value: unknown): Date | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

export function parseBucksPartyEventUpdate(
  body: Record<string, unknown>,
): { data: BucksPartyEventUpdateInput; error?: string } {
  const data: BucksPartyEventUpdateInput = {};

  const dateLabel = cleanText(body.dateLabel, 80);
  if (dateLabel) data.dateLabel = dateLabel;

  const dateShort = cleanText(body.dateShort, 20);
  if (dateShort) data.dateShort = dateShort;

  const timeLabel = cleanText(body.timeLabel, 80);
  if (timeLabel) data.timeLabel = timeLabel;

  const placeLabel = cleanText(body.placeLabel, 120);
  if (placeLabel) data.placeLabel = placeLabel;

  if ("placeNote" in body) data.placeNote = cleanOptionalText(body.placeNote, 500);
  if ("detailsNote" in body) data.detailsNote = cleanOptionalText(body.detailsNote, 2000);
  if ("dressCode" in body) data.dressCode = cleanOptionalText(body.dressCode, 500);
  if ("whatToBring" in body) data.whatToBring = cleanOptionalText(body.whatToBring, 1000);
  if ("meetingPoint" in body) data.meetingPoint = cleanOptionalText(body.meetingPoint, 500);
  if ("transportNote" in body) data.transportNote = cleanOptionalText(body.transportNote, 1000);
  if ("agendaNote" in body) data.agendaNote = cleanOptionalText(body.agendaNote, 2000);
  if ("calendarDescription" in body) {
    data.calendarDescription = cleanOptionalText(body.calendarDescription, 1000);
  }
  if ("calendarLocation" in body) {
    data.calendarLocation = cleanOptionalText(body.calendarLocation, 200);
  }
  if ("shareBlurb" in body) data.shareBlurb = cleanOptionalText(body.shareBlurb, 2000);

  const startAt = parseIsoDate(body.startAt);
  if (body.startAt !== undefined && !startAt) {
    return { data, error: "Invalid start date/time." };
  }
  if (startAt) data.startAt = startAt.toISOString();

  const endAt = parseIsoDate(body.endAt);
  if (body.endAt !== undefined && !endAt) {
    return { data, error: "Invalid end date/time." };
  }
  if (endAt) data.endAt = endAt.toISOString();

  if (startAt && endAt && endAt <= startAt) {
    return { data, error: "End time must be after start time." };
  }

  if (Object.keys(data).length === 0) {
    return { data, error: "No valid fields to update." };
  }

  return { data };
}

/** Format ISO datetime for datetime-local input (local browser tz). */
export function isoToDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Parse datetime-local value to ISO string. */
export function datetimeLocalValueToIso(value: string): string | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}
