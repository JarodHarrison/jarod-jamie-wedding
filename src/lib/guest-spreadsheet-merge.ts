import type { RsvpStatus } from "@prisma/client";
import { normalizeGuestName } from "@/lib/guest-name";
import {
  getCsvHeaderKeys,
  parseGuestSpreadsheet,
  type GuestSpreadsheetParseError,
  type GuestSpreadsheetParseResult,
  type GuestSpreadsheetRow,
} from "@/lib/guest-spreadsheet-import";

export type SayiCsvRole = "attending" | "rsvp";

export type SayiMergeStats = {
  matched: number;
  attendingOnly: number;
  rsvpOnly: number;
};

export type SayiMergeResult = GuestSpreadsheetParseResult & {
  mergeStats: SayiMergeStats;
  roles: { attending: SayiCsvRole; rsvp: SayiCsvRole };
};

function pickString(primary: string | null, secondary: string | null): string | null {
  const pick = (value: string | null) => {
    const trimmed = value?.trim() || "";
    return trimmed && trimmed !== "-" ? trimmed : null;
  };
  return pick(secondary) ?? pick(primary);
}

function hasRealEmail(row: GuestSpreadsheetRow): boolean {
  return !row.emailGenerated && Boolean(row.email);
}

function guestMatchKey(row: GuestSpreadsheetRow): string {
  const name = normalizeGuestName(row.name);
  if (row.sayiPartyName) {
    return `party:${row.sayiPartyName.trim().toLowerCase()}|${name}`;
  }
  if (row.sayiLink) {
    return `link:${row.sayiLink.trim().toLowerCase()}|${name}`;
  }
  if (hasRealEmail(row)) return `email:${row.email}`;
  return `name:${name}`;
}

function scoreCsvRole(headers: string[], parsed: GuestSpreadsheetParseResult): Record<SayiCsvRole, number> {
  const set = new Set(headers);
  const attending =
    (set.has("attending") ? 6 : 0) +
    (set.has("party_name") ? 4 : 0) +
    (set.has("plus_one_allowed") ? 5 : 0) +
    (set.has("mailing_address") ? 1 : 0) -
    (set.has("email") ? 3 : 0) -
    (set.has("phone_number") || set.has("phone") ? 4 : 0) -
    (set.has("dietary_requirements") ? 4 : 0) -
    Math.min(parsed.extraColumns.length, 6);

  const rsvp =
    parsed.extraColumns.length * 2 +
    (set.has("phone_number") || set.has("phone") || set.has("mobile") ? 5 : 0) +
    (set.has("dietary") || set.has("dietary_requirements") ? 5 : 0) +
    (set.has("email") ? 4 : 0) +
    (set.has("table") ? 3 : 0) +
    (headers.some((h) => h.startsWith("q1_") || h.startsWith("q2_")) ? 4 : 0);

  return { attending: Math.max(attending, 0), rsvp };
}

function assignCsvRoles(
  csvA: string,
  csvB: string,
  parsedA: GuestSpreadsheetParseResult,
  parsedB: GuestSpreadsheetParseResult,
): { attending: GuestSpreadsheetParseResult; rsvp: GuestSpreadsheetParseResult } {
  const headersA = getCsvHeaderKeys(csvA);
  const headersB = getCsvHeaderKeys(csvB);
  const scoresA = scoreCsvRole(headersA, parsedA);
  const scoresB = scoreCsvRole(headersB, parsedB);

  const aLooksAttending = scoresA.attending >= scoresA.rsvp;
  const bLooksAttending = scoresB.attending >= scoresB.rsvp;

  if (aLooksAttending && !bLooksAttending) {
    return { attending: parsedA, rsvp: parsedB };
  }
  if (bLooksAttending && !aLooksAttending) {
    return { attending: parsedB, rsvp: parsedA };
  }

  if (scoresA.attending > scoresB.attending) {
    return { attending: parsedA, rsvp: parsedB };
  }
  if (scoresB.attending > scoresA.attending) {
    return { attending: parsedB, rsvp: parsedA };
  }

  return { attending: parsedA, rsvp: parsedB };
}

function preferRsvpStatus(attending: RsvpStatus, rsvp: RsvpStatus): RsvpStatus {
  if (attending !== "PENDING") return attending;
  if (rsvp !== "PENDING") return rsvp;
  return "PENDING";
}

