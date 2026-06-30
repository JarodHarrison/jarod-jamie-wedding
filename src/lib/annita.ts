export const ANNITA_DISGUSTED_LOADING_MESSAGES = [
  "Excuse me??",
  "I just gagged on my gloss…",
  "Not in this chat, honey…",
  "Clutching my pearls AND my stomach…",
  "Ma'am. Sir. Whichever. No.",
  "I need a lavender moment…",
  "That just walked right over my last nerve…",
  "Wiping that from my memory…",
] as const;

export const ANNITA_LOADING_MESSAGES = [
  "Touching up my lashes…",
  "Consulting the glitter oracle…",
  "Fanning myself while I think…",
  "Re-reading the seating chart drama…",
  "Asking the DJ if your song slaps…",
  "Channeling my inner wedding planner…",
  "Glossing my lips for this answer…",
  "Running it past Jarod & Jamie's vibe check…",
  "Checking if the shuttle's on glam time…",
  "Spritzing setting spray on this response…",
  "Dramatically pausing for effect…",
  "Whispering to the hinterland…",
  "Googling whether Montville is fabulous — spoiler: yes…",
  "Adjusting my neckline while I type…",
  "Holding for the runway moment…",
  "Shaking my head at incomplete RSVPs…",
  "Blessing your question with pink light…",
  "Serving facts with a side of sparkle…",
  "One sec — my earrings are thinking…",
  "Polishing this answer to a mirror shine…",
  "Doing a quick hair flip…",
  "Tucking a loose fact back into place…",
  "Checking the dress code — colourful, honey…",
  "Mentally boarding the courtesy bus…",
  "Stirring the bridal tea…",
  "Laying out options like outfit choices…",
  "Contouring this response for clarity…",
  "Asking Maleny if it has reservations…",
  "Waiting for the Wi-Fi to werk…",
  "Summoning the spirits of RSVP past…",
  "Warming up my chai and my wit…",
  "Applying one more coat of confidence…",
  "Walking the runway to your answer…",
  "Fact-checking so nobody side-eyes me…",
  "Lace front secured — almost ready…",
  "Making sure I don't gatekeep the shuttle times…",
  "Elevating this reply three inches…",
  "Clutching my pearls — in a good way…",
  "Almost there, don't you dare refresh…",
  "Final spray of fabulous coming up…",
] as const;

export const ANNITA_INPUT_PLACEHOLDERS = [
  "Spill the tea, darling…",
  "What's the goss, honey?",
  "Ask me anything, gorgeous…",
  "Your wish is my command, babe…",
  "Type your drama here…",
  "Serve me a question, queen…",
  "What do you need, superstar?",
  "Darling, I'm all ears (and lashes)…",
  "Unload on me, sweetheart…",
  "Hit me with your best shot…",
  "What's keeping you up — besides excitement?",
  "Tell Auntie Annita everything…",
  "I've got answers and opinions…",
  "What's the sitch, icon?",
  "Confess your wedding worries here…",
  "Shoot — shuttles, snacks, sequins?",
  "Need venue vibes or outfit tips?",
  "Whisper your RSVP secrets…",
  "Questions? I've got shade and sunshine…",
  "Don't be shy — I don't bite (much)…",
  "Montville mysteries? Ask away…",
  "What can I fix for you, love?",
  "Type like nobody's watching…",
  "Got a plus-one plot twist?",
  "Airport chaos? Let's untangle it…",
  "Dietary drama? Bring it…",
  "Song request energy only…",
  "Accommodation tea goes here…",
  "Where should we send the bus, babe?",
  "Is this a fashion emergency?",
  "Pitch me your hinterland plans…",
  "Need a restaurant rec? Say less…",
  "Ceremony questions welcome…",
  "Still deciding what to wear? Same…",
  "Glow-up inquiries accepted…",
  "Help me help you look fabulous…",
  "One message from clarity, honey…",
  "What's on your wedding mind?",
  "I'm live — werk your question in…",
  "Ask like you mean it, darling…",
] as const;

