import { buildLocalGuideKnowledge, LOCAL_DISCOVERY_AREA } from "@/lib/local-guide";
import { buildInstallGuideKnowledgeForAnnita } from "@/lib/pwa/install-guide";

const WEDDING_CORE_KNOWLEDGE = `
# Jarod & Jamie Wedding — Official Information

## Basics
- Couple: Jarod and Jamie (also called J-rod and Jamie)
- Wedding date: Saturday 26 September 2026 (26.09.26)
- Venue: Spicers Clovelly Estate, Montville, Queensland (Sunshine Coast hinterland)
- Ceremony and reception are at the same venue
- Hashtag: #J-rodandJamo
- In The Booth event code: JJ260926
- Wishing well (Stripe): https://buy.stripe.com/fZudRagja2K1gzlcXD5AQ00 — digital wishing well for honeymoon contributions (Maldives, Dubai, theme parks)

## Wedding Weekend Schedule

### Friday 25 September 2026
- 6:00pm — Lakeside Meet & Greet for on-site guests only (smart casual)
- Lake View Deck welcome drinks with cheese and charcuterie platters
- Relaxed gourmet barbecue at The Long Apron restaurant
- Firepit gathering after dinner on the lakeside
- Selecting "On-site at Spicers Clovelly Estate" in accommodation preferences auto-unlocks on-site itinerary access in the app

### Saturday 26 September 2026
- 3:00pm — Ceremony at Spicers Clovelly Estate (colourful cocktail attire). Adults-only ceremony.
- 4:30pm — Garden Party on Upper Lawn (canapés, drinks, face painter, glitter bar)
- 6:00pm — Reception in The Pavilion (food, drinks, dancing)
- On-site guests: breakfast (restaurant or room service) and BBQ lunch before festivities

### Sunday 27 September 2026
- 9:00am — Family Breakfast at Spicers Clovelly Estate

## Children Policy
- Reception is adults-only
- A professional nanny will be available on-site during the reception
- Children will not be allowed at the reception dinner

## RSVP
- Late RSVPs are being accepted as there is still some space
- RSVP in the app's RSVP tab: attending/declining, phone, plus-one name, dietary requirements, song request
- By submitting RSVP, guests agree to receive wedding updates via email and SMS

## On-Site Accommodation (Spicers Clovelly Estate)
- All on-site accommodation for the wedding weekend is FULLY BOOKED
- Secured rooms: Spicers will email for payment ($500 per room, per night)
- Friday night on-site guests: Lake View Deck welcome, cheese & charcuterie, gourmet BBQ at The Long Apron, firepit after dinner; Saturday includes breakfast and BBQ lunch options

## Off-Site Accommodation (Montville Area)
- Special Expedia rates for guests:
  - 2 nights: check-in 25th, check-out 27th — https://expedia.com/affiliates/jarod_and_jamies_wedding2n/2nights
  - 1 night (wedding night 26th): https://expedia.com/affiliates/jarod_and_jamies_wedding2n/1night
- Ubers and taxis are very limited in the hinterland — pre-book transport in advance
- Submit accommodation preferences in the app (Travel & Stay tab) for shuttle planning

## Courtesy Shuttle (Montville area guests)
- Collects guests prior to ceremony
- Runs during break between ceremony and reception (good for costume changes)
- Several return trips at end of evening
- Submit accommodation details in app to help plan routes and stops

## Driving & Parking
- On-site parking available at Spicers Clovelly Estate
- If outside shuttle route, meet at a designated shuttle stop or arrange own transport

## Airports
- Sunshine Coast Airport (MCY): closest — ~35 min drive (30km) to venue
- Brisbane Airport (BNE): major hub — ~90 min drive (100km) to venue

## Getting from Brisbane Airport (BNE)
Cheapest (Airtrain + taxi):
- Airtrain from airport to Landsborough Station (~2 hours)
- Taxi/Uber from Landsborough to Montville accommodation: ~$30–$50 (15–20 min up the range)

Direct from BNE:
- Uber/rideshare: $150–$220 (drivers may decline long trips)
- Taxi: $250–$350
- Private charter/pre-booked: $250–$400+

## Getting from Sunshine Coast Airport (MCY)
- Public transport: multiple transfers, much longer — car recommended
- Uber/rideshare: $50–$80
- Taxi: $80–$110
- Private charter: $120–$180 (recommended for groups or late arrivals)

## Return Airport Transport
- Getting Uber OUT of Montville is very difficult (few local drivers)
- Pre-book return transport well in advance

## Shared Airport Transport
- Guests can register interest in sharing airport transport via the app (Travel & Stay → Flights section)
- Helps coordinate cost-sharing with other guests

## Local Transport Providers (Montville / Hinterland)
- Hinterland Transfers: 0449 549 022 — Montville-based airport, restaurant & event transfers
- MAGS Private Chauffeur: 1300 626 656 / 0414 711 804 — wedding & event transfers, pre-book essential
- Suncoast Cabs: 131 008 — book ahead for hinterland
- Queensland Chauffeurs: 0410 167 100 — private airport & hinterland transfers
`.trim();

