export const GLOW_UP_PARTY_PUBLIC_PATH = "/Glowup";
export const GLOW_UP_PARTY_DATE_LABEL = "5 September 2026";
export const GLOW_UP_PARTY_TIME_LABEL = "11:00 am";
export const GLOW_UP_PARTY_WHEN_LABEL = "5 September 2026 · 11:00 am";
export const GLOW_UP_PARTY_RSVP_DEADLINE_LABEL = "29 August 2026";
export const GLOW_UP_PARTY_PLACE_LABEL = "J-rod & Jamo's house, Ellenbrook";
export const GLOW_UP_PARTY_PLACE_NOTE = "Exact address closer to the date";

export const TEETH_WHITENING_FLYER = "/glow-up/teeth-whitening-party.png";
export const BOTOX_PUMP_PARTY_FLYER = "/glow-up/botox-pump-party.png";

export const GLOW_UP_BOTOX_PRICE_PER_UNIT = 3.75;
export const GLOW_UP_FILLER_PRICE_PER_ML = 375;
export const GLOW_UP_WHITENING_PRICE = 250;
export const GLOW_UP_WHITENING_KIT_PRICE = 50;

export type GlowUpInterestChoice = "teeth" | "botox" | "both";
export type GlowUpWhiteningPackage = "WHITENING_ONLY" | "WHITENING_WITH_KIT";
export type GlowUpPartySource = "PUBLIC" | "ADMIN_LINK";

export const GLOW_UP_INTEREST_OPTIONS: {
  value: GlowUpInterestChoice;
  label: string;
  description: string;
}[] = [
  {
    value: "teeth",
    label: "Teeth Whitening",
    description: `$${GLOW_UP_WHITENING_PRICE} whitening · optional Glow Kit +$${GLOW_UP_WHITENING_KIT_PRICE}`,
  },
  {
    value: "botox",
    label: "Botox Pump Party",
    description: `$${GLOW_UP_BOTOX_PRICE_PER_UNIT}/unit botox · $${GLOW_UP_FILLER_PRICE_PER_ML}/ml filler`,
  },
  {
    value: "both",
    label: "Hit me with both!",
    description: "Teeth whitening and the Botox Pump Party",
  },
];

export const GLOW_UP_WHITENING_OPTIONS: {
  value: GlowUpWhiteningPackage;
  label: string;
  description: string;
}[] = [
  {
    value: "WHITENING_ONLY",
    label: `Whitening · $${GLOW_UP_WHITENING_PRICE}`,
    description: "Professional in-chair whitening on the day.",
  },
  {
    value: "WHITENING_WITH_KIT",
    label: `Whitening + Glow Kit · $${GLOW_UP_WHITENING_PRICE + GLOW_UP_WHITENING_KIT_PRICE}`,
    description: `Add the $${GLOW_UP_WHITENING_KIT_PRICE} at-home kit on the day for enhanced, longer-lasting results.`,
  },
];

export function isGlowUpInterestChoice(value: unknown): value is GlowUpInterestChoice {
  return value === "teeth" || value === "botox" || value === "both";
}

export function isGlowUpWhiteningPackage(value: unknown): value is GlowUpWhiteningPackage {
  return value === "WHITENING_ONLY" || value === "WHITENING_WITH_KIT";
}

export function glowUpInterestLabel(value: GlowUpInterestChoice): string {
  return GLOW_UP_INTEREST_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function glowUpWhiteningLabel(value: GlowUpWhiteningPackage | null | undefined): string {
  if (!value) return "-";
  return GLOW_UP_WHITENING_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function wantsWhitening(interest: GlowUpInterestChoice): boolean {
  return interest === "teeth" || interest === "both";
}

export function wantsPumpParty(interest: GlowUpInterestChoice): boolean {
  return interest === "botox" || interest === "both";
}

export function glowUpPartyShareUrl(origin?: string): string {
  const base = origin?.replace(/\/$/, "") || "";
  return `${base}${GLOW_UP_PARTY_PUBLIC_PATH}`;
}
