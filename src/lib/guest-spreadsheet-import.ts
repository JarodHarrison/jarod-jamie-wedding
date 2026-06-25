import type { GuestTier } from "@/types/wedding";
import type { RsvpStatus } from "@prisma/client";
import { normalizeEmail, isValidGuestTier } from "@/lib/api-utils";
import { isGuestOfHost, isGuestRelationship } from "@/lib/guest-identity";

/** Placeholder domain for Sayi.do imports that have no email column. */
export const GUEST_IMPORT_EMAIL_DOMAIN = "guests.jarodandjamiewedding.com";

export type GuestSpreadsheetRow = {
  rowNumber: number;
  name: string;
  email: string;
  emailGenerated: boolean;
  tier: GuestTier;
  rsvpStatus: RsvpStatus;
  phone: string | null;
  plusOneName: string | null;
  dietaryNotes: string | null;
  songRequest: string | null;
  guestOfHost: string | null;
  guestRelationship: string | null;
  guestRelationshipNote: string | null;
  accommodationAddress: string | null;
  mailingAddress: string | null;
  password: string | null;
  sayiPartyName: string | null;
  sayiLink: string | null;
  sayiPlusOneAllowed: boolean | null;
  sayiCustomData: Record<string, string> | null;
};

export type GuestSpreadsheetParseError = {
  row: number;
  message: string;
};

export type GuestSpreadsheetParseResult = {
  rows: GuestSpreadsheetRow[];
  errors: GuestSpreadsheetParseError[];
  format: "standard" | "sayi";
  generatedEmailCount: number;
  extraColumns: string[];
};

export const GUEST_IMPORT_TEMPLATE_HEADERS = [
  "name",
  "email",
  "tier",
  "rsvp_status",
  "phone",
  "plus_one",
  "dietary_notes",
  "song_request",
  "guest_of_host",
  "guest_relationship",
  "guest_relationship_note",
  "password",
] as const;

export const GUEST_IMPORT_TEMPLATE_CSV = `${GUEST_IMPORT_TEMPLATE_HEADERS.join(",")}
Jane Smith,jane@example.com,OFF_SITE,ACCEPTED,0412345678,Alex Smith,Vegetarian,September,jarod,friend,Uni mates,
John Doe,john@example.com,ON_SITE,PENDING,,,,,jamie,family,,`;

type DraftField =
  | keyof Omit<
      GuestSpreadsheetRow,
      "rowNumber" | "emailGenerated" | "sayiCustomData" | "sayiPlusOneAllowed"
    >
  | "plusOneAllowed";

const HEADER_ALIASES: Record<string, DraftField> = {
  name: "name",
  full_name: "name",
  guest_name: "name",
  email: "email",
  email_address: "email",
  guest_email: "email",
  e_mail: "email",
  tier: "tier",
  guest_tier: "tier",
  rsvp: "rsvpStatus",
  rsvp_status: "rsvpStatus",
  attending: "rsvpStatus",
  status: "rsvpStatus",
  will_you_attend: "rsvpStatus",
  attending_wedding: "rsvpStatus",
  response: "rsvpStatus",
  phone: "phone",
  phone_number: "phone",
  mobile: "phone",
  mobile_number: "phone",
  cell_phone: "phone",
  telephone: "phone",
  plus_one: "plusOneName",
  plusone: "plusOneName",
  plus_one_name: "plusOneName",
  plus_one_guest: "plusOneName",
  plus_one_allowed: "plusOneAllowed",
  dietary: "dietaryNotes",
  dietary_notes: "dietaryNotes",
  dietary_requirements: "dietaryNotes",
  dietary_requirement: "dietaryNotes",
  food_allergies: "dietaryNotes",
  allergies: "dietaryNotes",
  song: "songRequest",
  song_request: "songRequest",
  music_request: "songRequest",
  guest_of_host: "guestOfHost",
  host: "guestOfHost",
  guest_relationship: "guestRelationship",
  relationship: "guestRelationship",
  guest_relationship_note: "guestRelationshipNote",
  relationship_note: "guestRelationshipNote",
  password: "password",
  party_name: "sayiPartyName",
  party: "sayiPartyName",
  mailing_address: "mailingAddress",
  address: "mailingAddress",
  unique_link: "sayiLink",
  sayi_link: "sayiLink",
  rsvp_link: "sayiLink",
  link: "sayiLink",
};