const WEDDING_ESSENTIALS = `
# Jarod & Jamie Wedding — Essentials
- Sat 26 Sep 2026 | Spicers Clovelly Estate, Montville QLD | #J-rodandJamo
- Fri 6pm meet & greet (on-site guests, smart casual) | Sat 3pm ceremony, 4:30pm garden party, 6pm reception (colourful cocktail attire, adults-only ceremony & reception)
- Sun 9am family breakfast | Reception nanny on-site; no children at reception dinner
- RSVP in app (late RSVPs accepted) | On-site rooms fully booked | Off-site: Expedia links in Travel tab
- Montville courtesy shuttle — submit accommodation in app | Ubers/taxis limited — pre-book
- MCY ~35 min, BNE ~90 min from venue | Wishing well: Stripe link in app (Home → Wishing Well)
`.trim();

const WEDDING_PENTHOUSE_KNOWLEDGE = `
## Gold Coast Trip (Penthouse guests — pre-wedding)
Ultimate Gold Coast Experience (GCUE): all tickets included — Stripe checkout in app (Itinerary → Gold Coast Trip). Couples select quantity 2.
Penthouse stay only: $550/person via Stripe (quantity 2 for couples = $1,100)
À la carte Stripe add-ons in itinerary: Movie World Fast Pass, Dreamworld Fast Pass, Little Truffle dinner ($89), Dracula's ($149), Australia Zoo ($79.45)

### Tue 22 Sep — Byron Bay & Skydeck
- 09:00 Depart Brisbane (minivan from Pullman Brisbane Airport) — penthouse only
- 11:00–13:00 Byron Bay lunch
- 13:00 Depart Byron Bay — penthouse minivan
- 14:15 Penthouse check-in, Gold Coast — penthouse only
- 17:00 Q1 Skydeck / SkyPoint (sunset ~17:40)

### Wed 23 Sep — Movie World & Fine Dining
- 09:15 Depart hotel — penthouse minivan
- 10:00–17:00 Warner Bros. Movie World
- 17:00 Depart Movie World
- 17:45 Freshen up at hotel
- 19:00 Little Truffle dinner, Mermaid Beach ($89 4-course group booking)

### Thu 24 Sep — Dreamworld & Dracula's
- 09:15 Depart hotel — penthouse minivan
- 10:00–17:00 Dreamworld (Ride Express passes)
- 17:00 Depart Dreamworld
- 17:45 Freshen up at hotel
- 18:15 Uber to Dracula's Cabaret, Broadbeach
- 19:00 Dracula's show & dinner (A-Reserve VIP, 3-course)

### Fri 25 Sep — Australia Zoo & The Hinterland
- 07:30 Check out & depart Gold Coast — penthouse minivan
- 10:00 Australia Zoo, Beerwah (~2hr drive with coffee stop) — optional Animal Encounters book separately at go.australiazoo.com.au/experiences/encounters; book encounters as far ahead as possible (sell out fast)
- 14:30 Depart zoo
- 15:00 Arrive Spicers Clovelly Estate, Montville

Non-penthouse guests may join some Gold Coast activities but book themselves.
`.trim();

const WEDDING_LOCAL_INTRO = `
## Explore Montville / Local Guide
- App Guide tab has the full curated local guide (Eat, Do, Adventure, Oddities)
- For restaurants, cafes, pubs, wineries, attractions, and hidden gems near the wedding, use the curated list below (all within ~35 minutes of the estate) AND Google Search when available for current opening hours, menus, and newly opened spots
- Geographic focus: ${LOCAL_DISCOVERY_AREA}
- Ubers and taxis are limited in the hinterland — remind guests to pre-book transport for evening dining

## Curated Local Spots (Jarod & Jamie's picks)
`.trim();

const WEDDING_ESSENTIALS_RULES = `
- Wedding facts: use this document only — never invent. Be warm and concise.
- If unsure, point guests to the right app tab.
`.trim();

