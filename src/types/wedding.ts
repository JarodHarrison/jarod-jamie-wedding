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

export type MainTab = "home" | "jarodjamie" | "itinerary" | "guide" | "party" | "profile" | "rsvp";

export type SubTab =
  | "story"
  | "rsvp"
  | "faq"
  | "wishingwell"
  | "travel"
  | "shuttle"
  | "photos"
  | "bingo"
  | "attractions"
  | "fashion"
  | "glowup"
  | "onsite";

export type AppTab = MainTab | SubTab | "admin" | "vendors";

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
  plusOneGuestId: string | null;
  plusOneGuest: {
    id: string;
    name: string;
    email: string;
    hasProfilePhoto: boolean;
    photoUrl: string | null;
  } | null;
  hasCompanionPhoto: boolean;
  partyRole: "BEST_BITCH" | null;
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
  assignedRoomName: string | null;
  assignedRoomDetails: string | null;
  assignedRoomCheckIn: string | null;
  assignedRoomCheckOut: string | null;
  assignedRoomConfiguration: string | null;
  roomAllocationImportedAt: string | null;
  bedPreference: string | null;
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
  profilePhotoMime: string | null;
  companionPhotoMime: string | null;
  guestOfHost: string | null;
  guestRelationship: string | null;
  guestRelationshipNote: string | null;
  profileUpdatedAt: string | null;
  mailingAddress: string | null;
  sayiPartyName: string | null;
  sayiLink: string | null;
  sayiPlusOneAllowed: boolean | null;
  sayiImportedAt: string | null;
  sayiCustomData: Record<string, string> | null;
  hasProfilePhoto: boolean;
  passwordPlaintext: string | null;
  isAdmin?: boolean;
};

export type GuestProfile = Omit<AdminGuest, "createdAt" | "passwordPlaintext" | "isAdmin"> & {
  createdAt: string;
};

export type Vendor = {
  id: string;
  name: string;
  category: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  notes: string | null;
  sortOrder: number;
  documentName: string | null;
  documentMime: string | null;
  hasDocument: boolean;
  createdAt: string;
  updatedAt: string;
};
