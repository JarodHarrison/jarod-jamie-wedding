export const ARRIVAL_MAX_WAIT_OPTIONS = [
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
  { value: "120_plus", label: "2 hours +" },
] as const;

export type ArrivalMaxWaitId = (typeof ARRIVAL_MAX_WAIT_OPTIONS)[number]["value"];

const waitMinutesById: Record<ArrivalMaxWaitId, number> = {
  "30": 30,
  "60": 60,
  "90": 90,
  "120": 120,
  "120_plus": 240,
};

export function isArrivalMaxWaitId(value: string): value is ArrivalMaxWaitId {
  return value in waitMinutesById;
}

export function arrivalMaxWaitMinutes(value: string | null | undefined): number | null {
  if (!value || !isArrivalMaxWaitId(value)) return null;
  return waitMinutesById[value];
}

export function arrivalMaxWaitLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return ARRIVAL_MAX_WAIT_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function parseArrivalDateTime(
  date: string | null | undefined,
  time: string | null | undefined,
): number | null {
  if (!date || !time) return null;
  const ms = new Date(`${date}T${time}`).getTime();
  return Number.isNaN(ms) ? null : ms;
}

/** True when both guests' post-arrival wait windows overlap (can meet before either gives up). */
export function arrivalWaitWindowsOverlap(
  a: {
    arrivalDate: string | null;
    arrivalTime: string | null;
    arrivalMaxWait: string | null;
  },
  b: {
    arrivalDate: string | null;
    arrivalTime: string | null;
    arrivalMaxWait: string | null;
  },
): boolean {
  const startA = parseArrivalDateTime(a.arrivalDate, a.arrivalTime);
  const startB = parseArrivalDateTime(b.arrivalDate, b.arrivalTime);
  const waitA = arrivalMaxWaitMinutes(a.arrivalMaxWait);
  const waitB = arrivalMaxWaitMinutes(b.arrivalMaxWait);
  if (startA === null || startB === null || waitA === null || waitB === null) return false;

  const endA = startA + waitA * 60_000;
  const endB = startB + waitB * 60_000;
  return Math.max(startA, startB) <= Math.min(endA, endB);
}
