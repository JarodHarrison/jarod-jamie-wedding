import {
  adventureAttractions,
  doAttractions,
  eatAttractions,
  oddityAttractions,
  type Attraction,
} from "@/components/wedding/data/attractions";

function formatAttraction(a: Attraction): string {
  return `- **${a.title}** (${a.category}, ~${a.distance} from venue): ${a.desc}${a.websiteUrl ? ` — ${a.websiteUrl}` : ""}`;
}

export function buildLocalGuideKnowledge(): string {
  const sections = [
    { heading: "Eat & Drink (curated)", items: eatAttractions },
    { heading: "Things to Do (curated)", items: doAttractions },
    { heading: "Adventure (curated)", items: adventureAttractions },
    { heading: "Oddities & Hidden Gems (curated)", items: oddityAttractions },
  ];

  return sections
    .map((s) => `### ${s.heading}\n${s.items.map(formatAttraction).join("\n")}`)
    .join("\n\n");
}

export const LOCAL_DISCOVERY_AREA =
  "Montville, Maleny, Mapleton, Palmwoods, and the Sunshine Coast hinterland (within ~45 minutes of Spicers Clovelly Estate)";
