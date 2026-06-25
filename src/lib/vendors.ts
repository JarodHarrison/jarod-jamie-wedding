import type { Prisma } from "@prisma/client";

export const vendorSelect = {
  id: true,
  name: true,
  category: true,
  contactName: true,
  phone: true,
  email: true,
  website: true,
  notes: true,
  sortOrder: true,
  documentName: true,
  documentMime: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.VendorSelect;

export type VendorRecord = Prisma.VendorGetPayload<{ select: typeof vendorSelect }>;

export function serializeVendor(vendor: VendorRecord) {
  return {
    ...vendor,
    hasDocument: Boolean(vendor.documentMime),
    createdAt: vendor.createdAt.toISOString(),
    updatedAt: vendor.updatedAt.toISOString(),
  };
}

export type SerializedVendor = ReturnType<typeof serializeVendor>;

export const VENDOR_DOCUMENT_ACCEPT =
  "image/jpeg,image/png,image/webp,application/pdf";
export const VENDOR_DOCUMENT_MAX_BYTES = 5_000_000;
