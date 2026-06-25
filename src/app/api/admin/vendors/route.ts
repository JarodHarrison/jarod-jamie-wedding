import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireVendorManagement } from "@/lib/auth/vendor-access";
import { serializeVendor, vendorSelect } from "@/lib/vendors";
import { prisma } from "@/lib/prisma";

function trimOrNull(value: unknown) {
  const trimmed = (value ?? "").toString().trim();
  return trimmed || null;
}

export async function GET() {
  try {
    await requireVendorManagement();
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

export async function POST(request: Request) {
  try {
    await requireVendorManagement();
    const body = await request.json();
    const name = trimOrNull(body.name);
    const category = trimOrNull(body.category);

    if (!name || !category) {
      return jsonError("Vendor name and category are required.", 400);
    }

    const vendor = await prisma.vendor.create({
      data: {
        name,
        category,
        contactName: trimOrNull(body.contactName),
        phone: trimOrNull(body.phone),
        email: trimOrNull(body.email),
        website: trimOrNull(body.website),
        notes: trimOrNull(body.notes),
        sortOrder: Number(body.sortOrder ?? 0) || 0,
      },
      select: vendorSelect,
    });

    return NextResponse.json({ vendor: serializeVendor(vendor) });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to create vendor.", 500);
  }
}
