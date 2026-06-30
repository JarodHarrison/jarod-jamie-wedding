import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

const PROMOTE_AFTER_ASKS = 3;
const SIMILARITY_THRESHOLD = 0.72;
const MIN_LEARN_REPLY_CHARS = 40;
const MAX_QUESTION_CHARS = 280;

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "to",
  "for",
  "of",
  "in",
  "on",
  "at",
  "is",
  "are",
  "am",
  "be",
  "can",
  "could",
  "would",
  "please",
  "tell",
  "me",
  "you",
  "i",
  "we",
  "my",
  "our",
  "what",
  "when",
  "where",
  "how",
  "do",
  "does",
  "did",
  "about",
  "know",
]);

export function normalizeQuestionText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word))
    .join(" ")
    .trim()
    .slice(0, MAX_QUESTION_CHARS);
}

export function questionFingerprint(text: string): string {
  const normalized = normalizeQuestionText(text);
  if (!normalized) return createHash("sha256").update(text.trim().toLowerCase()).digest("hex").slice(0, 32);
  return createHash("sha256").update(normalized).digest("hex").slice(0, 32);
}

function questionTokenSet(text: string): Set<string> {
  return new Set(
    normalizeQuestionText(text)
      .split(/\s+/)
      .filter((word) => word.length > 2),
  );
}

export function questionSimilarity(a: string, b: string): number {
  const left = questionTokenSet(a);
  const right = questionTokenSet(b);
  if (left.size === 0 || right.size === 0) return 0;

  let overlap = 0;
  for (const token of left) {
    if (right.has(token)) overlap += 1;
  }

  return overlap / Math.max(left.size, right.size);
}

export async function findCachedKnowledgeAnswer(question: string): Promise<{
  reply: string;
  entryId: string;
} | null> {
  const trimmed = question.trim();
  if (!trimmed || trimmed.length > MAX_QUESTION_CHARS) return null;

  const fingerprint = questionFingerprint(trimmed);

  const exact = await prisma.annitaKnowledgeEntry.findFirst({
    where: { promoted: true, fingerprint },
  });
  if (exact) {
    await prisma.annitaKnowledgeEntry.update({
      where: { id: exact.id },
      data: { askCount: { increment: 1 } },
    });
    return { reply: exact.reply, entryId: exact.id };
  }

  const promoted = await prisma.annitaKnowledgeEntry.findMany({
    where: { promoted: true },
    select: { id: true, sampleQuestion: true, reply: true },
    orderBy: { askCount: "desc" },
    take: 120,
  });

  let best: { id: string; reply: string; score: number } | null = null;
  for (const entry of promoted) {
    const score = questionSimilarity(trimmed, entry.sampleQuestion);
    if (score >= SIMILARITY_THRESHOLD && (!best || score > best.score)) {
      best = { id: entry.id, reply: entry.reply, score };
    }
  }

  if (!best) return null;

  await prisma.annitaKnowledgeEntry.update({
    where: { id: best.id },
    data: { askCount: { increment: 1 } },
  });

  return { reply: best.reply, entryId: best.id };
}

export async function recordAnnitaKnowledgeExchange(args: {
  question: string;
  reply: string;
  guestId?: string;
  fromCache?: boolean;
  entryId?: string;
  learn?: boolean;
}): Promise<void> {
  const question = args.question.trim();
  const reply = args.reply.trim();
  if (!question || !reply) return;

  const fingerprint = questionFingerprint(question);

  await prisma.annitaQuestionLog.create({
    data: {
      guestId: args.guestId ?? null,
      fingerprint,
      question,
      reply,
      fromCache: args.fromCache ?? false,
      entryId: args.entryId ?? null,
    },
  });

  if (args.fromCache || args.learn === false) return;
  if (reply.length < MIN_LEARN_REPLY_CHARS) return;

  const existing = await prisma.annitaKnowledgeEntry.findUnique({
    where: { fingerprint },
  });

  if (!existing) {
    await prisma.annitaKnowledgeEntry.create({
      data: {
        fingerprint,
        sampleQuestion: question,
        reply,
        source: "learned",
        askCount: 1,
        promoted: false,
      },
    });
    return;
  }

  const sameReply =
    questionSimilarity(reply, existing.reply) >= 0.85 ||
    reply.slice(0, 120) === existing.reply.slice(0, 120);
  const nextReply = sameReply ? existing.reply : reply;
  const nextCount = existing.askCount + 1;
  const shouldPromote = nextCount >= PROMOTE_AFTER_ASKS;

  await prisma.annitaKnowledgeEntry.update({
    where: { id: existing.id },
    data: {
      sampleQuestion: question,
      reply: nextReply,
      askCount: nextCount,
      promoted: existing.promoted || shouldPromote,
    },
  });
}
