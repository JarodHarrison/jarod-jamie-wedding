import "dotenv/config";
import { defineConfig } from "prisma/config";

/** Prisma generate does not connect; a placeholder is fine when env is unavailable (e.g. Vercel npm install). */
const GENERATE_PLACEHOLDER_URL =
  "postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder?schema=public";

function resolvePrismaDatabaseUrl(): string {
  return process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? GENERATE_PLACEHOLDER_URL;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: resolvePrismaDatabaseUrl(),
  },
});
