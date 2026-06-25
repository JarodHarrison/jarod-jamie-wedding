const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export function detectImageMime(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return "image/png";
  }

  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  const boxType = buffer.subarray(4, 8).toString("ascii");
  if (boxType === "ftyp") {
    const brand = buffer.subarray(8, 12).toString("ascii").toLowerCase();
    if (brand.includes("heic") || brand.includes("heif") || brand.includes("mif1")) {
      return "image/heic";
    }
  }

  return null;
}

export function resolveUploadImageMime(file: File, buffer: Buffer): string | null {
  const declared = file.type?.trim().toLowerCase();
  if (declared && ALLOWED_IMAGE_MIMES.has(declared)) {
    return declared;
  }

  return detectImageMime(buffer);
}
