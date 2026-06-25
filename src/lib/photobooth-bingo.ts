export type PhotoboothBingoItem = {
  id: string;
  label: string;
  points: number;
};

export const PHOTOBOOTH_BINGO_ITEMS: PhotoboothBingoItem[] = [
  { id: "two-kissing", label: "Two people kissing", points: 2 },
  { id: "table-group", label: "Your table as a group", points: 2 },
  { id: "plant-flowers", label: "A plant or flowers", points: 2 },
  { id: "written-message", label: "A written message", points: 2 },
  { id: "photo-bomb", label: "A photo bomb", points: 2 },
  { id: "unflattering-closeup", label: "An unflattering close-up", points: 1 },
  { id: "song-in-pictures", label: "A song in pictures", points: 3 },
  { id: "a-baby", label: "A baby", points: 3 },
  { id: "with-grooms", label: "You & the grooms", points: 2 },
  { id: "celebrity", label: "Celebrity impersonation", points: 2 },
  { id: "outfit-change", label: "An outfit change", points: 3 },
  { id: "spirit-fingers", label: "Spirit fingers", points: 1 },
  { id: "pet-animal", label: "A pet or animal", points: 3 },
  { id: "booth-attendant", label: "Your booth attendant", points: 2 },
];

export const PHOTOBOOTH_BINGO_ITEM_IDS = PHOTOBOOTH_BINGO_ITEMS.map((item) => item.id);

export const PHOTOBOOTH_BINGO_MAX_SCORE = PHOTOBOOTH_BINGO_ITEMS.reduce(
  (total, item) => total + item.points,
  0,
);

export const ANNITA_BINGO_IMAGE = "/annita-bingo.png";

export function isValidBingoItemId(id: string): boolean {
  return PHOTOBOOTH_BINGO_ITEM_IDS.includes(id);
}

export function scoreBingoItems(checkedIds: string[]): number {
  const checked = new Set(checkedIds);
  return PHOTOBOOTH_BINGO_ITEMS.filter((item) => checked.has(item.id)).reduce(
    (total, item) => total + item.points,
    0,
  );
}

export function isBingoComplete(checkedIds: string[]): boolean {
  return PHOTOBOOTH_BINGO_ITEM_IDS.every((id) => checkedIds.includes(id));
}
