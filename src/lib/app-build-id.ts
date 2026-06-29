/** Baked into the client bundle at build time — compared against /api/app-version on tab changes. */
export const APP_BUILD_ID =
  process.env.NEXT_PUBLIC_APP_BUILD_ID?.trim() || "development";
