/** Cuisine and food-type tags used to match guest cravings to venues. */
export const CUISINE_ALIASES: Record<string, string[]> = {
  pizza: ["pizza", "italian", "pizzeria"],
  pasta: ["pasta", "italian"],
  italian: ["italian", "pizza", "pasta"],
  burger: ["burger", "burgers", "diner", "american"],
  burgers: ["burger", "burgers", "diner", "american"],
  seafood: ["seafood", "fish", "fish-and-chips"],
  fish: ["seafood", "fish", "fish-and-chips"],
  "fish and chips": ["fish-and-chips", "seafood", "fish"],
  "fish & chips": ["fish-and-chips", "seafood", "fish"],
  sushi: ["sushi", "japanese", "asian"],
  japanese: ["japanese", "sushi", "asian"],
  thai: ["thai", "asian"],
  asian: ["asian", "thai", "japanese", "chinese", "vietnamese"],
  chinese: ["chinese", "asian"],
  indian: ["indian", "curry"],
  curry: ["indian", "curry", "thai"],
  vegan: ["vegan", "vegetarian"],
  vegetarian: ["vegetarian", "vegan"],
  coffee: ["coffee", "cafe", "brunch"],
  cafe: ["cafe", "coffee", "brunch"],
  brunch: ["brunch", "cafe", "breakfast"],
  breakfast: ["breakfast", "brunch", "cafe"],
  lunch: ["lunch", "cafe", "pub"],
  dinner: ["dinner", "fine-dining", "restaurant"],
  beer: ["beer", "brewery", "pub", "craft-beer"],
  brewery: ["brewery", "beer", "craft-beer", "pub"],
  wine: ["wine", "winery"],
  winery: ["winery", "wine"],
  pub: ["pub", "bar", "gastropub"],
  bar: ["bar", "pub", "cocktails"],
  cheese: ["cheese", "dairy", "tastings"],
  bakery: ["bakery", "pastry", "bread"],
  dessert: ["dessert", "sweets", "chocolate"],
  chocolate: ["chocolate", "dessert", "sweets"],
  steak: ["steak", "grill", "fine-dining"],
  mexican: ["mexican", "tacos"],
  greek: ["greek", "mediterranean"],
};

const FOOD_CRAVING_PATTERNS = [
  /\b(pizza|pasta|burger|burgers|sushi|ramen|tacos?|curry|steak|seafood|fish and chips|fish & chips)\b/i,
  /\b(coffee|brunch|breakfast|lunch|dinner|takeaway|take away|fast food)\b/i,
  /\b(vegan|vegetarian|gluten[- ]free)\b/i,
  /\b(cheese|bakery|pastry|dessert|chocolate|gelato|ice cream)\b/i,
  /\b(want|craving|fancy|keen on|in the mood for)\b.*\b(eat|food|meal|bite|snack)\b/i,
  /\bwhere.*(pizza|burger|sushi|fish|coffee|beer|wine|pub|bar)\b/i,
];

export function extractCuisineIntent(query: string): string[] {
  const lower = query.toLowerCase();
  const tags = new Set<string>();

  for (const [phrase, mapped] of Object.entries(CUISINE_ALIASES)) {
    if (lower.includes(phrase)) {
      for (const tag of mapped) tags.add(tag);
    }
  }

  for (const word of lower.split(/[^a-z0-9&+-]+/)) {
    if (word.length < 3) continue;
    const mapped = CUISINE_ALIASES[word];
    if (mapped) for (const tag of mapped) tags.add(tag);
  }

  return [...tags];
}

export function hasFoodCravingIntent(query: string): boolean {
  return FOOD_CRAVING_PATTERNS.some((pattern) => pattern.test(query));
}

export function inferCuisineTags(args: {
  name: string;
  category: string;
  description?: string;
  googleTypes?: string[];
}): string[] {
  const haystack = `${args.name} ${args.category} ${args.description ?? ""} ${(args.googleTypes ?? []).join(" ")}`.toLowerCase();
  const tags = new Set<string>();

  const rules: Array<{ pattern: RegExp; tags: string[] }> = [
    { pattern: /\bpizza|pizzeria|italian\b/, tags: ["pizza", "italian"] },
    { pattern: /\bburger|diner|garage\b/, tags: ["burger", "diner", "american"] },
    { pattern: /\bfish|seafood|chips\b/, tags: ["fish-and-chips", "seafood"] },
    { pattern: /\bsushi|japanese|ramen\b/, tags: ["sushi", "japanese", "asian"] },
    { pattern: /\bthai|vietnamese|chinese|asian|pan-asian|tamarind|spirit house\b/, tags: ["asian", "thai"] },
    { pattern: /\bindian|curry\b/, tags: ["indian", "curry"] },
    { pattern: /\bbrewery|craft beer|brouhaha\b/, tags: ["brewery", "beer", "pub"] },
    { pattern: /\bwinery|vineyard|wine\b/, tags: ["winery", "wine"] },
    { pattern: /\bpub|public house|gastropub\b/, tags: ["pub", "gastropub"] },
    { pattern: /\bcaf[eé]|coffee|brunch\b/, tags: ["cafe", "coffee", "brunch"] },
    { pattern: /\bfine dining|hatted|long apron\b/, tags: ["fine-dining", "restaurant"] },
    { pattern: /\bcheese|dairy|tasting\b/, tags: ["cheese", "dairy", "tastings"] },
    { pattern: /\bbakery|bread|pastry\b/, tags: ["bakery"] },
    { pattern: /\bchocolate|confection|fudge|sweets\b/, tags: ["chocolate", "dessert"] },
    { pattern: /\bbar\b/, tags: ["bar", "pub"] },
    { pattern: /\brestaurant|dining|bistro\b/, tags: ["restaurant"] },
    { pattern: /\bmeal_takeaway|takeaway\b/, tags: ["takeaway"] },
  ];

  for (const rule of rules) {
    if (rule.pattern.test(haystack)) {
      for (const tag of rule.tags) tags.add(tag);
    }
  }

  if (tags.size === 0) tags.add("restaurant");
  return [...tags];
}

export function scoreEateryForQuery(
  eatery: { name: string; category: string; description: string; cuisineTags: string[] },
  query: string,
): number {
  const haystack = `${eatery.name} ${eatery.category} ${eatery.description}`.toLowerCase();
  let score = 0;

  const cuisineIntent = extractCuisineIntent(query);
  if (cuisineIntent.length > 0) {
    for (const tag of cuisineIntent) {
      if (eatery.cuisineTags.includes(tag)) score += 12;
      if (haystack.includes(tag.replace(/-/g, " "))) score += 4;
    }
  }

  for (const word of query.toLowerCase().split(/[^a-z0-9]+/)) {
    if (word.length < 3) continue;
    if (haystack.includes(word)) score += 2;
    if (eatery.cuisineTags.some((tag) => tag.includes(word) || word.includes(tag))) score += 3;
  }

  return score;
}
