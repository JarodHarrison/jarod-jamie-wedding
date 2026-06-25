import * as XLSX from "xlsx";
import { normalizeEmail } from "@/lib/api-utils";
import { normalizeGuestName } from "@/lib/guest-name";

export type RoomAllocationRow = {
  rowNumber: number;
  guestName: string;
  email: string | null;
  roomName: string;
  roomDetails: string | null;
  checkIn: string | null;
  checkOut: string | null;
  configuration: string | null;
};

export type RoomAllocationParseError = {
  row: number;
  message: string;
};

export type RoomAllocationParseResult = {
  rows: RoomAllocationRow[];
  errors: RoomAllocationParseError[];
};

function cellText(value: unknown): string {
  if (value == null) return "";
  return String(value).replace(/\r\n/g, "\n").trim();
}

function isMetadataRow(values: string[]): boolean {
  const joined = values.join(" ").toLowerCase();
  if (!joined.trim()) return true;
  if (joined.includes("cot or rollaway")) return true;
  if (joined.includes("rooming allocation")) return true;
  if (joined.includes("please use the following document")) return true;
  if (joined.includes("full names and contact details are required")) return true;
  return false;
}

function isHeaderRow(values: string[]): boolean {
  const normalized = values.map((value) => cellText(value).toLowerCase());
  return normalized.some((value) => value === "room") && normalized.some((value) => value.includes("guest name"));
}

function findHeaderIndex(matrix: string[][]): number {
  for (let index = 0; index < matrix.length; index += 1) {
    if (isHeaderRow(matrix[index] ?? [])) return index;
  }
  return -1;
}

function parseMatrix(matrix: string[][]): RoomAllocationParseResult {
  const headerIndex = findHeaderIndex(matrix);
  if (headerIndex < 0) {
    return {
      rows: [],
      errors: [{ row: 1, message: "Could not find the ROOM / GUEST NAME header row." }],
    };
  }

  const header = (matrix[headerIndex] ?? []).map((value) => cellText(value).toLowerCase());
  const roomCol = header.findIndex((value) => value === "room");
  const detailsCol = header.findIndex((value) => value.startsWith("details"));
  const checkInCol = header.findIndex((value) => value.includes("check-in"));
  const checkOutCol = header.findIndex((value) => value.includes("check-out"));
  const configurationCol = header.findIndex((value) => value.includes("configuration") || value.includes("king or twin"));
  const guestNameCol = header.findIndex((value) => value.includes("guest name"));
  const emailCol = header.findIndex((value) => value.includes("email"));

  if (guestNameCol < 0 || roomCol < 0) {
    return {
      rows: [],
      errors: [{ row: headerIndex + 1, message: "Spreadsheet is missing ROOM or GUEST NAME columns." }],
    };
  }

  const rows: RoomAllocationRow[] = [];
  const errors: RoomAllocationParseError[] = [];

  let currentRoom = "";
  let currentDetails: string | null = null;
  let currentCheckIn: string | null = null;
  let currentCheckOut: string | null = null;
  let currentConfiguration: string | null = null;

  for (let index = headerIndex + 1; index < matrix.length; index += 1) {
    const line = matrix[index] ?? [];
    const rowNumber = index + 1;

    if (isMetadataRow(line)) continue;

    const roomName = roomCol >= 0 ? cellText(line[roomCol]) : "";
    const guestName = cellText(line[guestNameCol]);
    const emailRaw = emailCol >= 0 ? cellText(line[emailCol]) : "";

    if (roomName) {
      currentRoom = roomName.replace(/^\s+/, "");
      currentDetails = detailsCol >= 0 ? cellText(line[detailsCol]) || null : null;
      currentCheckIn = checkInCol >= 0 ? cellText(line[checkInCol]) || null : null;
      currentCheckOut = checkOutCol >= 0 ? cellText(line[checkOutCol]) || null : null;
      currentConfiguration =
        configurationCol >= 0 ? cellText(line[configurationCol]) || null : null;
    }

    if (!guestName) continue;

    if (!currentRoom) {
      errors.push({ row: rowNumber, message: `Guest "${guestName}" has no room assigned above this row.` });
      continue;
    }

    const configuration =
      configurationCol >= 0 ? cellText(line[configurationCol]) || currentConfiguration : currentConfiguration;

    rows.push({
      rowNumber,
      guestName,
      email: emailRaw ? normalizeEmail(emailRaw) : null,
      roomName: currentRoom,
      roomDetails: currentDetails,
      checkIn: currentCheckIn,
      checkOut: currentCheckOut,
      configuration,
    });
  }

  if (rows.length === 0) {
    errors.push({ row: headerIndex + 2, message: "No guest rows found below the header." });
  }

  return { rows, errors };
}

export function parseRoomAllocationSpreadsheet(buffer: ArrayBuffer): RoomAllocationParseResult {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { rows: [], errors: [{ row: 1, message: "Spreadsheet has no worksheets." }] };
  }

  const worksheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<string[]>(worksheet, {
    header: 1,
    defval: "",
    raw: false,
  }) as string[][];

  return parseMatrix(matrix.map((row) => row.map((cell) => cellText(cell))));
}

export function parseRoomAllocationCsv(text: string): RoomAllocationParseResult {
  const workbook = XLSX.read(text, { type: "string" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { rows: [], errors: [{ row: 1, message: "CSV file is empty." }] };
  }

  const worksheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<string[]>(worksheet, {
    header: 1,
    defval: "",
    raw: false,
  }) as string[][];

  return parseMatrix(matrix.map((row) => row.map((cell) => cellText(cell))));
}

export function guestNameMatchesImport(guestName: string, importName: string): boolean {
  return normalizeGuestName(guestName) === normalizeGuestName(importName);
}
