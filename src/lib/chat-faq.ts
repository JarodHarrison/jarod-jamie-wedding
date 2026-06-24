import type { ChatMessage } from "@/lib/chat";

type FaqEntry = {
  patterns: RegExp[];
  reply: string;
};

/** Instant answers for common wedding FAQs — skips Gemini entirely (<50ms). */
const INSTANT_FAQ: FaqEntry[] = [
  {
    patterns: [
      /\b(what time|when).*(ceremony|wedding)\b/i,
      /\bceremony\b.*\b(time|start|when|kick)\b/i,
      /\bwedding\b.*\b(time|start)\b/i,
    ],
    reply:
      "The main event, darling! Ceremony is **3:00pm** on Saturday 26 September 2026 at Spicers Clovelly Estate. Colourful cocktail attire — and the ceremony is adults-only, honey.",
  },
  {
    patterns: [
      /\b(what time|when).*(reception|dinner|party)\b/i,
      /\breception\b.*\b(time|start|when)\b/i,
    ],
    reply:
      "Reception kicks off at **6:00pm** in The Pavilion, babe — food, drinks, and dancing after the garden party. Adults-only for the reception dinner.",
  },
  {
    patterns: [/\bgarden party\b/i, /\b(what time|when).*(garden|canap[eé])\b/i],
    reply:
      "Garden Party is **4:30pm** on the Upper Lawn after the ceremony — canapés, drinks, face painter, and glitter bar. Fabulous.",
  },
  {
    patterns: [
      /\b(when|what date).*(wedding|marry|married|big day)\b/i,
      /\bwedding date\b/i,
      /\bdate of the wedding\b/i,
    ],
    reply:
      "Mark your calendar, honey: **Saturday 26 September 2026** at Spicers Clovelly Estate, Montville QLD. Hashtag **#J-rodandJamo**.",
  },
  {
    patterns: [
      /\b(where|venue|location).*(wedding|ceremony|reception|held)\b/i,
      /\b(where is|what venue|what's the venue)\b/i,
      /\bspicers\b/i,
    ],
    reply:
      "Spicers Clovelly Estate in **Montville, Queensland** — Sunshine Coast hinterland. Ceremony and reception are both there, darling.",
  },
  {
    patterns: [/\bdress code\b/i, /\bwhat (should|do) i wear\b/i, /\bwhat to wear\b/i],
    reply:
      "Ceremony: **colourful cocktail attire**. Friday meet & greet: smart casual. Sunday breakfast: casual (sunnies essential). Check **Guide → Fashion Inspiration** in the app for inspo.",
  },
  {
    patterns: [/\b(children|kids|babies|child policy)\b/i, /\bcan i bring\b.*\b(kids|children)\b/i],
    reply:
      "Reception is **adults-only**, honey — a professional nanny will be on-site during the reception, but little ones won't be at the dinner itself.",
  },
  {
    patterns: [/\brsvp\b/i, /\bhow (do|can) i (rsvp|respond)\b/i],
    reply:
      "RSVP in the app's **RSVP tab** — attending, phone, plus-one, dietary, song request. Late RSVPs are still being accepted if there's space, babe.",
  },
  {
    patterns: [/\bhashtag\b/i, /\b#j-rod/i],
    reply: "Share the love with **#J-rodandJamo** on Instagram, darling.",
  },
  {
    patterns: [/\b(friday|meet.?&.?greet|welcome drinks)\b/i],
    reply:
      "Friday **6:00pm** Lakeside Meet & Greet for **on-site guests** — smart casual, welcome drinks, cheese & charcuterie, gourmet BBQ, then firepit. On-site only.",
  },
  {
    patterns: [/\b(sunday|family breakfast)\b/i],
    reply: "Sunday **9:00am** Family Breakfast at Spicers Clovelly Estate. Casual — sunglasses probably required.",
  },
  {
    patterns: [/\bshuttle\b/i, /\bcourtesy (bus|transport)\b/i],
    reply:
      "Courtesy shuttle for Montville-area guests — collects before ceremony, runs during the ceremony/reception break, and several return trips at night. Submit your accommodation in the app so we can plan stops, honey.",
  },
  {
    patterns: [/\bon[- ]site\b.*\b(room|accommodation|book)\b/i, /\brooms?\b.*\b(spicers|on[- ]site)\b/i],
    reply:
      "On-site accommodation at Spicers is **fully booked** for the wedding weekend, darling. Off-site guests can use the Expedia links in the app's **Travel & Stay** tab.",
  },
  {
    patterns: [/\b(parking|park)\b/i],
    reply: "On-site parking is available at Spicers Clovelly Estate. If you're outside the shuttle route, check the app for designated shuttle stops.",
  },
  {
    patterns: [/\b(mcy|sunshine coast airport)\b/i],
    reply:
      "Sunshine Coast Airport (MCY) is closest — about **35 minutes** (~30km) to the venue. Uber/rideshare roughly $50–$80; pre-book return transport from Montville.",
  },
  {
    patterns: [/\b(bne|brisbane airport)\b/i],
    reply:
      "Brisbane Airport (BNE) is about **90 minutes** (~100km) from the venue. Cheapest route is Airtrain to Landsborough + taxi up the range; direct Uber/taxi $150–$350+. Pre-book return trips — Ubers out of Montville are scarce.",
  },
  {
    patterns: [/\bwishing well\b/i, /\bgift\b/i, /\bpresent\b/i],
    reply:
      "Wishing well: **pocketwell.com.au/events/jarod-and-jamie** — your presence is the present, but we won't say no to a little envelope love, honey.",
  },
];

export function matchInstantFaq(messages: ChatMessage[]): string | null {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const text = lastUser?.content.trim() ?? "";
  if (!text || text.length > 240) return null;

  for (const entry of INSTANT_FAQ) {
    if (entry.patterns.some((pattern) => pattern.test(text))) {
      return entry.reply;
    }
  }

  return null;
}