const IGNORED_HEADERS = new Set(["", "_", "hash", "number", "no"]);

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };

  const pushRow = () => {
    if (row.length > 0 || field.length > 0) {
      pushField();
      rows.push(row);
      row = [];
    }
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      pushField();
    } else if (char === "\r" && next === "\n") {
      pushRow();
      i += 1;
    } else if (char === "\n" || char === "\r") {
      pushRow();
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    pushRow();
  }

  return rows.filter((cells) => cells.some((cell) => cell.trim().length > 0));
}

function parseRsvpStatus(value: string): RsvpStatus | null {
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === "-") return "PENDING";
  if (["accepted", "yes", "y", "attending", "true", "1"].includes(normalized)) {
    return "ACCEPTED";
  }
  if (["declined", "no", "n", "not attending", "false", "0"].includes(normalized)) {
    return "DECLINED";
  }
  if (normalized === "pending") return "PENDING";
  const upper = normalized.toUpperCase();
  if (upper === "ACCEPTED" || upper === "DECLINED" || upper === "PENDING") {
    return upper as RsvpStatus;
  }
  return null;
}

function parsePlusOneAllowed(value: string): boolean | null {
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === "-") return null;
  if (["yes", "y", "true", "1"].includes(normalized)) return true;
  if (["no", "n", "false", "0"].includes(normalized)) return false;
  return null;
}

function cellValue(cells: string[], index: number): string {
  return (cells[index] ?? "").trim();
}

function isBlankValue(value: string) {
  return !value || value === "-";
}

function isInvalidImportEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  if (!normalized || !normalized.includes("@")) return true;
  return normalized === "undefined" || normalized === "null";
}

function promoteSayiCustomFields(row: GuestSpreadsheetRow): GuestSpreadsheetRow {
  if (!row.sayiCustomData) return row;

  let songRequest = row.songRequest;
  let dietaryNotes = row.dietaryNotes;
  const sayiCustomData = { ...row.sayiCustomData };

  for (const [key, value] of Object.entries(sayiCustomData)) {
    if (!value || isBlankValue(value)) continue;
    const normalized = key.toLowerCase();

    if (!songRequest && normalized.includes("song") && normalized.includes("dancefloor")) {
      songRequest = value;
      delete sayiCustomData[key];
      continue;
    }

    if (normalized.includes("meal choice")) {
      const meal = `Meal: ${value}`;
      dietaryNotes = dietaryNotes ? `${dietaryNotes}; ${meal}` : meal;
      delete sayiCustomData[key];
    }
  }

  return {
    ...row,
    songRequest,
    dietaryNotes,
    sayiCustomData: Object.keys(sayiCustomData).length > 0 ? sayiCustomData : null,
  };
}

function slugifyForEmail(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "guest"
  );
}

