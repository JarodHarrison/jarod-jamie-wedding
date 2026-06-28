export type GiftColourId =
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

export type GiftColourOption = {
  id: GiftColourId;
  label: string;
  swatch: string;
};

export const GIFT_COLOUR_OPTIONS: GiftColourOption[] = [
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

const giftColourIds = new Set<string>(GIFT_COLOUR_OPTIONS.map((option) => option.id));

export function isGiftColourId(value: string): value is GiftColourId {
  return giftColourIds.has(value);
}

export function giftColourLabel(id: string | null | undefined): string | null {
  if (!id) return null;
  return GIFT_COLOUR_OPTIONS.find((option) => option.id === id)?.label ?? id;
}
