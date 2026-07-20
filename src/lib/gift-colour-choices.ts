export type GiftColourChoice1Id =
  | "black"
  | "royal-blue"
  | "burgundy"
  | "dark-green"
  | "pink"
  | "dusty-pink"
  | "khaki"
  | "light-blue"
  | "purple"
  | "grey"
  | "brown"
  | "apricot";

export type GiftColourChoice2Id = "gold" | "silver" | "rose-gold";

export type GiftColourOption = {
  id: string;
  label: string;
  swatch: string;
};

export const GIFT_COLOUR_CHOICE_1_OPTIONS: GiftColourOption[] = [
  { id: "black", label: "Black", swatch: "#1a1a1a" },
  { id: "royal-blue", label: "Royal blue", swatch: "#4169e1" },
  { id: "burgundy", label: "Burgundy", swatch: "#800020" },
  { id: "dark-green", label: "Dark green", swatch: "#013220" },
  { id: "pink", label: "Pink", swatch: "#ffb6c1" },
  { id: "dusty-pink", label: "Dusty pink", swatch: "#d4a5a5" },
  { id: "khaki", label: "Khaki", swatch: "#c3b091" },
  { id: "light-blue", label: "Light blue", swatch: "#add8e6" },
  { id: "purple", label: "Purple", swatch: "#800080" },
  { id: "grey", label: "Grey", swatch: "#808080" },
  { id: "brown", label: "Brown", swatch: "#8b4513" },
  { id: "apricot", label: "Apricot", swatch: "#fbceb1" },
];

export const GIFT_COLOUR_CHOICE_2_OPTIONS: GiftColourOption[] = [
  { id: "gold", label: "Gold", swatch: "#c3a379" },
  { id: "silver", label: "Silver", swatch: "#c0c0c0" },
  { id: "rose-gold", label: "Rose gold", swatch: "#b76e79" },
];

/** @deprecated Use GIFT_COLOUR_CHOICE_1_OPTIONS */
export const GIFT_COLOUR_OPTIONS = GIFT_COLOUR_CHOICE_1_OPTIONS;

const giftColourChoice1Ids = new Set<string>(GIFT_COLOUR_CHOICE_1_OPTIONS.map((option) => option.id));
const giftColourChoice2Ids = new Set<string>(GIFT_COLOUR_CHOICE_2_OPTIONS.map((option) => option.id));

export function isGiftColourChoice1Id(value: string): value is GiftColourChoice1Id {
  return giftColourChoice1Ids.has(value);
}

export function isGiftColourChoice2Id(value: string): value is GiftColourChoice2Id {
  return giftColourChoice2Ids.has(value);
}

/** @deprecated Use isGiftColourChoice1Id */
export function isGiftColourId(value: string): value is GiftColourChoice1Id {
  return isGiftColourChoice1Id(value);
}

export function giftColourLabel(id: string | null | undefined): string | null {
  if (!id) return null;
  return (
    GIFT_COLOUR_CHOICE_1_OPTIONS.find((option) => option.id === id)?.label ??
    GIFT_COLOUR_CHOICE_2_OPTIONS.find((option) => option.id === id)?.label ??
    id
  );
}
