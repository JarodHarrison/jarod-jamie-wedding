import { parseCsvRows } from "@/lib/guest-spreadsheet-import";
import { normalizeGuestName } from "@/lib/guest-name";
import type { SeatingTableKey } from "@/lib/seating-chart";
import { DEFAULT_SEATING_TABLES } from "@/lib/seating-chart";

export const SEATING_IMPORT_TEMPLATE = `Left Table,Centre Table,Right Table,Our Table
Guest Name,Guest Name,Guest Name,Guest Name`;

export type SeatingImportRow = {
  rowNumber: number;
  guestName: string;
  tableKey: SeatingTableKey;
  sortOrder: number;
};

export type SeatingImportParseResult = {
  rows: SeatingImportRow[];
  errors: { row: number; message: string; guestName?: string }[];
};

const TABLE_ALIASES: Record<string, SeatingTableKey> = {
  left: "LEFT",
  lefttable: "LEFT",
  table1: "LEFT",
  "1": "LEFT",
  centre: "CENTRE",
  center: "CENTRE",
  centretable: "CENTRE",
  centertable: "CENTRE",
  table2: "CENTRE",
  "2": "CENTRE",
  right: "RIGHT",
  righttable: "RIGHT",
  table3: "RIGHT",
  "3": "RIGHT",
  bridal: "BRIDAL",
  bridaltable: "BRIDAL",
  ourtable: "BRIDAL",
  grooms: "BRIDAL",
  groomstable: "BRIDAL",
  groomsstable: "BRIDAL",
  table4: "BRIDAL",
  "4": "BRIDAL",
};

function normalizeTableToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^\w]+/g, "");
}

export function resolveSeatingTableKey(
  value: string,
  customLabels: Partial<Record<SeatingTableKey, string>> = {},
): SeatingTableKey | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const upper = trimmed.toUpperCase();
  if (upper === "LEFT" || upper === "CENTRE" || upper === "CENTER" || upper === "RIGHT" || upper === "BRIDAL") {
    return upper === "CENTER" ? "CENTRE" : (upper as SeatingTableKey);
  }

  const token = normalizeTableToken(trimmed);
  if (TABLE_ALIASES[token]) return TABLE_ALIASES[token];

  for (const table of DEFAULT_SEATING_TABLES) {
    if (normalizeTableToken(table.label) === token) return table.key;
  }

  for (const [key, label] of Object.entries(customLabels) as [SeatingTableKey, string][]) {
    if (normalizeTableToken(label) === token) return key;
  }

  return null;
}

function headerIndex(headers: string[], candidates: string[]): number {
  const normalized = headers.map((header) => normalizeTableToken(header));
  for (const candidate of candidates) {
    const index = normalized.indexOf(normalizeTableToken(candidate));
    if (index >= 0) return index;
  }
  return -1;
}

function parseLongFormat(
  table: string[][],
  customLabels: Partial<Record<SeatingTableKey, string>>,
): SeatingImportParseResult {
  const headers = table[0].map((cell) => cell.trim());
  const nameIndex = headerIndex(headers, ["name", "guest", "guestname", "guest name"]);
  const tableIndex = headerIndex(headers, ["table", "seating", "seattable", "seat", "seat table"]);

  if (nameIndex < 0 || tableIndex < 0) {
    return {
      rows: [],
      errors: [{ row: 1, message: 'Long-format CSV needs "name" and "table" columns.' }],
    };
  }

  const rows: SeatingImportRow[] = [];
  const errors: SeatingImportParseResult["errors"] = [];
  const sortCounters: Record<SeatingTableKey, number> = {
    LEFT: 0,
    CENTRE: 0,
    RIGHT: 0,
    BRIDAL: 0,
  };

  for (let i = 1; i < table.length; i += 1) {
    const line = table[i];
    const rowNumber = i + 1;
    const guestName = (line[nameIndex] ?? "").trim();
    const tableValue = (line[tableIndex] ?? "").trim();

    if (!guestName && !tableValue) continue;
    if (!guestName) {
      errors.push({ row: rowNumber, message: "Guest name is required." });
      continue;
    }
    if (!tableValue) {
      errors.push({ row: rowNumber, guestName, message: "Table is required." });
      continue;
    }

    const tableKey = resolveSeatingTableKey(tableValue, customLabels);
    if (!tableKey) {
      errors.push({
        row: rowNumber,
        guestName,
        message: `Unknown table "${tableValue}".`,
      });
      continue;
    }

    rows.push({
      rowNumber,
      guestName,
      tableKey,
      sortOrder: sortCounters[tableKey]++,
    });
  }

  return { rows, errors };
}

function parseWideFormat(
  table: string[][],
  customLabels: Partial<Record<SeatingTableKey, string>>,
): SeatingImportParseResult {
  const headers = table[0].map((cell) => cell.trim());
  const columnMap: { index: number; tableKey: SeatingTableKey }[] = [];

  headers.forEach((header, index) => {
    const tableKey = resolveSeatingTableKey(header, customLabels);
    if (tableKey) columnMap.push({ index, tableKey });
  });

  if (columnMap.length < 2) {
    return {
      rows: [],
      errors: [{ row: 1, message: "Wide-format CSV needs at least two table columns in the header row." }],
    };
  }

  const rows: SeatingImportRow[] = [];
  const errors: SeatingImportParseResult["errors"] = [];
  const sortCounters: Record<SeatingTableKey, number> = {
    LEFT: 0,
    CENTRE: 0,
    RIGHT: 0,
    BRIDAL: 0,
  };

  for (let i = 1; i < table.length; i += 1) {
    const line = table[i];
    const rowNumber = i + 1;

    for (const column of columnMap) {
      const guestName = (line[column.index] ?? "").trim();
      if (!guestName) continue;

      rows.push({
        rowNumber,
        guestName,
        tableKey: column.tableKey,
        sortOrder: sortCounters[column.tableKey]++,
      });
    }
  }

  return { rows, errors };
}

export function parseSeatingCsv(
  text: string,
  customLabels: Partial<Record<SeatingTableKey, string>> = {},
): SeatingImportParseResult {
  const table = parseCsvRows(text.replace(/^\uFEFF/, "")).filter((row) =>
    row.some((cell) => cell.trim().length > 0),
  );

  if (table.length < 2) {
    return {
      rows: [],
      errors: [{ row: 1, message: "CSV must include a header row and at least one guest row." }],
    };
  }

  const headers = table[0].map((cell) => cell.trim());
  const tableColumns = headers.filter((header) => resolveSeatingTableKey(header, customLabels) !== null).length;
  const hasNameColumn = headerIndex(headers, ["name", "guest", "guestname", "guest name"]) >= 0;
  const hasTableColumn = headerIndex(headers, ["table", "seating", "seattable", "seat", "seat table"]) >= 0;

  if (hasNameColumn && hasTableColumn) {
    return parseLongFormat(table, customLabels);
  }

  if (tableColumns >= 2) {
    return parseWideFormat(table, customLabels);
  }

  return {
    rows: [],
    errors: [
      {
        row: 1,
        message:
          'Use wide format (Left Table, Centre Table, …) or long format ("name", "table" columns).',
      },
    ],
  };
}

export function guestNameMatchesSeatingImport(guestName: string, importName: string): boolean {
  return normalizeGuestName(guestName) === normalizeGuestName(importName);
}