function mergeGuestRows(attending: GuestSpreadsheetRow, rsvp: GuestSpreadsheetRow): GuestSpreadsheetRow {
  const sayiCustomData = {
    ...(attending.sayiCustomData ?? {}),
    ...(rsvp.sayiCustomData ?? {}),
  };

  const email = hasRealEmail(rsvp) ? rsvp.email : attending.email;
  const emailGenerated = hasRealEmail(rsvp) ? false : attending.emailGenerated;

  return {
    rowNumber: attending.rowNumber,
    name: rsvp.name.trim() || attending.name,
    email,
    emailGenerated,
    tier: attending.tier !== "OFF_SITE" ? attending.tier : rsvp.tier,
    rsvpStatus: preferRsvpStatus(attending.rsvpStatus, rsvp.rsvpStatus),
    phone: pickString(attending.phone, rsvp.phone),
    plusOneName: pickString(attending.plusOneName, rsvp.plusOneName),
    dietaryNotes: pickString(attending.dietaryNotes, rsvp.dietaryNotes),
    songRequest: pickString(attending.songRequest, rsvp.songRequest),
    guestOfHost: pickString(attending.guestOfHost, rsvp.guestOfHost),
    guestRelationship: pickString(attending.guestRelationship, rsvp.guestRelationship),
    guestRelationshipNote: pickString(attending.guestRelationshipNote, rsvp.guestRelationshipNote),
    accommodationAddress: pickString(attending.accommodationAddress, rsvp.accommodationAddress),
    mailingAddress: pickString(attending.mailingAddress, rsvp.mailingAddress),
    password: pickString(attending.password, rsvp.password),
    sayiPartyName: pickString(attending.sayiPartyName, rsvp.sayiPartyName),
    sayiLink: pickString(attending.sayiLink, rsvp.sayiLink),
    sayiPlusOneAllowed: attending.sayiPlusOneAllowed ?? rsvp.sayiPlusOneAllowed,
    sayiCustomData: Object.keys(sayiCustomData).length > 0 ? sayiCustomData : null,
  };
}

function indexRowsByMatchKey(rows: GuestSpreadsheetRow[]) {
  const map = new Map<string, GuestSpreadsheetRow>();
  for (const row of rows) {
    map.set(guestMatchKey(row), row);
  }
  return map;
}

/**
 * Merge Sayi.do "Download Attendees List" + RSVP response exports into one guest row per person.
 * Match priority: unique link → email → party + name → normalized name.
 */
export function mergeSayiGuestExports(attendingCsv: string, rsvpCsv: string): SayiMergeResult {
  const parsedA = parseGuestSpreadsheet(attendingCsv);
  const parsedB = parseGuestSpreadsheet(rsvpCsv);
  const { attending, rsvp } = assignCsvRoles(attendingCsv, rsvpCsv, parsedA, parsedB);

  const attendingByKey = indexRowsByMatchKey(attending.rows);
  const rsvpByKey = indexRowsByMatchKey(rsvp.rows);
  const allKeys = new Set([...attendingByKey.keys(), ...rsvpByKey.keys()]);

  const rows: GuestSpreadsheetRow[] = [];
  const errors: GuestSpreadsheetParseError[] = [...attending.errors, ...rsvp.errors];
  const mergeStats: SayiMergeStats = { matched: 0, attendingOnly: 0, rsvpOnly: 0 };

  for (const key of allKeys) {
    const attendingRow = attendingByKey.get(key);
    const rsvpRow = rsvpByKey.get(key);

    if (attendingRow && rsvpRow) {
      rows.push(mergeGuestRows(attendingRow, rsvpRow));
      mergeStats.matched += 1;
      continue;
    }

    if (attendingRow) {
      rows.push(attendingRow);
      mergeStats.attendingOnly += 1;
      continue;
    }

    if (rsvpRow) {
      rows.push(rsvpRow);
      mergeStats.rsvpOnly += 1;
      errors.push({
        row: rsvpRow.rowNumber,
        message: `RSVP row for "${rsvpRow.name}" had no match in the attending list — imported from RSVP only.`,
      });
    }
  }

  rows.sort((a, b) => a.name.localeCompare(b.name));

  const extraColumns = [...new Set([...attending.extraColumns, ...rsvp.extraColumns])];

  return {
    rows,
    errors,
    format: "sayi",
    generatedEmailCount: rows.filter((row) => row.emailGenerated).length,
    extraColumns,
    mergeStats,
    roles: { attending: "attending", rsvp: "rsvp" },
  };
}
