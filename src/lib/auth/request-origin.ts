/** Origin for the current request (must match OAuth cookie + redirect URI host). */
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
