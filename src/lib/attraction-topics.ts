import type { Attraction } from "@/components/wedding/data/attractions";

export const TOPIC_ALIASES: Record<string, string[]> = {
  waterfall: ["waterfall", "nature", "walks", "hiking"],
  walk: ["walks", "hiking", "nature", "trail"],
  hike: ["hiking", "walks", "nature", "trail"],
  hiking: ["hiking", "walks", "nature"],
  nature: ["nature", "rainforest", "park", "walks"],
  rainforest: ["rainforest", "nature", "park"],
  park: ["park", "nature"],
  beach: ["coastal", "beach", "ocean"],
  coastal: ["coastal", "beach", "lighthouse"],
  shopping: ["shopping", "market", "boutique"],
  market: ["market", "shopping"],
  gallery: ["gallery", "art", "museum"],
  art: ["art", "gallery", "museum"],
  museum: ["museum", "historic"],
  wildlife: ["wildlife", "zoo", "animals"],
  zoo: ["zoo", "wildlife"],
  theme: ["theme-park", "family", "adventure"],
  adventure: ["adventure", "climbing", "action"],
  chocolate: ["chocolate", "sweets", "food-tour"],
  cheese: ["dairy", "farm", "tastings"],
  winery: ["winery", "wine", "tastings"],
  historic: ["historic", "landmark", "museum"],
  quirky: ["oddity", "landmark", "historic"],
  family: ["family", "theme-park", "kids"],
  kids: ["family", "kids", "theme-park"],
};

export function inferTopicTags(attraction: Pick<Attraction, "title" | "category" | "desc">): string[] {
  const haystack = `${attraction.title} ${attraction.category} ${attraction.desc}`.toLowerCase();
  const tags = new Set<string>();

  const rules: Array<{ pattern: RegExp; tags: string[] }> = [
    { pattern: /\bwaterfall|falls\b/, tags: ["waterfall", "nature", "walks"] },
    { pattern: /\brainforest|national park|reserve\b/, tags: ["rainforest", "nature", "park"] },
    { pattern: /\bwalk|hike|trail|summit\b/, tags: ["walks", "hiking", "nature"] },
    { pattern: /\bshop|boutique|village|market\b/, tags: ["shopping", "market"] },
    { pattern: /\bgallery|art\b/, tags: ["gallery", "art"] },
    { pattern: /\bmuseum|historic|cinema|castle\b/, tags: ["museum", "historic"] },
    { pattern: /\bzoo|wildlife|aviary\b/, tags: ["wildlife", "zoo"] },
    { pattern: /\btheme park|amusement|maze|climbing|ropes\b/, tags: ["adventure", "family"] },
    { pattern: /\bchocolate|ginger|nut|fudge\b/, tags: ["food-tour", "quirky"] },
    { pattern: /\bfarm|dairy|cheese\b/, tags: ["farm", "tastings"] },
    { pattern: /\bwinery|vineyard|barrel\b/, tags: ["winery", "tastings"] },
    { pattern: /\blighthouse|coast|beach\b/, tags: ["coastal", "beach"] },
    { pattern: /\bpineapple|landmark|quirky|oddity\b/, tags: ["landmark", "quirky"] },
    { pattern: /\bbuddhist|temple|stupa\b/, tags: ["spiritual", "historic"] },
    { pattern: /\bpub\b/, tags: ["historic", "quirky"] },
  ];

  for (const rule of rules) {
    if (rule.pattern.test(haystack)) {
      for (const tag of rule.tags) tags.add(tag);
    }
  }

  if (tags.size === 0) tags.add("attraction");
  return [...tags];
}

export function extractTopicIntent(query: string): string[] {
  const lower = query.toLowerCase();
  const tags = new Set<string>();

  for (const [phrase, mapped] of Object.entries(TOPIC_ALIASES)) {
    if (lower.includes(phrase)) {
      for (const tag of mapped) tags.add(tag);
    }
  }

  return [...tags];
}

export function scoreAttractionForQuery(
  attraction: {
    name: string;
    category: string;
    description: string;
    topicTags: string[];
    rating?: number | null;
  },
  query: string,
): number {
  const haystack = `${attraction.name} ${attraction.category} ${attraction.description}`.toLowerCase();
  let score = 0;

  const topicIntent = extractTopicIntent(query);
  for (const tag of topicIntent) {
    if (attraction.topicTags.includes(tag)) score += 12;
    if (haystack.includes(tag.replace(/-/g, " "))) score += 4;
  }

  for (const word of query.toLowerCase().split(/[^a-z0-9]+/)) {
    if (word.length < 3) continue;
    if (haystack.includes(word)) score += 2;
  }

  if (typeof attraction.rating === "number") {
    score += Math.round(attraction.rating * 2);
  }

  return score;
}
