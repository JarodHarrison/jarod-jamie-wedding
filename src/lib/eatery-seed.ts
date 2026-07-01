import type { GeoPoint } from "@/lib/guest-geo";
import { inferCuisineTags } from "@/lib/eatery-cuisine";

export type EateryRecord = {
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  cuisineTags: string[];
  description: string;
  websiteUrl?: string;
  address?: string;
  googlePlaceId?: string;
};

/** Curated seed — always available before Google Places sync runs. */
export const SEED_EATERIES: EateryRecord[] = [
  {
    name: "The Long Apron",
    latitude: -26.691,
    longitude: 152.892,
    category: "Fine Dining",
    cuisineTags: inferCuisineTags({ name: "The Long Apron", category: "Fine Dining", description: "French-inspired hatted fine dining at Spicers" }),
    description: "French-inspired, hatted fine dining right at Spicers Clovelly Estate.",
    websiteUrl: "https://spicersretreats.com/restaurants/the-long-apron/",
  },
  {
    name: "Flame Hill Vineyard",
    latitude: -26.701,
    longitude: 152.875,
    category: "Winery & Dining",
    cuisineTags: inferCuisineTags({ name: "Flame Hill Vineyard", category: "Winery & Dining" }),
    description: "Wine tasting and relaxed lunch overlooking the vines with coast views.",
    websiteUrl: "https://www.flamehill.com.au/",
  },
  {
    name: "Brouhaha Brewery",
    latitude: -26.758,
    longitude: 152.852,
    category: "Craft Beer & Kitchen",
    cuisineTags: inferCuisineTags({ name: "Brouhaha Brewery", category: "Craft Beer" }),
    description: "Independent brewery with excellent craft beers and a locally-sourced menu.",
    websiteUrl: "https://brouhahabrewery.com.au/",
  },
  {
    name: "Mapleton Public House",
    latitude: -26.631,
    longitude: 152.863,
    category: "Pub & Local Fare",
    cuisineTags: inferCuisineTags({ name: "Mapleton Public House", category: "Pub" }),
    description: "Historic hinterland pub with paddock-to-plate meals and valley views.",
    websiteUrl: "https://mapletonpublichouse.com.au/",
  },
  {
    name: "Spirit House",
    latitude: -26.561,
    longitude: 152.959,
    category: "Asian Fusion",
    cuisineTags: inferCuisineTags({ name: "Spirit House", category: "Asian Fusion" }),
    description: "Award-winning contemporary Asian cuisine in tropical gardens around a tranquil pond.",
    websiteUrl: "https://www.spirithouse.com.au/",
  },
  {
    name: "The Tamarind",
    latitude: -26.758,
    longitude: 152.848,
    category: "Modern Asian",
    cuisineTags: inferCuisineTags({ name: "The Tamarind", category: "Modern Asian" }),
    description: "Hatted Spicers restaurant in Maleny — sweet, sour, and spicy Pan-Asian flavours.",
    websiteUrl: "https://spicersretreats.com/restaurants/the-tamarind/",
  },
  {
    name: "Rick's Garage",
    latitude: -26.689,
    longitude: 152.961,
    category: "Retro Diner",
    cuisineTags: inferCuisineTags({ name: "Rick's Garage", category: "Retro Diner", description: "giant burgers milkshakes" }),
    description: "Famous retro diner in Palmwoods — giant burgers, milkshakes, and rockabilly vibes.",
    websiteUrl: "https://www.ricksgarage.com.au/",
  },
  {
    name: "Secrets on the Lake",
    latitude: -26.672,
    longitude: 152.916,
    category: "Cafe & Views",
    cuisineTags: inferCuisineTags({ name: "Secrets on the Lake", category: "Cafe" }),
    description: "Carved-wood treehouse cafe overlooking Lake Baroon.",
    websiteUrl: "https://www.secretsonthelake.com.au/cafe/",
  },
  {
    name: "Maleny Cheese",
    latitude: -26.758,
    longitude: 152.855,
    category: "Cheese & Tastings",
    cuisineTags: inferCuisineTags({ name: "Maleny Cheese", category: "Cheese Tastings" }),
    description: "Local cheeses and yoghurts with tasting boards overlooking dairy pastures.",
    websiteUrl: "https://www.malenycheese.com.au/",
  },
  {
    name: "Tiffany's Maleny",
    latitude: -26.758,
    longitude: 152.85,
    category: "Local Hampers & Cafe",
    cuisineTags: inferCuisineTags({ name: "Tiffany's Maleny", category: "Cafe Hampers" }),
    description: "Hampers and light bites from local ingredients with Glass House Mountain views.",
    websiteUrl: "https://www.tiffanysmaleny.com.au/",
  },
  {
    name: "The Edge Restaurant Montville",
    latitude: -26.696,
    longitude: 152.881,
    category: "Restaurant",
    cuisineTags: inferCuisineTags({ name: "The Edge Restaurant Montville", category: "Restaurant", description: "modern australian" }),
    description: "Modern Australian dining on Montville Main Street with hinterland views.",
    websiteUrl: "https://www.theedgemontville.com.au/",
  },
  {
    name: "Monsieur Pâtisserie",
    latitude: -26.696,
    longitude: 152.882,
    category: "French Bakery & Cafe",
    cuisineTags: inferCuisineTags({ name: "Monsieur Pâtisserie", category: "French Bakery Cafe" }),
    description: "French pastries, cakes, and coffee on Montville Main Street.",
    websiteUrl: "https://www.monsieurpatisserie.com.au/",
  },
  {
    name: "The Barn Maleny",
    latitude: -26.758,
    longitude: 152.851,
    category: "Restaurant & Bar",
    cuisineTags: inferCuisineTags({ name: "The Barn Maleny", category: "Restaurant Bar" }),
    description: "Relaxed restaurant and bar in the heart of Maleny.",
    websiteUrl: "https://thebarnmaleny.com.au/",
  },
  {
    name: "Fish on Parkyn",
    latitude: -26.682,
    longitude: 153.118,
    category: "Seafood",
    cuisineTags: inferCuisineTags({ name: "Fish on Parkyn", category: "Seafood fish and chips" }),
    description: "Fresh seafood and fish and chips on the Mooloolaba waterfront.",
    websiteUrl: "https://www.fishonparkyn.com.au/",
  },
  {
    name: "Taps Mooloolaba",
    latitude: -26.682,
    longitude: 153.119,
    category: "Pub & Pizza",
    cuisineTags: inferCuisineTags({ name: "Taps Mooloolaba", category: "Pub Pizza" }),
    description: "Waterfront pub with pizza, burgers, and craft beer on the Esplanade.",
    websiteUrl: "https://www.tapsmooloolaba.com.au/",
  },
  {
    name: "El Camino Cantina Maroochydore",
    latitude: -26.65,
    longitude: 153.091,
    category: "Mexican",
    cuisineTags: inferCuisineTags({ name: "El Camino Cantina", category: "Mexican tacos" }),
    description: "Tex-Mex, tacos, and margaritas at Sunshine Plaza.",
    websiteUrl: "https://elcaminocantina.com.au/",
  },
  {
    name: "Kenilworth Country Bakery",
    latitude: -26.604,
    longitude: 152.864,
    category: "Bakery",
    cuisineTags: inferCuisineTags({ name: "Kenilworth Country Bakery", category: "Bakery" }),
    description: "Famous pies, pastries, and coffee in Kenilworth.",
    websiteUrl: "https://kenilworthcountrybakery.com.au/",
  },
  {
    name: "The Banana Bender Pub",
    latitude: -26.561,
    longitude: 152.959,
    category: "Pub",
    cuisineTags: inferCuisineTags({ name: "Banana Bender Pub", category: "Pub" }),
    description: "Classic Queensland pub meals and cold beer in Yandina.",
    websiteUrl: "https://thebananabenderpub.com/",
  },
  {
    name: "Clouds Vineyard",
    latitude: -26.696,
    longitude: 152.878,
    category: "Winery & Dining",
    cuisineTags: inferCuisineTags({ name: "Clouds Vineyard", category: "Winery" }),
    description: "Boutique winery with lunch and valley views near Montville.",
    websiteUrl: "https://cloudsvineyard.com.au/",
  },
  {
    name: "Pomodoras on Obi",
    latitude: -26.758,
    longitude: 152.853,
    category: "Italian & Pizza",
    cuisineTags: inferCuisineTags({ name: "Pomodoras on Obi", category: "Italian Pizza" }),
    description: "Wood-fired pizza and Italian classics on the Obi Obi Creek in Maleny.",
    websiteUrl: "https://www.pomodorasonobi.com.au/",
  },
];

export const EATERY_RADIUS_KM = 20;

export const DEFAULT_EAT_PICKS = ["The Long Apron", "Flame Hill Vineyard", "Brouhaha Brewery"];

export function eateryToGeo(eatery: Pick<EateryRecord, "latitude" | "longitude">): GeoPoint {
  return { latitude: eatery.latitude, longitude: eatery.longitude };
}
