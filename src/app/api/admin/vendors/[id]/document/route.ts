import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireVendorManagement } from "@/lib/auth/vendor-access";
import { serializeVendor, VENDOR_DOCUMENT_ACCEPT, VENDOR_DOCUMENT_MAX_BYTES, vendorSelect } from "@/lib/vendors";
import { prisma } from "@/lib/prisma";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireVendorManagement();
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

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireVendorManagement();
    const { id } = await context.params;
    const formData = await request.formData();
    const file = formData.get("document");

    if (!(file instanceof File)) {
      return jsonError("Please choose a file to upload.", 400);
    }

    if (!ALLOWED_MIME.has(file.type)) {
      return jsonError(`Use a supported file (${VENDOR_DOCUMENT_ACCEPT}).`, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength > VENDOR_DOCUMENT_MAX_BYTES) {
      return jsonError("File is too large — please use a file under 5MB.", 400);
    }

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        documentMime: file.type,
        documentData: buffer,
        documentName: file.name,
      },
      select: vendorSelect,
    });

    return NextResponse.json({ vendor: serializeVendor(vendor) });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to upload document.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireVendorManagement();
    const { id } = await context.params;
    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        documentMime: null,
        documentData: null,
        documentName: null,
      },
      select: vendorSelect,
    });
    return NextResponse.json({ vendor: serializeVendor(vendor) });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    return jsonError("Failed to remove document.", 500);
  }
}
