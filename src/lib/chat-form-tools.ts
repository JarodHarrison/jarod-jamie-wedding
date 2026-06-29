import {
  guestProfileSelect,
  isGuestProfileSection,
  serializeGuestProfile,
  type GuestProfileSection,
  type SerializedGuestProfile,
} from "@/lib/guest-profile";
import { buildGuestProfileSectionUpdate } from "@/lib/guest-profile-update";
import { mergeFormPayload } from "@/lib/guest-profile-checklist";
import { notifyRegistration } from "@/lib/registration-notify";
import { prisma } from "@/lib/prisma";

export const GUEST_FORM_TOOL = {
  functionDeclarations: [
    {
      name: "save_guest_form",
      description:
        "Save the guest's wedding form data when they clearly want to submit or update RSVP, accommodation, airport transfer, or guide service interests. Only call when you have enough information to save, or when merging with their existing profile fills required fields. Always confirm what you saved.",
      parameters: {
        type: "object",
        properties: {
          section: {
            type: "string",
            enum: ["rsvp", "accommodation", "transfer", "interests"],
            description: "Which form section to update.",
          },
          attending: {
            type: "string",
            enum: ["ACCEPTED", "DECLINED"],
            description: "RSVP: whether the guest is attending.",
          },
          phone: { type: "string", description: "RSVP: contact phone number." },
          plusOneName: { type: "string", description: "RSVP: plus-one guest name if bringing someone." },
          dietaryNotes: { type: "string", description: "RSVP: dietary requirements or allergies." },
          songRequest: { type: "string", description: "RSVP: song request for the DJ." },
          accommodationType: {
            type: "string",
            enum: ["ON_SITE", "MONTVILLE", "OTHER"],
            description: "Accommodation: ON_SITE, MONTVILLE area, or OTHER.",
          },
          accommodationName: { type: "string", description: "Accommodation: hotel or property name." },
          accommodationAddress: { type: "string", description: "Accommodation: full address." },
          checkInDate: { type: "string", description: "Accommodation: check-in date (YYYY-MM-DD)." },
          checkOutDate: { type: "string", description: "Accommodation: check-out date (YYYY-MM-DD)." },
          needsShuttle: {
            type: "boolean",
            description: "Accommodation: whether they need the courtesy wedding shuttle.",
          },
          accommodationNotes: { type: "string", description: "Accommodation: extra notes." },
          wantsSharedTransfer: {
            type: "boolean",
            description: "Transfer: interested in sharing airport transport with other guests.",
          },
          shareTransferContactDetails: {
            type: "boolean",
            description:
              "Transfer: guest consents to sharing email/phone with a matched travel buddy when both agree.",
          },
          arrivalMaxWait: {
            type: "string",
            description:
              "Transfer: max wait after landing for travel buddy matching (30, 60, 90, 120, 120_plus).",
          },
          arrivalAirport: {
            type: "string",
            enum: ["MCY", "BNE", ""],
            description: "Transfer: arrival airport code.",
          },
          arrivalDate: { type: "string", description: "Transfer: arrival date (YYYY-MM-DD)." },
          arrivalTime: { type: "string", description: "Transfer: arrival time (HH:MM)." },
          departureAirport: {
            type: "string",
            enum: ["MCY", "BNE", ""],
            description: "Transfer: departure airport code.",
          },
          departureDate: { type: "string", description: "Transfer: departure date (YYYY-MM-DD)." },
          departureTime: { type: "string", description: "Transfer: departure time (HH:MM)." },
          flightNumber: { type: "string", description: "Transfer: flight number." },
          passengerCount: { type: "number", description: "Transfer: number of passengers." },
          transferNotes: { type: "string", description: "Transfer: extra notes." },
          glowUpInterest: {
            type: "string",
            enum: ["teeth", "botox", "both", ""],
            description: "Interests: pre-wedding glow-up (teeth whitening / botox party).",
          },
          onSiteServiceInterest: {
            type: "string",
            enum: ["hair", "barber", "both", ""],
            description: "Interests: on-site hair & makeup or barber.",
          },
        },
        required: ["section"],
      },
    },
  ],
};

type FormSaveResult = {
  success: boolean;
  message: string;
  profile?: SerializedGuestProfile;
};

export async function executeGuestFormSave(
  guestId: string,
  args: Record<string, unknown>,
): Promise<FormSaveResult> {
  const section = args.section as string;
  if (!isGuestProfileSection(section)) {
    return { success: false, message: "Invalid form section." };
  }

  const existing = await prisma.guest.findUnique({
    where: { id: guestId },
    select: guestProfileSelect,
  });

  if (!existing) {
    return { success: false, message: "Guest profile not found." };
  }

  const serialized = serializeGuestProfile(existing);
  const payload = mergeFormPayload(section as GuestProfileSection, args, serialized);

  if (section === "rsvp" && payload.attending !== "ACCEPTED" && payload.attending !== "DECLINED") {
    return {
      success: false,
      message:
        "RSVP needs a clear yes or no — ask if they joyfully accept or regretfully decline before saving.",
    };
  }

  const result = buildGuestProfileSectionUpdate(section as GuestProfileSection, payload);
  if (!result.ok) {
    return { success: false, message: result.error };
  }

  const guest = await prisma.guest.update({
    where: { id: guestId },
    data: result.data,
    select: guestProfileSelect,
  });

  const profile = serializeGuestProfile(guest);
  notifyRegistration(section, profile);

  const labels: Record<GuestProfileSection, string> = {
    rsvp: "RSVP",
    accommodation: "accommodation details",
    transfer: "airport transfer details",
    interests: "service interests",
    "gift-colours": "gift colour preferences",
    identity: "guest profile details",
    companion: "plus-one details",
  };

  return {
    success: true,
    message: `Saved ${labels[section]} successfully.`,
    profile,
  };
}