export function pickAnnitaLine<T extends readonly string[]>(lines: T): T[number] {
  return lines[Math.floor(Math.random() * lines.length)]!;
}

export function fillAnnitaLine(template: string, label: string): string {
  return template.replaceAll("{label}", label);
}

/** Shown in chat when GPS is on and the guest is in-region. */
export const ANNITA_GPS_LOCATION_LINES = [
  "I've got your location, honey — drive times are from *you*, not the venue fantasy.",
  "GPS is werk-ing, darling — these distances start where you're standing.",
  "I see you on the map, babe — I'm not guessing from Spicers.",
  "Location: served. Distances: personal. You're welcome, icon.",
  "Your phone told me where you are — I'll do the maths from there.",
] as const;

export const ANNITA_EAT_OPENERS_GPS = [
  "Hungry on the Coast? These three are giving *chef's kiss* — I clocked **{label}** and did the maths:",
  "Darling, dinner realness from **{label}** — three spots that eat, zero crumbs:",
  "Honey, I'm not sending you to a random servo — from **{label}**, eat here:",
  "Babe, the range is serving — three picks from **{label}** that actually slap:",
] as const;

export const ANNITA_EAT_OPENERS_STAY = [
  "If your stomach's doing choreography, start here from **{label}**:",
  "From **{label}**, these three are the hinterland holy trinity of yum:",
  "Honey, based on **{label}**, I'd Uber to one of these and look fabulous:",
  "Darling, **{label}** → dinner — my top three, no gatekeeping:",
] as const;

export const ANNITA_EAT_OPENERS_SPICERS = [
  "You're not on the mountain yet, sweetheart — picture yourself at **Spicers** and eat here:",
  "Pre-trip? Fine. Once you're at **Spicers Clovelly Estate**, these three are the move:",
  "Darling, distances below are from **Spicers** — save them for wedding weekend hunger:",
  "Honey, file these under *when I'm at the estate* — all from **Spicers Clovelly Estate**:",
] as const;

export const ANNITA_EAT_CLOSERS = [
  "Ubers up the range are thinner than my patience — book a ride if you're dining out, babe.",
  "Pre-book transport, honey — the hinterland is stunning and Uber-shy.",
  "Grab a lift if you're going far — glamour shouldn't include hitchhiking in heels.",
  "More recs live in **Guide → Explore Montville** if you're still peckish, darling.",
] as const;

export const ANNITA_LOCAL_OPENERS = {
  chocolate: [
    "Artisanal treats near Montville, honey — my chocolate era starts here:",
    "Sweet tooth emergency? Darling, the hinterland delivers:",
  ],
  fromGuest: [
    "For that hinterland craving from **{label}** — werk:",
    "Darling, from **{label}**, these picks slap:",
  ],
  spicers: [
    "Not on the mountain yet? From **Spicers Clovelly Estate**, I'd start here:",
    "Honey, estate-adjacent fabulousness — distances from **Spicers**:",
  ],
} as const;

export const ANNITA = {
  name: "Annita Help",
  tagline: "Your fabulous wedding concierge",
  avatarSrc: "/annita-help.png",
  thinkingAvatarSrc: "/annita-thinking.png",
  disgustedAvatarSrc: "/annita-disgusted.png",
  welcomeMessage:
    "Hey gorgeous — I'm Annita Help, your sassy wedding concierge for Jarod & Jamie's big day. Ask me about the schedule, travel, shuttles, dress code, or where to stay — I can scout nearby spots too, and help you complete your RSVP and travel forms right here in chat.",
  starters: [
    "What time is the ceremony, darling?",
    "How do I get from Brisbane Airport?",
    "How do I install this app on my phone?",
    "What restaurants are near Montville?",
  ],
  bubbleBg: "#fdf2f8",
  bubbleBorder: "#fbcfe8",
  accent: "#ec4899",
} as const;
