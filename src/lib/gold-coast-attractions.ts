import type { ScheduleNodeProps } from "@/components/wedding/shared/schedule-node";
import type { ScheduleBooking } from "@/types/wedding";
import { LITTLE_TRUFFLE_SAMPLE_MENU } from "@/lib/little-truffle-menu";
import type { SampleMenu } from "@/lib/little-truffle-menu";
import {
  getGoldCoastProduct,
  getGoldCoastStripeUrl,
  type GoldCoastStripeProductId,
} from "@/lib/gold-coast-stripe";

export type AttractionLink = {
  label: string;
  url: string;
};

export type GoldCoastAttraction = {
  id: string;
  time: string;
  title: string;
  loc?: string;
  intro: string;
  details: string[];
  tip?: string;
  booking?: ScheduleBooking;
  extraLinks?: AttractionLink[];
  calendarEventId?: string;
  sampleMenu?: SampleMenu;
  stripeProductId?: GoldCoastStripeProductId;
  promoImage?: string;
};

export const AUSTRALIA_ZOO_ENCOUNTERS_URL =
  "https://go.australiazoo.com.au/experiences/encounters";

export const goldCoastAttractions: Record<string, GoldCoastAttraction> = {
  "byron-lunch": {
    id: "byron-lunch",
    calendarEventId: "gc-byron-lunch",
    time: "11:00 AM – 1:00 PM",
    title: "Byron Bay Lunch",
    loc: "Byron Bay",
    intro: "A relaxed coastal lunch stop in one of Australia's most famous beach towns.",
    details: [
      "Wander the main street for cafés, boutiques, and ocean views before we head north again.",
      "Great spot for a proper meal after the drive down from Brisbane — think fresh, casual, and very Byron.",
    ],
  },
  skydeck: {
    id: "skydeck",
    calendarEventId: "gc-skydeck",
    time: "05:00 PM",
    title: "Q1 Skydeck",
    loc: "SkyPoint, Surfers Paradise",
    intro: "Panoramic views from the tallest building on the Gold Coast — sunset timing is chef's kiss.",
    details: [
      "Ride up to the observation deck for 360° views over the coast, hinterland, and city skyline.",
      "Late September sunset is around 5:40 PM, so you'll catch the golden hour and twilight glow.",
      "Optional Twilight Climb available if you want an open-air experience (book separately).",
    ],
    tip: "Arrive a little early — lines can build around sunset in peak season.",
    booking: {
      sub: "Deck Entry | Optional Twilight Climb",
      price: "$36 - $92",
      btn: "Book Yourself",
      ext: true,
      url: "https://skypoint.com.au/",
    },
  },
  "movie-world": {
    id: "movie-world",
    calendarEventId: "gc-movie-world",
    time: "10:00 AM – 5:00 PM",
    title: "Warner Bros. Movie World",
    loc: "Movie World",
    stripeProductId: "movie-world-fast-pass",
    intro: "Hollywood on the Gold Coast — blockbuster rides, shows, and character meet-and-greets.",
    details: [
      "Home to DC Super Heroes and Looney Tunes lands, plus some of Australia's biggest thrill rides.",
      "Add the Movie World Fast Pass and skip the queues in style — we'll organise it all for you.",
      "Spend less time waiting and more time riding, laughing, and making unforgettable memories.",
      "Don't miss the stunt and parade shows — they're camp, chaotic, and very fun.",
    ],
    tip: "Wear comfy shoes and sunscreen. You'll be on your feet all day.",
    booking: {
      sub: "Unlimited Fast Pass",
      price: "Via Stripe",
      btn: "Pay with Stripe",
      ext: false,
    },
  },
  "little-truffle": {
    id: "little-truffle",
    calendarEventId: "gc-little-truffle",
    time: "07:00 PM",
    title: "Little Truffle",
    loc: "Mermaid Beach",
    stripeProductId: "little-truffle",
    intro:
      "Enjoy a 4-course dinner with us at Little Truffle — Mermaid Beach's award-winning hidden gem.",
    details: [
      "An intimate dining room, elegant contemporary surrounds, and an exceptional wine list.",
      "Seasonal modern Australian menu — sample courses include duck liver parfait, barramundi, and dark chocolate mousse.",
      "Smart casual dress — you've earned something fabulous after Movie World.",
    ],
    sampleMenu: LITTLE_TRUFFLE_SAMPLE_MENU,
    booking: {
      sub: "4-Course Dinner",
      price: "$89.00",
      btn: "Pay with Stripe",
      ext: false,
    },
  },
  dreamworld: {
    id: "dreamworld",
    calendarEventId: "gc-dreamworld",
    time: "10:00 AM – 5:00 PM",
    title: "Dreamworld",
    loc: "Dreamworld",
    stripeProductId: "dreamworld-fast-pass",
    intro: "Big thrills, DreamWorks zones, wildlife, and white-knuckle coasters in one mega park.",
    details: [
      "Add the Dreamworld Unlimited Fast Pass and skip the regular queues on participating attractions.",
      "Mix of family-friendly zones and serious thrill rides (looking at you, Steel Taipan and Giant Drop).",
      "Wildlife areas and shows break up the adrenaline if you need a breather.",
    ],
    tip: "Hydrate and pace yourself — it's a full day before Dracula's tonight.",
    booking: {
      sub: "Unlimited Fast Pass",
      price: "Via Stripe",
      btn: "Pay with Stripe",
      ext: false,
    },
  },
  draculas: {
    id: "draculas",
    calendarEventId: "gc-draculas",
    time: "07:00 PM",
    title: "Dracula's Cabaret",
    loc: "Broadbeach",
    stripeProductId: "draculas",
    intro:
      "Join us for a wickedly fabulous evening at Dracula's — decadent dining, dazzling performances, and deliciously dark glamour.",
    details: [
      "Catch an Uber from the hotel around 6:15 PM and arrive 15 minutes before doors open.",
      "Priority entry, the ghost train ride, and a theatrical three-course dinner show with plenty of audience participation.",
      "A-Reserve VIP gets you closer to the action — dress to impress (within reason for splashes of fake blood).",
    ],
    tip: "Leave Dreamworld on time — you want time to freshen up before this one.",
    booking: {
      sub: "A-Reserve VIP",
      price: "$149.00",
      btn: "Pay with Stripe",
      ext: false,
    },
  },
  "australia-zoo": {
    id: "australia-zoo",
    calendarEventId: "gc-australia-zoo",
    time: "10:00 AM",
    title: "Australia Zoo",
    loc: "Beerwah",
    stripeProductId: "australia-zoo",
    intro:
      "Join us for a wild day at Australia Zoo — iconic wildlife, lush tropical surrounds, and unforgettable animal encounters.",
    details: [
      "The Home of the Crocodile Hunter — wildlife presentations, the Africa exhibit, Crocs Lair, and roving keepers.",
      "The drive from the Gold Coast is about two hours, so our 10 AM arrival allows for a coffee stop or traffic.",
      "Optional Animal Encounters (koala cuddles, lemurs, wombats, rhinos, and more) are booked separately from entry.",
      "Encounters are intimate, keeper-led experiences with strict group sizes — they sell out quickly.",
    ],
    tip: "If you want an encounter, book as far in advance as possible. Popular sessions disappear fast.",
    booking: {
      sub: "Adult Entry",
      price: "$79.45",
      btn: "Pay with Stripe",
      ext: false,
    },
    extraLinks: [
      {
        label: "Book Animal Encounters",
        url: AUSTRALIA_ZOO_ENCOUNTERS_URL,
      },
    ],
  },
};

function resolveStripeBooking(attraction: GoldCoastAttraction): ScheduleBooking | undefined {
  if (!attraction.booking) return undefined;

  if (attraction.stripeProductId) {
    const url = getGoldCoastStripeUrl(attraction.stripeProductId);
    if (url) {
      return { ...attraction.booking, ext: false, url, btn: "Pay with Stripe" };
    }
  }

  return attraction.booking;
}

function resolvePromoImage(attraction: GoldCoastAttraction): string | undefined {
  if (attraction.promoImage) return attraction.promoImage;
  if (attraction.stripeProductId) {
    return getGoldCoastProduct(attraction.stripeProductId).image;
  }
  return undefined;
}

export function attractionToScheduleProps(attraction: GoldCoastAttraction): ScheduleNodeProps {
  return {
    time: attraction.time,
    title: attraction.title,
    loc: attraction.loc,
    desc: attraction.intro,
    details: attraction.details,
    tip: attraction.tip,
    booking: resolveStripeBooking(attraction),
    extraLinks: attraction.extraLinks,
    calendarEventId: attraction.calendarEventId,
    sampleMenu: attraction.sampleMenu,
    promoImage: resolvePromoImage(attraction),
  };
}
