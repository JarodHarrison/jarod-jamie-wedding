export type GuestTier = "PENTHOUSE" | "ON_SITE" | "OFF_SITE";

export type WeddingUser = {
  id: string;
  name: string;
  email: string;
  tier: GuestTier;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
};

export type MainTab = "home" | "itinerary" | "rsvp" | "guide" | "party";

export type SubTab =
  | "story"
  | "faq"
  | "wishingwell"
  | "travel"
  | "shuttle"
  | "photos"
  | "attractions"
  | "glowup"
  | "onsite";

export type AppTab = MainTab | SubTab | "admin";

export type ScheduleBooking = {
  sub: string;
  price: string;
  btn: string;
  ext: boolean;
  url?: string;
};

export type AdminGuest = {
  id: string;
  name: string;
  email: string;
  tier: GuestTier;
  rsvpStatus: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
  phone: string | null;
  plusOneName: string | null;
  dietaryNotes: string | null;
  songRequest: string | null;
  rsvpSubmittedAt: string | null;
  accommodationType: string | null;
  accommodationName: string | null;
  accommodationAddress: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  needsShuttle: boolean | null;
  accommodationNotes: string | null;
  accommodationSubmittedAt: string | null;
  wantsSharedTransfer: boolean | null;
  arrivalAirport: string | null;
  arrivalDate: string | null;
  arrivalTime: string | null;
  departureAirport: string | null;
  departureDate: string | null;
  departureTime: string | null;
  flightNumber: string | null;
  passengerCount: number | null;
  transferNotes: string | null;
  transferSubmittedAt: string | null;
  glowUpInterest: string | null;
  onSiteServiceInterest: string | null;
  interestsSubmittedAt: string | null;
  isAdmin?: boolean;
};

export type GuestProfile = Omit<AdminGuest, "createdAt"> & { createdAt: string };
