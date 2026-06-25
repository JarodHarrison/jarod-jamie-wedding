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

export function localDiscoveryFallbackReply(): string {
  return `Honey, Montville and Maleny are absolutely eating — here's where I'd send you first:

• **Montville Artisan Village** — Main Street boutiques and famous Montville fudge (~5 min)
• **Nutworks** — chocolate making and macadamia tastings in Yandina (~35 min)
• **The Long Apron** — right at Spicers (on-site fine dining; très chic)
• **Flame Hill Vineyard** — lunch with vineyard views (~8 min)
• **Brouhaha Brewery** — craft beer and great food in Maleny (~15 min)

Ubers are scarce in the hinterland, so book transport before dinner, darling. For the full curated list, hit **Guide → Explore Montville** in the app.`;
}
