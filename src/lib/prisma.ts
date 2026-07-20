import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

/** Bump when models are added so a stale global PrismaClient is discarded in dev. */
const PRISMA_CLIENT_GENERATION = 2;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaPool: Pool | undefined;
  prismaGeneration: number | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool =
    globalForPrisma.prismaPool ??
    new Pool({
      connectionString,
      ssl: connectionString.includes("localhost") ? undefined : { rejectUnauthorized: false },
    });

  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prismaPool = pool;
  }

  return client;
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  const generationMatches = globalForPrisma.prismaGeneration === PRISMA_CLIENT_GENERATION;
  const hasBucksConfig =
    cached != null &&
    typeof (cached as PrismaClient & { bucksPartyConfig?: unknown }).bucksPartyConfig !==
      "undefined";

  if (cached && generationMatches && hasBucksConfig) {
    return cached;
  }

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaGeneration = PRISMA_CLIENT_GENERATION;
  }
  return client;
}

export const prisma = getPrismaClient();

export type { Prisma } from "@prisma/client";
export {
  RsvpStatus,
  GuestTier,
  GuestStoryStatus,
  ShuttleStopStatusType,
} from "@prisma/client";
