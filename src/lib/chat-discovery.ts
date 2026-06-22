import type { ChatMessage } from "@/lib/chat";

const LOCAL_DISCOVERY_PATTERNS = [
  /\b(restaurant|café|cafe|coffee|brunch|breakfast|lunch|dinner|eat|eating|food|drink|drinks|bar|pub|brewery|winery|dining|takeaway|take away)\b/i,
  /\b(attraction|things to do|visit|see|explore|activity|activities|hike|hiking|walk|waterfall|gallery|shop|shopping|market)\b/i,
  /\b(nearby|near me|around montville|around maleny|in montville|in maleny|hinterland|local spot|local place)\b/i,
  /\bwhere (can|should|to|do i) (i )?(eat|drink|go|visit)\b/i,
  /\b(recommend|suggestion|suggest).*(restaurant|food|eat|drink|place|spot)\b/i,
  /\b(what|any).*(open|good).*(restaurant|café|cafe|pub|bar)\b/i,
];

export function wantsLocalDiscoverySearch(messages: ChatMessage[]): boolean {
  const recentUser = messages
    .filter((m) => m.role === "user")
    .slice(-3)
    .map((m) => m.content)
    .join(" ");

  return LOCAL_DISCOVERY_PATTERNS.some((pattern) => pattern.test(recentUser));
}
