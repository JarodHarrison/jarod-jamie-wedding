import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "pg"],
  env: {
    NEXT_PUBLIC_APP_BUILD_ID:
      process.env.VERCEL_GIT_COMMIT_SHA ??
      process.env.NEXT_PUBLIC_APP_BUILD_ID ??
      "development",
  },
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
