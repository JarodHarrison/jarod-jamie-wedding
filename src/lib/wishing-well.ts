const DEFAULT_WISHING_WELL_STRIPE_URL =
  "https://buy.stripe.com/fZudRagja2K1gzlcXD5AQ00";

const STRIPE_HOSTS = ["stripe.com"] as const;

export const WISHING_WELL_IMAGE = "/wishing-well.png";

export function getWishingWellStripeUrl(): string {
  const raw = process.env.NEXT_PUBLIC_STRIPE_WISHING_WELL_PAYMENT_LINK?.trim();
  if (!raw) return DEFAULT_WISHING_WELL_STRIPE_URL;

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:") return DEFAULT_WISHING_WELL_STRIPE_URL;
    const host = parsed.hostname.toLowerCase();
    const allowed = STRIPE_HOSTS.some(
      (pattern) => host === pattern || host.endsWith(`.${pattern}`),
    );
    return allowed ? raw : DEFAULT_WISHING_WELL_STRIPE_URL;
  } catch {
    return DEFAULT_WISHING_WELL_STRIPE_URL;
  }
}
