/** Gold Coast penthouse trip — re-exports penthouse product from shared Stripe config. */
export {
  getGoldCoastProduct,
  getGoldCoastStripeUrl,
  GOLD_COAST_STRIPE_PRODUCTS,
} from "@/lib/gold-coast-stripe";

import { getGoldCoastProduct, getGoldCoastStripeUrl } from "@/lib/gold-coast-stripe";

export const PENTHOUSE_TRIP_PAYMENT = {
  perPersonLabel: "$550",
  perPersonCents: 55000,
  coupleTotalLabel: "$1,100",
  title: "Penthouse Experience",
  description: getGoldCoastProduct("penthouse").priceLabel.replace(" per person", "") + " — three nights in a Gold Coast penthouse.",
  quantityHint: getGoldCoastProduct("penthouse").quantityHint ?? "",
} as const;

export function getPenthouseStripePaymentUrl(): string | null {
  return getGoldCoastStripeUrl("penthouse");
}

export function hasPenthousePaymentLinks(): boolean {
  return Boolean(getPenthouseStripePaymentUrl());
}
