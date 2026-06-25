export type HinterlandAccommodationCategory =
  | "hotel"
  | "motel"
  | "bnb"
  | "cottage"
  | "estate"
  | "holiday_rental";

export type HinterlandAccommodation = {
  id: string;
  name: string;
  address: string;
  town: "Montville" | "Maleny" | "Mapleton" | "Flaxton";
  category: HinterlandAccommodationCategory;
  onSite?: boolean;
};

export const HINTERLAND_ACCOMMODATIONS: HinterlandAccommodation[] = [
  {
    id: "spicers-clovelly",
    name: "Spicers Clovelly Estate",
    address: "68 Obi Obi Road, Montville QLD 4560",
    town: "Montville",
    category: "estate",
    onSite: true,
  },
  {
    id: "narrows-escape",
    name: "Narrows Escape Rainforest Villas",
    address: "78 Narrows Road, Montville QLD 4560",
    town: "Montville",
    category: "cottage",
  },
  {
    id: "altitude-montville",
    name: "Altitude On Montville",
    address: "201 Main Street, Montville QLD 4560",
    town: "Montville",
    category: "bnb",
  },
  {
    id: "montville-country-cabins",
    name: "Montville Country Cabins",
    address: "194 Main Street, Montville QLD 4560",
    town: "Montville",
    category: "cottage",
  },
  {
    id: "montville-ocean-view",
    name: "Montville Ocean View Cottages",
    address: "237 Balmoral Road, Montville QLD 4560",
    town: "Montville",
    category: "cottage",
  },
  {
    id: "montville-mountain-inn",
    name: "Montville Mountain Inn",
    address: "167 Main Street, Montville QLD 4560",
    town: "Montville",
    category: "bnb",
  },
  {
    id: "montville-boutique-bnb",
    name: "Montville Boutique Bed & Breakfast",
    address: "194 Main Street, Montville QLD 4560",
    town: "Montville",
    category: "bnb",
  },
  {
    id: "the-falls-montville",
    name: "The Falls Montville",
    address: "2 Narrows Road, Montville QLD 4560",
    town: "Montville",
    category: "cottage",
  },
  {
    id: "mayfield-montville",
    name: "Mayfield on Montville",
    address: "75 Narrows Road, Montville QLD 4560",
    town: "Montville",
    category: "cottage",
  },
  {
    id: "treetops-montville",
    name: "Treetops Montville",
    address: "138 Main Street, Montville QLD 4560",
    town: "Montville",
    category: "cottage",
  },
  {
    id: "country-house-hunchy",
    name: "The Country House at Hunchy",
    address: "98 Hunchy Road, Montville QLD 4560",
    town: "Montville",
    category: "cottage",
  },
  {
    id: "montville-holiday-apartments",
    name: "Montville Holiday Apartments",
    address: "138 Main Street, Montville QLD 4560",
    town: "Montville",
    category: "holiday_rental",
  },
  {
    id: "secrets-on-the-mountain",
    name: "Secrets on the Mountain",
    address: "58 Narrows Road, Montville QLD 4560",
    town: "Montville",
    category: "cottage",
  },
  {
    id: "avocado-grove",
    name: "Avocado Grove Bed & Breakfast",
    address: "247 Flaxton Drive, Flaxton QLD 4560",
    town: "Flaxton",
    category: "bnb",
  },
  {
    id: "maleny-hotel",
    name: "Maleny Hotel",
    address: "24 Maple Street, Maleny QLD 4552",
    town: "Maleny",
    category: "hotel",
  },
  {
    id: "maleny-lodge",
    name: "Maleny Lodge",
    address: "58 Maple Street, Maleny QLD 4552",
    town: "Maleny",
    category: "bnb",
  },
  {
    id: "maleny-tropical-retreat",
    name: "Maleny Tropical Retreat",
    address: "540 Maleny-Montville Road, Maleny QLD 4552",
    town: "Maleny",
    category: "cottage",
  },
  {
    id: "maleny-hills-motel",
    name: "Maleny Hills Motel",
    address: "2 Bunya Street, Maleny QLD 4552",
    town: "Maleny",
    category: "motel",
  },
  {
    id: "lillypillys",
    name: "Lillypilly's Cottages & Day Spa",
    address: "194 Maleny-Stanley River Road, Maleny QLD 4552",
    town: "Maleny",
    category: "cottage",
  },
  {
    id: "roseville-guesthouse",
    name: "Roseville Guesthouse",
    address: "25 Coral Street, Maleny QLD 4552",
    town: "Maleny",
    category: "bnb",
  },
  {
    id: "spicers-tamarind",
    name: "Spicers Tamarind Retreat",
    address: "88 Obi Obi Road, Maleny QLD 4552",
    town: "Maleny",
    category: "estate",
  },
  {
    id: "maleny-valley-lodge",
    name: "Maleny Valley Lodge",
    address: "58 Obi Lane South, Maleny QLD 4552",
    town: "Maleny",
    category: "bnb",
  },
  {
    id: "witta-circle",
    name: "Witta Circle Farmstay",
    address: "98 Witta Road, Witta QLD 4552",
    town: "Maleny",
    category: "cottage",
  },
  {
    id: "kondalilla-eco",
    name: "Kondalilla Eco Resort",
    address: "168 Narrows Road, Montville QLD 4560",
    town: "Montville",
    category: "cottage",
  },
  {
    id: "mapleton-springs",
    name: "Mapleton Springs",
    address: "198 Obi Obi Road, Mapleton QLD 4560",
    town: "Mapleton",
    category: "bnb",
  },
];

