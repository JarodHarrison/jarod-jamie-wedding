const STRIPE_HOSTS = ["stripe.com"] as const;

function readStripePaymentUrl(raw: string | undefined): string | null {
  const url = raw?.trim();
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    const host = parsed.hostname.toLowerCase();
    const allowed = STRIPE_HOSTS.some(
      (pattern) => host === pattern || host.endsWith(`.${pattern}`),
    );
    return allowed ? url : null;
  } catch {
    return null;
  }
}

/** Stripe Payment Link for bucks prepay: unset until closer to the date. */
export function getBucksPartyStripeUrl(): string | null {
  return readStripePaymentUrl(process.env.NEXT_PUBLIC_STRIPE_BUCKS_PARTY_PAYMENT_LINK);
}

export function isBucksPartyStripeLive(): boolean {
  return Boolean(getBucksPartyStripeUrl());
}
