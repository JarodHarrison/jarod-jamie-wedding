import type { ChatMessage } from "@/lib/chat";

const LOCAL_DISCOVERY_PATTERNS = [
  /\b(restaurant|café|cafe|coffee|brunch|breakfast|lunch|dinner|eat|eating|food|drink|drinks|bar|pub|brewery|winery|dining|takeaway|take away)\b/i,
  /\b(attraction|things to do|visit|see|explore|activity|activities|hike|hiking|walk|waterfall|gallery|shop|shopping|market)\b/i,
  /\b(nearby|near me|around montville|around maleny|in montville|in maleny|hinterland|local spot|local place)\b/i,
  /\bwhere (can|should|to|do i) (i )?(eat|drink|go|visit)\b/i,
  /\b(recommend|suggestion|suggest).*(restaurant|food|eat|drink|place|spot)\b/i,
  /\b(what|any).*(open|good).*(restaurant|café|cafe|pub|bar)\b/i,
];

/** Needs live web results — hours, new openings, very current info. */
const LIVE_WEB_PATTERNS = [
  /\b(open now|opening hours|opening times|what time|hours|closed today|currently open|still open)\b/i,
  /\b(newly opened|new restaurant|just opened|recently opened|latest|this year|2025|2026)\b/i,
  /\b(phone number|call|book(ing)? a table|reservation|menu today)\b/i,
  /\b(search online|google it|look up|find me)\b/i,
];

function recentUserText(messages: ChatMessage[]): string {
  return messages
    .filter((m) => m.role === "user")
    .slice(-3)
    .map((m) => m.content)
    .join(" ");
}

export function isLocalDiscoveryQuestion(messages: ChatMessage[]): boolean {
  const text = recentUserText(messages);
  return LOCAL_DISCOVERY_PATTERNS.some((pattern) => pattern.test(text));
}

/** Google Search adds latency and can leak model reasoning — use only when curated picks aren't enough. */
export function wantsLocalDiscoverySearch(messages: ChatMessage[]): boolean {
  if (!isLocalDiscoveryQuestion(messages)) return false;
  const text = recentUserText(messages);
  return LIVE_WEB_PATTERNS.some((pattern) => pattern.test(text));
}
