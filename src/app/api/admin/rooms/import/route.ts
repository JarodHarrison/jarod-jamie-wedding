import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { jsonError } from "@/lib/api-utils";
import { findGuestByNormalizedName } from "@/lib/guest-claim";
import { normalizeGuestName } from "@/lib/guest-name";
import { prisma } from "@/lib/prisma";
import {
  guestNameMatchesImport,
  parseRoomAllocationCsv,
  parseRoomAllocationSpreadsheet,
} from "@/lib/room-allocation-import";

async function findGuestForRoomRow(guestName: string, email: string | null) {
  const byName = await findGuestByNormalizedName(guestName);
  if (byName) return byName;

  if (email) {
    const byEmail = await prisma.guest.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });
    if (byEmail && guestNameMatchesImport(byEmail.name, guestName)) {
      return byEmail;
    }
  }

  const normalized = normalizeGuestName(guestName);
  if (!normalized) return null;

  const candidates = await prisma.guest.findMany({
    select: { id: true, name: true, email: true },
  });

  return candidates.find((guest) => normalizeGuestName(guest.name) === normalized) ?? null;
}

export async function POST(request: Request) {
  try {
    await requireAdminAccess();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("Upload a room allocation spreadsheet (.xlsx or .csv).", 400);
    }

    const lowerName = file.name.toLowerCase();
    const buffer = await file.arrayBuffer();
    const parsed =
      lowerName.endsWith(".csv") || file.type === "text/csv"
        ? parseRoomAllocationCsv(new TextDecoder().decode(buffer))
        : parseRoomAllocationSpreadsheet(buffer);

    if (parsed.rows.length === 0) {
      return jsonError(parsed.errors[0]?.message ?? "No valid room rows found.", 400);
    }

    const importedAt = new Date();
    const result = {
      matched: 0,
      updated: 0,
      unmatched: 0,
      errors: [...parsed.errors] as { row: number; message: string; guestName?: string }[],
      unmatchedGuests: [] as { row: number; guestName: string }[],
    };

    for (const row of parsed.rows) {
      try {
        const guest = await findGuestForRoomRow(row.guestName, row.email);

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

        const guestRecord = await prisma.guest.findUnique({
          where: { id: guest.id },
          select: { tier: true },
        });

        await prisma.guest.update({
          where: { id: guest.id },
          data: {
            assignedRoomName: row.roomName,
            assignedRoomDetails: row.roomDetails,
            assignedRoomCheckIn: row.checkIn,
            assignedRoomCheckOut: row.checkOut,
            assignedRoomConfiguration: row.configuration,
            roomAllocationImportedAt: importedAt,
            accommodationType: "ON_SITE",
            accommodationName: "Spicers Clovelly Estate",
            accommodationAddress: "68 Montville-Maleny Rd, Montville QLD 4560",
            ...(guestRecord?.tier === "OFF_SITE" ? { tier: "ON_SITE" as const } : {}),
          },
        });

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

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("[admin/rooms/import]", error);
    return jsonError("Failed to import room allocation.", 500);
  }
}
