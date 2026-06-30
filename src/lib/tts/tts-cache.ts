import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

export function ttsTextHash(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export async function readCachedTtsAudio(
  textHash: string,
): Promise<{ audio: Buffer; provider: string } | null> {
  const row = await prisma.annitaTtsCache.findUnique({ where: { textHash } });
  if (!row) return null;
  return { audio: Buffer.from(row.audio), provider: row.provider };
}

export async function writeCachedTtsAudio(
  textHash: string,
  audio: Buffer,
  provider: string,
): Promise<void> {
  const bytes = Uint8Array.from(audio);
  await prisma.annitaTtsCache.upsert({
    where: { textHash },
    create: { textHash, audio: bytes, provider },
    update: { audio: bytes, provider },
  });
}