const WEDDING_TAIL_KNOWLEDGE = `
## Pre-Wedding Services (register interest in app)
- Glow Up: teeth whitening, botox pump party
- On-Site Services: hair & make-up, barber on wedding morning

## Photos
- Share photos with hashtag #J-rodandJamo on Instagram
- In The Booth app for on-site photo booth (code JJ260926)

## Dress Code
- Ceremony: colourful cocktail attire
- Meet & Greet (Friday): smart casual
- Family Breakfast (Sunday): casual (sunglasses probably required)
- Fashion inspiration links in the app's Guide → Fashion Inspiration tab:
  - Women: ASOS Design search (colourful cocktail looks)
  - Men: ASOS Design men's colourful formal/cocktail pieces
  - Feeling glam: Gentleman's Guru sequin tuxedos

## Important Notes
- For **wedding logistics** (RSVP, schedule, shuttles, dress code, children policy, accommodation): ONLY use facts from this document — do not invent times, prices, or policies
- For **local food, drink, and attractions**: combine the curated list above with Google Search results when you have them; mention that hours and availability can change and guests should confirm before visiting
- If you don't know something about the wedding itself, say so with charm and point guests to the right app tab or Jarod & Jamie
- Be warm, helpful, and concise — this is a celebratory wedding
`.trim();

export function buildWeddingKnowledge(options: {
  useEssentials?: boolean;
  includeLocalGuide?: boolean;
  includeInstallGuide?: boolean;
  includePenthouse?: boolean;
}) {
  const sections = [options.useEssentials ? WEDDING_ESSENTIALS : WEDDING_CORE_KNOWLEDGE];

  if (options.includePenthouse) {
    sections.push(WEDDING_PENTHOUSE_KNOWLEDGE);
  }

  if (options.includeLocalGuide) {
    sections.push(WEDDING_LOCAL_INTRO, buildLocalGuideKnowledge());
  }

  sections.push(options.useEssentials ? WEDDING_ESSENTIALS_RULES : WEDDING_TAIL_KNOWLEDGE);

  if (options.includeInstallGuide) {
    sections.push(buildInstallGuideKnowledgeForAnnita());
  }

  return sections.join("\n\n");
}

/** Full knowledge base — used where size is not a concern (e.g. docs). */
export const WEDDING_KNOWLEDGE = buildWeddingKnowledge({
  includeLocalGuide: true,
  includeInstallGuide: true,
  includePenthouse: true,
});

const promptCache = new Map<string, string>();

export function buildChatSystemPrompt(options: {
  guestName?: string;
  guestTier?: string;
  profileStatus?: string;
  canSaveForms?: boolean;
  useWebSearch?: boolean;
  useEssentials?: boolean;
  includeLocalGuide?: boolean;
  includeInstallGuide?: boolean;
  includePenthouse?: boolean;
}) {
  const cacheKey = JSON.stringify(options);
  const cached = promptCache.get(cacheKey);
  if (cached) return cached;

  const tierNote =
    options.guestTier === "PENTHOUSE"
      ? "This guest is a Penthouse guest with access to the full Gold Coast pre-wedding trip itinerary and minivan transport details."
      : options.guestTier === "ON_SITE"
        ? "This guest is an on-site guest staying at Spicers Clovelly Estate."
        : options.guestTier === "OFF_SITE"
          ? "This guest is an off-site guest staying in the Montville area or elsewhere."
          : "This user is an admin or guest — provide general wedding information.";

  const prompt = `You are Annita Help — sassy, warm wedding concierge for Jarod & Jamie (26 Sep 2026, Spicers Clovelly Estate, Montville QLD). Australian English, drag-queen flair (honey, darling) — never crude. Reply in 1–4 sentences unless listing picks.
- Say "minutes" (never "mins" or "min") for drive times and durations.
- For websites, use markdown links like [Website](https://example.com) — do not paste raw URLs in your reply.
${options.canSaveForms ? "- Use save_guest_form when the guest gives RSVP/accommodation/transfer details." : ""}
${options.includeInstallGuide ? "- App install: ask device, then steps from knowledge." : ""}
${options.useWebSearch ? "- Use Google Search for live local info; 2–5 picks." : options.includeLocalGuide ? "- Local eats: curated list below; 2–5 suggestions." : ""}

${options.guestName ? `Guest: ${options.guestName}` : "Guest: wedding guest"}
${tierNote}
${options.profileStatus ? `\n--- GUEST PROFILE ---\n${options.profileStatus}\n---` : ""}

--- KNOWLEDGE ---
${buildWeddingKnowledge({
  useEssentials: options.useEssentials ?? false,
  includeLocalGuide: options.includeLocalGuide ?? false,
  includeInstallGuide: options.includeInstallGuide ?? false,
  includePenthouse: options.includePenthouse ?? false,
})}
---`;

  promptCache.set(cacheKey, prompt);
  return prompt;
}
