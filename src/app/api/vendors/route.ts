import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireVendorView } from "@/lib/auth/vendor-access";
import { serializeVendor, vendorSelect } from "@/lib/vendors";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireVendorView();
    const vendors = await prisma.vendor.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: vendorSelect,
    });
    return NextResponse.json({ vendors: vendors.map(serializeVendor) });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to load vendors.", 500);
  }
}