const CATEGORY_LABELS: Record<HinterlandAccommodationCategory, string> = {
  hotel: "Hotel",
  motel: "Motel",
  bnb: "B&B",
  cottage: "Cottage",
  estate: "Estate",
  holiday_rental: "Holiday rental",
};

export function accommodationCategoryLabel(category: HinterlandAccommodationCategory): string {
  return CATEGORY_LABELS[category];
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const CATEGORY_ALIASES: Record<string, HinterlandAccommodationCategory[]> = {
  hotel: ["hotel"],
  motel: ["motel"],
  bnb: ["bnb"],
  "bed and breakfast": ["bnb"],
  guesthouse: ["bnb"],
  airbnb: ["holiday_rental", "cottage", "bnb"],
  rental: ["holiday_rental", "cottage"],
  cottage: ["cottage"],
  cabin: ["cottage"],
  villa: ["cottage", "holiday_rental"],
  apartment: ["holiday_rental"],
};

function matchesCategoryQuery(query: string, item: HinterlandAccommodation): boolean {
  for (const [alias, categories] of Object.entries(CATEGORY_ALIASES)) {
    if (!query.includes(alias)) continue;
    if (categories.includes(item.category)) return true;
  }
  return false;
}

export function searchHinterlandAccommodations(
  query: string,
  options?: { accommodationType?: string; limit?: number },
): HinterlandAccommodation[] {
  const limit = options?.limit ?? 8;
  const type = options?.accommodationType;

  let pool = HINTERLAND_ACCOMMODATIONS;
  if (type === "ON_SITE") {
    pool = pool.filter((item) => item.onSite);
  }

  const trimmed = query.trim();
  if (!trimmed) {
    return pool.slice(0, limit);
  }

  const normalizedQuery = normalize(trimmed);
  const tokens = normalizedQuery.split(" ").filter(Boolean);

  const scored = pool
    .map((item) => {
      const haystack = normalize(`${item.name} ${item.town} ${item.address} ${item.category}`);
      let score = 0;

      if (haystack.startsWith(normalizedQuery)) score += 100;
      else if (haystack.includes(normalizedQuery)) score += 60;

      for (const token of tokens) {
        if (haystack.includes(token)) score += 12;
        if (normalize(item.town).includes(token)) score += 8;
      }

      if (matchesCategoryQuery(normalizedQuery, item)) score += 20;

      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));

  return scored.slice(0, limit).map(({ item }) => item);
}

export function findHinterlandAccommodationByName(name: string): HinterlandAccommodation | undefined {
  const normalized = normalize(name);
  return HINTERLAND_ACCOMMODATIONS.find((item) => normalize(item.name) === normalized);
}

export const SPICERS_CLOVELLY = HINTERLAND_ACCOMMODATIONS.find((item) => item.onSite)!;
