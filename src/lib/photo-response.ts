import { NextResponse } from "next/server";

export function binaryPhotoResponse(
  photoData: Buffer | Uint8Array,
  mime: string,
  cacheControl: string,
) {
  const bytes = Buffer.isBuffer(photoData) ? photoData : Buffer.from(photoData);

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": mime,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": cacheControl,
    },
  });
}
