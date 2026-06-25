import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireVendorView } from "@/lib/auth/vendor-access";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireVendorView();
    const { id } = await context.params;
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      select: { documentMime: true, documentData: true, documentName: true },
    });

    if (!vendor?.documentData || !vendor.documentMime) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(Buffer.from(vendor.documentData), {
      headers: {
        "Content-Type": vendor.documentMime,
        "Content-Disposition": `inline; filename="${vendor.documentName ?? "vendor-document"}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to load document.", 500);
  }
}
