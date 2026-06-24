/** Canonical site origin for OAuth redirects (must match Google Cloud redirect URIs). */
export function getGoogleOAuthOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "").replace(/^"|"$/g, "");
  if (configured) return configured;

  return getRequestOrigin(request);
}

/** Origin for the current request. */
export function getRequestOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const host = forwardedHost.split(",")[0]?.trim();
    const proto =
      request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "https";
    if (host) return `${proto}://${host}`;
  }

  return new URL(request.url).origin;
}
