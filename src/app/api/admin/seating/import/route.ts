import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { jsonError } from "@/lib/api-utils";
import { findGuestByNormalizedName } from "@/lib/guest-claim";
import {
  assignGuestToSeatingTable,
  ensureSeatingTables,
  loadSeatingChart,
  type SeatingTableKey,
} from "@/lib/seating-chart";
import {
  guestNameMatchesSeatingImport,
  parseSeatingCsv,
  SEATING_IMPORT_TEMPLATE,
} from "@/lib/seating-import";
import { prisma } from "@/lib/prisma";

async function findGuestForSeatingRow(guestName: string) {
  const byName = await findGuestByNormalizedName(guestName);
  if (byName) return byName;

  const candidates = await prisma.guest.findMany({
    select: { id: true, name: true, email: true, rsvpStatus: true },
  });

  return (
    candidates.find((guest) => guestNameMatchesSeatingImport(guest.name, guestName)) ?? null
  );
}

export async function GET() {
  try {
    await requireAdminAccess();
    return new NextResponse(SEATING_IMPORT_TEMPLATE, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="seating-chart-template.csv"',
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to download seating template.", 500);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminAccess();
    await ensureSeatingTables();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("Upload a seating chart CSV.", 400);
    }

    const tables = await prisma.seatingTable.findMany();
    const customLabels = Object.fromEntries(
      tables.map((table) => [table.key, table.label]),
    ) as Partial<Record<SeatingTableKey, string>>;

    const parsed = parseSeatingCsv(await file.text(), customLabels);
    if (parsed.rows.length === 0) {
      return jsonError(parsed.errors[0]?.message ?? "No valid seating rows found.", 400);
    }

    const result = {
      matched: 0,
      updated: 0,
      unmatched: 0,
      errors: [...parsed.errors] as { row: number; message: string; guestName?: string }[],
      unmatchedGuests: [] as { row: number; guestName: string }[],
    };

    for (const row of parsed.rows) {
      try {
        const guest = await findGuestForSeatingRow(row.guestName);
        if (!guest) {
          result.unmatched += 1;
          result.unmatchedGuests.push({ row: row.rowNumber, guestName: row.guestName });
          result.errors.push({
            row: row.rowNumber,
            guestName: row.guestName,
            message: `No guest found matching "${row.guestName}".`,
          });
          continue;
        }

        const assignResult = await assignGuestToSeatingTable(guest.id, row.tableKey, row.sortOrder);
        if (assignResult.error) {
          result.errors.push({
            row: row.rowNumber,
            guestName: row.guestName,
            message: assignResult.error,
          });
          continue;
        }

        result.matched += 1;
        result.updated += 1;
      } catch (error) {
        result.errors.push({
          row: row.rowNumber,
          guestName: row.guestName,
          message: error instanceof Error ? error.message : "Import failed for this row.",
        });
      }
    }

    const chart = await loadSeatingChart();
    return NextResponse.json({ ...result, chart });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("[admin/seating/import]", error);
    return jsonError("Failed to import seating chart.", 500);
  }
}
