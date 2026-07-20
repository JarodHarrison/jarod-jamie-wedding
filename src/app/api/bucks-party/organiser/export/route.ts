import { jsonError } from "@/lib/api-utils";
import { requireBucksPartyAccess } from "@/lib/auth/bucks-party-access";
import { bucksRsvpsToGuestImportCsv, serializeBucksRsvp } from "@/lib/bucks-party-server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireBucksPartyAccess();
    const rows = await prisma.bucksPartyRsvp.findMany({
      orderBy: [{ attending: "desc" }, { name: "asc" }],
    });
    const csv = bucksRsvpsToGuestImportCsv(rows.map(serializeBucksRsvp));

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="bucks-party-rsvps.csv"',
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to export CSV.", 500);
  }
}
