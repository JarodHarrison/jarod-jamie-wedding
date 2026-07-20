/** Stripe payment links + promo art for Gold Coast pre-wedding activities. */

export type GoldCoastStripeProductId =
  | "gcue"
  | "penthouse"
  | "movie-world-fast-pass"
  | "dreamworld-fast-pass"
  | "little-truffle"
  | "draculas"
  | "australia-zoo";

export type GoldCoastStripeProduct = {
  id: GoldCoastStripeProductId;
  title: string;
  priceLabel: string;
  image: string;
  envKey: string;
  defaultUrl?: string;
  quantityHint?: string;
};

const STRIPE_HOSTS = ["stripe.com"] as const;

export const GOLD_COAST_STRIPE_PRODUCTS: Record<GoldCoastStripeProductId, GoldCoastStripeProduct> = {
  gcue: {
    id: "gcue",
    title: "Ultimate Gold Coast Experience",
    priceLabel: "Add-on · tickets, 2 dinners & processing fee included",
    image: "/gold-coast/ultimate-gold-coast-experience.png",
    envKey: "NEXT_PUBLIC_STRIPE_GCUE_PAYMENT_LINK",
    defaultUrl: "https://buy.stripe.com/6oUcN6d6Y5Wd82P5vb5AQ0b",
    quantityHint:
      "We book all tickets and experiences for you: Little Truffle and Dracula's dinners included, and the Stripe processing fee is already covered. Couples select quantity 2.",
  },
  penthouse: {
    id: "penthouse",
    title: "Penthouse Experience",
    priceLabel: "$550 per person",
    image: "/gold-coast/penthouse-experience.png",
    envKey: "NEXT_PUBLIC_STRIPE_PENTHOUSE_PAYMENT_LINK",
    defaultUrl: "https://buy.stripe.com/6oUcN6gjaesJ6YLcXD5AQ0a",
    quantityHint: "Couples: select quantity 2 at checkout ($1,100 total).",
  },
  "movie-world-fast-pass": {
    id: "movie-world-fast-pass",
    title: "Movie World Fast Pass",
    priceLabel: "Skip the queues",
    image: "/gold-coast/movie-world-fast-pass.png",
    envKey: "NEXT_PUBLIC_STRIPE_MOVIE_WORLD_FAST_PASS_PAYMENT_LINK",
    defaultUrl: "https://buy.stripe.com/cNi5kE8QI3O55UH1eV5AQ04",
  },
  "dreamworld-fast-pass": {
    id: "dreamworld-fast-pass",
    title: "Dreamworld Unlimited Fast Pass",
    priceLabel: "Skip the queues",
    image: "/gold-coast/dreamworld-fast-pass.png",
    envKey: "NEXT_PUBLIC_STRIPE_DREAMWORLD_FAST_PASS_PAYMENT_LINK",
    defaultUrl: "https://buy.stripe.com/8x23cwgjagAR3Mz7Dj5AQ05",
  },
  "little-truffle": {
    id: "little-truffle",
    title: "Little Truffle Dinner",
    priceLabel: "$89 per person",
    image: "/gold-coast/little-truffle.png",
    envKey: "NEXT_PUBLIC_STRIPE_LITTLE_TRUFFLE_PAYMENT_LINK",
    defaultUrl: "https://buy.stripe.com/28E5kE3woact82Pg9P5AQ0e",
  },
  draculas: {
    id: "draculas",
    title: "Dracula's Cabaret",
    priceLabel: "$149 per person",
    image: "/gold-coast/draculas.png",
    envKey: "NEXT_PUBLIC_STRIPE_DRACULAS_PAYMENT_LINK",
    defaultUrl: "https://buy.stripe.com/3cl3cwgjaactbf10aR5AQ0d",
  },
  "australia-zoo": {
    id: "australia-zoo",
    title: "Australia Zoo",
    priceLabel: "$79.45 per person",
    image: "/gold-coast/australia-zoo.png",
    envKey: "NEXT_PUBLIC_STRIPE_AUSTRALIA_ZOO_PAYMENT_LINK",
    defaultUrl: "https://buy.stripe.com/9B6dRa6IA84l5UHe1H5AQ07",
  },
};

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

export function getGoldCoastStripeUrl(productId: GoldCoastStripeProductId): string | null {
  const product = GOLD_COAST_STRIPE_PRODUCTS[productId];
  const fromEnv = readStripePaymentUrl(process.env[product.envKey as keyof NodeJS.ProcessEnv]);
  if (fromEnv) return fromEnv;
  return product.defaultUrl ?? null;
}

export function getGoldCoastProduct(productId: GoldCoastStripeProductId): GoldCoastStripeProduct {
  return GOLD_COAST_STRIPE_PRODUCTS[productId];
}
