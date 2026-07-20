import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { jsonError } from "@/lib/api-utils";
import { findGuestByNormalizedName } from "@/lib/guest-claim";
import {
  guestNameTokens,
  namesShareFirstName,
  normalizeGuestName,
  preferFullerGuestName,
} from "@/lib/guest-name";
import {
  bedPreferenceFromRoomConfiguration,
  toDateInputValue,
} from "@/lib/accommodation-form-defaults";
import { tierForRoomAllocation } from "@/lib/on-site-access";
import { prisma } from "@/lib/prisma";
import {
  guestNameMatchesImport,
  parseRoomAllocationCsv,
  parseRoomAllocationSpreadsheet,
} from "@/lib/room-allocation-import";

async function findGuestForRoomRow(guestName: string, email: string | null) {
  const byName = await findGuestByNormalizedName(guestName);
  if (byName) return byName;

  const candidates = await prisma.guest.findMany({
    select: { id: true, name: true, email: true },
  });

  const normalized = normalizeGuestName(guestName);
  if (!normalized) return null;

  const exact = candidates.find((guest) => normalizeGuestName(guest.name) === normalized);
  if (exact) return exact;

  const fuzzyExact = candidates.find((guest) => guestNameMatchesImport(guest.name, guestName));
  if (fuzzyExact) return fuzzyExact;

  const importTokens = guestNameTokens(guestName);
  const firstName = importTokens[0];
  if (!firstName) return null;

  const firstNameMatches = candidates.filter((guest) => namesShareFirstName(guest.name, guestName));
  if (firstNameMatches.length === 1) return firstNameMatches[0];

  if (importTokens.length >= 2) {
    const lastName = importTokens.at(-1)!;
    const surnameMatches = firstNameMatches.filter((guest) => {
      const tokens = guestNameTokens(guest.name);
      return tokens.length === 1 || tokens.includes(lastName);
    });
    if (surnameMatches.length === 1) return surnameMatches[0];
  }

  // Email last: sheets often reuse a partner email for two guests
  if (email) {
    const byEmail = await prisma.guest.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });
    if (byEmail && namesShareFirstName(byEmail.name, guestName)) return byEmail;
  }

  return null;
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
      namesCompleted: 0,
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
          select: { tier: true, name: true },
        });
        const promotedTier = tierForRoomAllocation(guestRecord?.tier ?? "OFF_SITE");
        const importedBed = bedPreferenceFromRoomConfiguration(row.configuration);
        const importedCheckIn = toDateInputValue(row.checkIn);
        const importedCheckOut = toDateInputValue(row.checkOut);
        const completedName = preferFullerGuestName(guestRecord?.name ?? guest.name, row.guestName);
        const nameChanged = completedName !== (guestRecord?.name ?? guest.name);

        await prisma.guest.update({
          where: { id: guest.id },
          data: {
            ...(nameChanged ? { name: completedName } : {}),
            assignedRoomName: row.roomName,
            assignedRoomDetails: row.roomDetails,
            assignedRoomCheckIn: row.checkIn,
            assignedRoomCheckOut: row.checkOut,
            assignedRoomConfiguration: row.configuration,
            roomAllocationImportedAt: importedAt,
            accommodationType: "ON_SITE",
            accommodationName: `Spicers Clovelly Estate: ${row.roomName}`,
            accommodationAddress: "68 Montville-Maleny Rd, Montville QLD 4560",
            needsShuttle: false,
            ...(importedCheckIn ? { checkInDate: importedCheckIn } : {}),
            ...(importedCheckOut ? { checkOutDate: importedCheckOut } : {}),
            ...(importedBed ? { bedPreference: importedBed } : {}),
            ...(promotedTier ? { tier: promotedTier } : {}),
          },
        });

        result.matched += 1;
        result.updated += 1;
        if (nameChanged) result.namesCompleted += 1;
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
