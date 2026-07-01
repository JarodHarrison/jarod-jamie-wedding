import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/auth/admin-access";
import { jsonError } from "@/lib/api-utils";
import {
  assignGuestToSeatingTable,
  ensureSeatingTables,
  isSeatingTableKey,
  loadSeatingChart,
  type SeatingTableKey,
} from "@/lib/seating-chart";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdminAccess();
    const chart = await loadSeatingChart();
    return NextResponse.json(chart);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("[admin/seating GET]", error);
    return jsonError("Failed to load seating chart.", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminAccess();
    await ensureSeatingTables();

    const body = await request.json();
    const action = body.action as string;

    if (action === "rename") {
      const tableKey = body.tableKey as string;
      const label = (body.label ?? "").trim();
      if (!isSeatingTableKey(tableKey)) {
        return jsonError("Invalid table.", 400);
      }
      if (!label) {
        return jsonError("Table name is required.", 400);
      }

      const table = await prisma.seatingTable.update({
        where: { key: tableKey },
        data: { label },
      });

      return NextResponse.json({ table });
    }

    if (action === "assign") {
      const guestId = (body.guestId ?? "").trim();
      const tableKey = body.tableKey as SeatingTableKey | null;

      if (!guestId) {
        return jsonError("Guest is required.", 400);
      }
      if (tableKey !== null && !isSeatingTableKey(tableKey)) {
        return jsonError("Invalid table.", 400);
      }

      const assignResult = await assignGuestToSeatingTable(guestId, tableKey);
      if (assignResult.error) {
        const status = assignResult.error === "Guest not found." ? 404 : 400;
        return jsonError(assignResult.error, status);
      }

      const chart = await loadSeatingChart();
      return NextResponse.json(chart);
    }

    return jsonError("Unknown action.", 400);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("[admin/seating PATCH]", error);
    return jsonError("Failed to update seating chart.", 500);
  }
}
