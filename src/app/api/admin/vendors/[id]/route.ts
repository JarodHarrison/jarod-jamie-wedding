import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireVendorManagement } from "@/lib/auth/vendor-access";
import { serializeVendor, vendorSelect } from "@/lib/vendors";
import { prisma } from "@/lib/prisma";

function trimOrNull(value: unknown) {
  const trimmed = (value ?? "").toString().trim();
  return trimmed || null;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireVendorManagement();
    const { id } = await context.params;
    const body = await request.json();

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: trimOrNull(body.name) ?? undefined } : {}),
        ...(body.category !== undefined ? { category: trimOrNull(body.category) ?? undefined } : {}),
        ...(body.contactName !== undefined ? { contactName: trimOrNull(body.contactName) } : {}),
        ...(body.phone !== undefined ? { phone: trimOrNull(body.phone) } : {}),
        ...(body.email !== undefined ? { email: trimOrNull(body.email) } : {}),
        ...(body.website !== undefined ? { website: trimOrNull(body.website) } : {}),
        ...(body.notes !== undefined ? { notes: trimOrNull(body.notes) } : {}),
        ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) || 0 } : {}),
      },
      select: vendorSelect,
    });

    return NextResponse.json({ vendor: serializeVendor(vendor) });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to update vendor.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireVendorManagement();
    const { id } = await context.params;
    await prisma.vendor.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to delete vendor.", 500);
  }
}
