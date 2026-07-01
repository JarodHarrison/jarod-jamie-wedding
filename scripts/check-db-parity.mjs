import { config } from "dotenv";
import { resolve } from "node:path";
import pg from "pg";

config({ path: resolve(process.cwd(), ".env") });

async function count(url, label) {
  const client = new pg.Client({ connectionString: url });
  try {
    await client.connect();
    const tables = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('HinterlandEatery', 'HinterlandAttraction')`,
    );
    if (tables.rows.length === 0) {
      console.log(`${label}: cache tables missing`);
      return;
    }
    const eatery = await client.query(`SELECT COUNT(*)::int AS n FROM "HinterlandEatery"`);
    const attraction = await client.query(`SELECT COUNT(*)::int AS n FROM "HinterlandAttraction"`);
    console.log(
      `${label}: eateries=${eatery.rows[0].n}, attractions=${attraction.rows[0].n}`,
    );
  } catch (error) {
    console.log(`${label}: ERROR`, error instanceof Error ? error.message : error);
  } finally {
    await client.end().catch(() => {});
  }
}

const localUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
await count(localUrl, "local-dev-db");

const neonEnv = config({ path: resolve(process.cwd(), ".env.neon"), override: true });
const neonUrl = neonEnv.parsed?.DIRECT_URL;
if (neonUrl) await count(neonUrl, "neon-production");
