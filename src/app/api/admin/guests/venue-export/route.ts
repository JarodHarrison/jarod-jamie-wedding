import { jsonError } from "@/lib/api-utils";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { prisma } from "@/lib/prisma";
import {
  buildVenueGuestWorkbook,
  venueGuestExportSelect,
} from "@/lib/venue-guest-export";

export async function GET() {
  try {
    await requireAdminAccess();

    const guests = await prisma.guest.findMany({
      orderBy: { name: "asc" },
      select: venueGuestExportSelect,
    });
    const workbook = buildVenueGuestWorkbook(guests);
    const body = new Uint8Array(workbook).buffer;
    const date = new Date().toISOString().slice(0, 10);

    return new Response(body, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="venue-guest-details-${date}.xlsx"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("[admin/guests/venue-export GET]", error);
    return jsonError("Failed to create venue spreadsheet.", 500);
  }
}
