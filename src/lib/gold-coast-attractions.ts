import type { ScheduleNodeProps } from "@/components/wedding/shared/schedule-node";
import type { ScheduleBooking } from "@/types/wedding";
import { LITTLE_TRUFFLE_SAMPLE_MENU } from "@/lib/little-truffle-menu";
import type { SampleMenu } from "@/lib/little-truffle-menu";
import { getGoldCoastVenueImage, type GoldCoastVenueImageId } from "@/lib/gold-coast-images";

export type AttractionLink = {
  label: string;
  url: string;
};

export type GoldCoastAttraction = {
  id: GoldCoastVenueImageId;
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
};

export const AUSTRALIA_ZOO_ENCOUNTERS_URL =
  "https://go.australiazoo.com.au/experiences/encounters";

export const goldCoastAttractions: Record<GoldCoastVenueImageId, GoldCoastAttraction> = {
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
    intro: "Hollywood on the Gold Coast — blockbuster rides, shows, and character meet-and-greets.",
    details: [
      "Home to DC Super Heroes and Looney Tunes lands, plus some of Australia's biggest thrill rides.",
      "Expect queues in late September — Fast Track passes are worth it if you want maximum ride time.",
      "Don't miss the stunt and parade shows — they're camp, chaotic, and very fun.",
    ],
    tip: "Wear comfy shoes and sunscreen. You'll be on your feet all day.",
    booking: {
      sub: "Adult Entry | Optional Fast Track",
      price: "$109 - $208",
      btn: "Book Yourself",
      ext: true,
      url: "https://movieworld.com.au/",
    },
  },
  "little-truffle": {
    id: "little-truffle",
    calendarEventId: "gc-little-truffle",
    time: "07:00 PM",
    title: "Little Truffle",
    loc: "Mermaid Beach",
    intro:
      "Enjoy a 4-course dinner with us at Little Truffle — Mermaid Beach's award-winning hidden gem.",
    details: [
      "An intimate dining room, elegant contemporary surrounds, and an exceptional wine list.",
      "Our group booking covers a 4-course dinner; dietary needs can usually be accommodated with notice.",
      "Smart casual dress — you've earned something fabulous after Movie World.",
    ],
    sampleMenu: LITTLE_TRUFFLE_SAMPLE_MENU,
    booking: {
      sub: "4-Course Dinner",
      price: "From $89",
      btn: "Book Yourself",
      ext: true,
      url: "https://www.littletruffle.com.au/",
    },
  },
  dreamworld: {
    id: "dreamworld",
    calendarEventId: "gc-dreamworld",
    time: "10:00 AM – 5:00 PM",
    title: "Dreamworld",
    loc: "Dreamworld",
    intro: "Big thrills, DreamWorks zones, wildlife, and white-knuckle coasters in one mega park.",
    details: [
      "Ride Express passes let you skip the regular queue on participating attractions — huge time saver.",
      "Mix of family-friendly zones and serious thrill rides (Steel Taipan, Giant Drop, and more).",
      "Wildlife areas and shows break up the adrenaline if you need a breather.",
    ],
    tip: "Hydrate and pace yourself — it's a full day before Dracula's tonight.",
    booking: {
      sub: "Adult Entry | Optional Ride Express",
      price: "$139 - $269",
      btn: "Book Yourself",
      ext: true,
      url: "https://dreamworld.com.au/",
    },
  },
  draculas: {
    id: "draculas",
    calendarEventId: "gc-draculas",
    time: "07:00 PM",
    title: "Dracula's Cabaret",
    loc: "Broadbeach",
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
      price: "$149 - $155",
      btn: "Book Yourself",
      ext: true,
      url: "https://www.draculas.com.au/",
    },
  },
  "australia-zoo": {
    id: "australia-zoo",
    calendarEventId: "gc-australia-zoo",
    time: "10:00 AM",
    title: "Australia Zoo",
    loc: "Beerwah",
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
      price: "$75 - $77",
      btn: "Book Yourself",
      ext: true,
      url: "https://australiazoo.com.au/",
    },
    extraLinks: [
      {
        label: "Book Animal Encounters",
        url: AUSTRALIA_ZOO_ENCOUNTERS_URL,
      },
    ],
  },
};

export function attractionToScheduleProps(attraction: GoldCoastAttraction): ScheduleNodeProps {
  return {
    time: attraction.time,
    title: attraction.title,
    loc: attraction.loc,
    desc: attraction.intro,
    details: attraction.details,
    tip: attraction.tip,
    booking: attraction.booking,
    extraLinks: attraction.extraLinks,
    calendarEventId: attraction.calendarEventId,
    sampleMenu: attraction.sampleMenu,
    promoImage: getGoldCoastVenueImage(attraction.id),
  };
}
