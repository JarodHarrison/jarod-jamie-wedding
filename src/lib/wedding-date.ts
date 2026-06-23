/** Ceremony start — Australia/Brisbane */
export const WEDDING_DATE_ISO = "2026-09-26";
export const WEDDING_CEREMONY_ISO = "2026-09-26T15:00:00+10:00";
export const WEDDING_TIMEZONE = "Australia/Brisbane";

export function getWeddingDate(): Date {
  return new Date(WEDDING_CEREMONY_ISO);
}

export function daysUntilWedding(from = new Date()): number {
  const wedding = getWeddingDate();
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const target = new Date(wedding);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}
