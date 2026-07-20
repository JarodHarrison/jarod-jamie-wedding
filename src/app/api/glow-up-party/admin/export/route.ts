import { jsonError } from "@/lib/api-utils";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { glowUpInterestsToCsv, serializeGlowUpInterest } from "@/lib/glow-up-party-server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdminAccess();
    const rows = await prisma.glowUpPartyInterest.findMany({
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    });
    const csv = glowUpInterestsToCsv(rows.map(serializeGlowUpInterest));

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="glow-up-party-interests.csv"',
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to export CSV.", 500);
  }
}
