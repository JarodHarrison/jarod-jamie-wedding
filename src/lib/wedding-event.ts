export const WEDDING_DATE_ISO = "2026-09-26";
export const WEDDING_TIMEZONE = "Australia/Brisbane";

/** Days after the wedding that count as the post-celebration “recovery” window. */
export const RECOVERY_DAYS = 7;

export type WeddingPhase = "before" | "week" | "day" | "recovery" | "after";

export type WeddingFeature =
  | "live-shuttle"
  | "photobooth-bingo"
  | "event-day-hero"
  | "recovery-hero"
  | "wedding-week-banner"
  | "pre-wedding-planning"
  | "weekend-checklist"
  | "rsvp-hero"
  | "guest-wall"
  | "emergency-contacts";

const DAY_SCHEDULE = [
  { time: "3:00pm", label: "Ceremony", detail: "Garden ceremony at Spicers" },
  { time: "4:30pm", label: "Garden Party", detail: "Upper Lawn — canapés & drinks" },
  { time: "6:00pm", label: "Reception", detail: "The Pavilion — dinner & dancing" },
] as const;

export const EMERGENCY_CONTACTS = [
  { name: "Jarod", phone: "0400 000 000" },
  { name: "Jamie", phone: "0400 000 001" },
] as const;

const FEATURE_PHASES: Record<WeddingFeature, readonly WeddingPhase[]> = {
  "live-shuttle": ["week", "day"],
  "photobooth-bingo": ["day"],
  "event-day-hero": ["day"],
  "recovery-hero": ["recovery"],
  "wedding-week-banner": ["week"],
  "pre-wedding-planning": ["before", "week"],
  "weekend-checklist": ["before", "week"],
  "rsvp-hero": ["before", "week"],
  "guest-wall": ["before", "week", "recovery"],
  "emergency-contacts": ["day"],
};

/** Live shuttle map: wedding eve through Sunday (courtesy bus weekend). */
export function isShuttleLiveWindow(now = new Date()): boolean {
  if (process.env.SHUTTLE_FORCE_VISIBLE === "true") return true;
  if (process.env.SHUTTLE_FORCE_VISIBLE === "false") return false;

  const start = new Date("2026-09-25T00:00:00+10:00");
  const end = new Date("2026-09-27T23:59:59+10:00");
  return now >= start && now <= end;
}

/** Best Bitches and other party roles can view vendors from this many days before the wedding. */
export const VENDOR_PORTAL_DAYS_BEFORE = 5;

export function daysUntilWedding(now = new Date()): number {
  const wedding = new Date(`${WEDDING_DATE_ISO}T00:00:00+10:00`);
  return Math.floor((wedding.getTime() - now.getTime()) / 86_400_000);
}

export function isWithinDaysBeforeWedding(days: number, now = new Date()): boolean {
  const remaining = daysUntilWedding(now);
  return remaining >= 0 && remaining <= days;
}

export function canViewVendorPortal(now = new Date()): boolean {
  if (process.env.VENDOR_PORTAL_FORCE_VISIBLE === "true") return true;
  return isWithinDaysBeforeWedding(VENDOR_PORTAL_DAYS_BEFORE, now);
}

export function getWeddingPhase(now = new Date()): WeddingPhase {
  const wedding = new Date(`${WEDDING_DATE_ISO}T00:00:00+10:00`);
  const msPerDay = 86_400_000;
  const diffDays = Math.floor((wedding.getTime() - now.getTime()) / msPerDay);

  if (diffDays < 0) {
    const daysAfter = Math.abs(diffDays);
    return daysAfter <= RECOVERY_DAYS ? "recovery" : "after";
  }
  if (diffDays === 0) return "day";
  if (diffDays <= 7) return "week";
  return "before";
}

export function isWeddingFeatureVisible(feature: WeddingFeature, now = new Date()): boolean {
  const phase = getWeddingPhase(now);

  if (feature === "live-shuttle") {
    return FEATURE_PHASES[feature].includes(phase) && isShuttleLiveWindow(now);
  }

  return FEATURE_PHASES[feature].includes(phase);
}

export function isWeddingDay(now = new Date()) {
  return getWeddingPhase(now) === "day";
}

export function getDaySchedule() {
  return DAY_SCHEDULE;
}

export function getPhaseLabel(phase: WeddingPhase): string {
  switch (phase) {
    case "before":
      return "Pre-event";
    case "week":
      return "Wedding week";
    case "day":
      return "Wedding day";
    case "recovery":
      return "Recovery";
    case "after":
      return "After the wedding";
  }
}
