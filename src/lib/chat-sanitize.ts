const META_LINE_PATTERNS = [
  /^\d+\.\s*\*{0,2}.*(?:constraints?|checklist|review against|self[- ]?check|verification|quality check)/i,
  /^\*{0,2}Review against constraints\*{0,2}/i,
  /^Concise\?\s*(Yes|No)/i,
  /^\*{0,2}(?:Planning|Reasoning|Draft|Internal notes?):?\*{0,2}\s*$/i,
  /^-\s*(?:Concise|Accurate|Helpful|On-brand|Well-structured)\?\s/i,
  /^\*{0,2}Final answer:?\*{0,2}\s*$/i,
];

export function isMetaLeakReply(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (/review against constraints/i.test(trimmed)) return true;
  if (/concise\?\s*yes/i.test(trimmed) && trimmed.length < 280) return true;
  if (/^\d+\.\s*\*\*/.test(trimmed) && !trimmed.includes("\n") && trimmed.length < 220) return true;
  return false;
}

export function sanitizeChatReply(text: string): string {
  const lines = text.split("\n");
  const filtered = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return true;
    return !META_LINE_PATTERNS.some((pattern) => pattern.test(trimmed));
  });

  return filtered
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

import {
  adventureAttractions,
  doAttractions,
  eatAttractions,
  oddityAttractions,
} from "@/components/wedding/data/attractions";
import {
  enrichPlaceFromAttraction,
  formatPlaceForChat,
} from "@/lib/hinterland-places";
import { pickAnnitaLine, ANNITA_EAT_CLOSERS } from "@/lib/annita";

const FALLBACK_ATTRACTION_TITLES = [
  "Montville Artisan Village",
  "Nutworks",
  "The Long Apron",
  "Flame Hill Vineyard",
  "Brouhaha Brewery",
];

function fallbackAttractionLines(): string {
  const all = [...eatAttractions, ...doAttractions, ...adventureAttractions, ...oddityAttractions];
  return FALLBACK_ATTRACTION_TITLES.map((title) => {
    const attraction = all.find((item) => item.title === title);
    if (!attraction) return null;
    return formatPlaceForChat(enrichPlaceFromAttraction(attraction));
  })
    .filter(Boolean)
    .join("\n");
}

export function localDiscoveryFallbackReply(): string {
  return `Honey, Montville and Maleny are absolutely eating — here's where I'd send you first:

${fallbackAttractionLines()}

${pickAnnitaLine(ANNITA_EAT_CLOSERS)}

For the full curated list, hit **Guide → Explore Montville** in the app.`;
}