function allocateImportEmail(name: string, rowNumber: number, used: Set<string>): string {
  const base = slugifyForEmail(name) || `guest-${rowNumber}`;
  let candidate = `${base}@${GUEST_IMPORT_EMAIL_DOMAIN}`;
  let suffix = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${suffix}@${GUEST_IMPORT_EMAIL_DOMAIN}`;
    suffix += 1;
  }
  used.add(candidate);
  return candidate;
}

function detectFormat(headers: string[]): "standard" | "sayi" {
  const set = new Set(headers);
  if (set.has("guest_name") && (set.has("attending") || set.has("party_name"))) return "sayi";
  return "standard";
}

export function getCsvHeaderKeys(csvText: string): string[] {
  const table = parseCsvRows(csvText.replace(/^\uFEFF/, ""));
  if (table.length === 0) return [];
  return table[0].map(normalizeHeader);
}

export function parseGuestSpreadsheet(csvText: string): GuestSpreadsheetParseResult {
  const table = parseCsvRows(csvText.replace(/^\uFEFF/, ""));
  const errors: GuestSpreadsheetParseError[] = [];
  const rows: GuestSpreadsheetRow[] = [];
  const usedEmails = new Set<string>();

  if (table.length === 0) {
    return {
      rows,
      errors: [{ row: 0, message: "Spreadsheet is empty." }],
      format: "standard",
      generatedEmailCount: 0,
      extraColumns: [],
    };
  }

  const rawHeaders = table[0];
  const headerRow = rawHeaders.map(normalizeHeader);
  const format = detectFormat(headerRow);
  const columnMap = new Map<number, DraftField>();
  const extraColumnIndexes = new Map<number, string>();

  headerRow.forEach((header, index) => {
    if (IGNORED_HEADERS.has(header)) return;
    const mapped = HEADER_ALIASES[header];
    if (mapped) {
      columnMap.set(index, mapped);
      return;
    }
    extraColumnIndexes.set(index, rawHeaders[index]?.trim() || header);
  });

  const extraColumns = [...new Set(extraColumnIndexes.values())];

  const hasName = [...columnMap.values()].includes("name");
  const hasEmailColumn = [...columnMap.values()].includes("email");

  if (!hasName) {
    return {
      rows: [],
      errors: [{ row: 1, message: "Spreadsheet must include a guest name column." }],
      format,
      generatedEmailCount: 0,
      extraColumns,
    };
  }

  if (format === "standard" && !hasEmailColumn) {
    return {
      rows: [],
      errors: [{ row: 1, message: "Spreadsheet must include name and email columns." }],
      format,
      generatedEmailCount: 0,
      extraColumns,
    };
  }

  for (let i = 1; i < table.length; i += 1) {
    const cells = table[i];
    const rowNumber = i + 1;
    const draft: Record<string, string> = {};

    columnMap.forEach((field, index) => {
      const value = cellValue(cells, index);
      if (isBlankValue(value)) return;
      draft[field] = value;
    });

    const sayiCustomData: Record<string, string> = {};
    extraColumnIndexes.forEach((label, index) => {
      const value = cellValue(cells, index);
      if (!isBlankValue(value)) sayiCustomData[label] = value;
    });

    const name = (draft.name ?? "").trim();
    if (!name) {
      errors.push({ row: rowNumber, message: "Name is required." });
      continue;
    }

    let email = normalizeEmail(draft.email ?? "");
    let emailGenerated = false;

    if (!email || isInvalidImportEmail(email)) {
      email = allocateImportEmail(name, rowNumber, usedEmails);
      emailGenerated = true;
    } else if (usedEmails.has(email)) {
      sayiCustomData["Email (Sayi)"] = email;
      email = allocateImportEmail(name, rowNumber, usedEmails);
      emailGenerated = true;
      errors.push({
        row: rowNumber,
        message: `Shared email "${sayiCustomData["Email (Sayi)"]}" — placeholder login email assigned; update in admin if needed.`,
      });
    } else {
      usedEmails.add(email);
    }

    let tier: GuestTier = "OFF_SITE";
    if (draft.tier) {
      const parsedTier = draft.tier.toUpperCase().replace(/\s+/g, "_");
      if (isValidGuestTier(parsedTier)) tier = parsedTier;
      else errors.push({ row: rowNumber, message: `Invalid tier "${draft.tier}".` });
    }

    let rsvpStatus: RsvpStatus = "PENDING";
    if (draft.rsvpStatus) {
      const status = parseRsvpStatus(draft.rsvpStatus);
      if (!status) errors.push({ row: rowNumber, message: `Invalid RSVP status "${draft.rsvpStatus}".` });
      else rsvpStatus = status;
    }

    let guestOfHost: string | null = null;
    if (draft.guestOfHost) {
      const host = draft.guestOfHost.toLowerCase();
      if (isGuestOfHost(host)) guestOfHost = host;
      else errors.push({ row: rowNumber, message: `Invalid guest_of_host "${draft.guestOfHost}".` });
    }

    let guestRelationship: string | null = null;
    if (draft.guestRelationship) {
      const rel = draft.guestRelationship.toLowerCase();
      if (isGuestRelationship(rel)) guestRelationship = rel;
      else errors.push({ row: rowNumber, message: `Invalid guest_relationship "${draft.guestRelationship}".` });
    }

    const mailingAddress =
      draft.mailingAddress && !isBlankValue(draft.mailingAddress) ? draft.mailingAddress : null;

    rows.push(
      promoteSayiCustomFields({
        rowNumber,
        name,
        email,
        emailGenerated,
        tier,
        rsvpStatus,
        phone: draft.phone?.trim() || null,
        plusOneName: draft.plusOneName?.trim() || null,
        dietaryNotes: draft.dietaryNotes?.trim() || null,
        songRequest: draft.songRequest?.trim() || null,
        guestOfHost,
        guestRelationship,
        guestRelationshipNote: draft.guestRelationshipNote?.trim() || null,
        accommodationAddress: null,
        mailingAddress,
        password: draft.password?.trim() || null,
        sayiPartyName: draft.sayiPartyName ?? null,
        sayiLink: draft.sayiLink ?? null,
        sayiPlusOneAllowed: draft.plusOneAllowed ? parsePlusOneAllowed(draft.plusOneAllowed) : null,
        sayiCustomData: Object.keys(sayiCustomData).length > 0 ? sayiCustomData : null,
      }),
    );
  }

  return {
    rows,
    errors,
    format,
    generatedEmailCount: rows.filter((row) => row.emailGenerated).length,
    extraColumns,
  };
}
