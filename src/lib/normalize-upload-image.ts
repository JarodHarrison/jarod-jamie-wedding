type NormalizePhotoOptions = {
  maxDimension: number;
  maxBytes: number;
  quality?: number;
};

async function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });
}

/** Resize and convert phone photos to JPEG so uploads stay small and display everywhere. */
export async function normalizePhotoForUpload(
  file: File,
  options: NormalizePhotoOptions,
): Promise<File> {
  if (file.type === "image/jpeg" && file.size <= options.maxBytes) {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("We couldn't read that photo — try another image or take a new one.");
  }

  const longestEdge = Math.max(bitmap.width, bitmap.height);
  const scale = Math.min(1, options.maxDimension / longestEdge);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close?.();
    throw new Error("We couldn't process that photo on this device.");
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  let quality = options.quality ?? 0.86;
  let blob = await canvasToJpegBlob(canvas, quality);

  while (blob && blob.size > options.maxBytes && quality > 0.45) {
    quality -= 0.08;
    blob = await canvasToJpegBlob(canvas, quality);
  }

  if (!blob) {
    throw new Error("We couldn't prepare that photo for upload.");
  }

  if (blob.size > options.maxBytes) {
    throw new Error("Photo is still too large — try a closer crop or a smaller image.");
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
}
