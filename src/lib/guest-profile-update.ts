import type { RsvpStatus } from "@prisma/client";
import type { GuestProfileSection } from "@/lib/guest-profile";

export type ProfileUpdateResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: string; status: number };

function trimOrNull(value: unknown) {
  const trimmed = (value ?? "").toString().trim();
  return trimmed || null;
}

export function buildGuestProfileSectionUpdate(
  section: GuestProfileSection,
  body: Record<string, unknown>,
  options?: { isAdmin?: boolean },
): ProfileUpdateResult {
  const now = new Date();
  const isAdmin = options?.isAdmin ?? false;

  if (section === "rsvp") {
    const attending = body.attending as string | undefined;
    if (attending !== "ACCEPTED" && attending !== "DECLINED") {
      return { ok: false, error: "Please select whether the guest is attending.", status: 400 };
    }

    return {
      ok: true,
      data: {
        phone: trimOrNull(body.phone),
        plusOneName: trimOrNull(body.plusOneName),
        dietaryNotes: trimOrNull(body.dietaryNotes),
        songRequest: trimOrNull(body.songRequest),
        rsvpStatus: attending as RsvpStatus,
        rsvpSubmittedAt: now,
      },
    };
  }

  if (section === "accommodation") {
    const accommodationType = trimOrNull(body.accommodationType);
    if (!accommodationType) {
      return { ok: false, error: "Please select where the guest is staying.", status: 400 };
    }

    return {
      ok: true,
      data: {
        accommodationType,
        accommodationName: trimOrNull(body.accommodationName),
        accommodationAddress: trimOrNull(body.accommodationAddress),
        checkInDate: trimOrNull(body.checkInDate),
        checkOutDate: trimOrNull(body.checkOutDate),
        needsShuttle: body.needsShuttle === true,
        accommodationNotes: trimOrNull(body.accommodationNotes),
        accommodationSubmittedAt: now,
      },
    };
  }

  if (section === "transfer") {
    return {
      ok: true,
      data: {
        wantsSharedTransfer: body.wantsSharedTransfer === true,
        arrivalAirport: trimOrNull(body.arrivalAirport),
        arrivalDate: trimOrNull(body.arrivalDate),
        arrivalTime: trimOrNull(body.arrivalTime),
        departureAirport: trimOrNull(body.departureAirport),
        departureDate: trimOrNull(body.departureDate),
        departureTime: trimOrNull(body.departureTime),
        flightNumber: trimOrNull(body.flightNumber),
        passengerCount:
          body.passengerCount === null || body.passengerCount === ""
            ? null
            : Number(body.passengerCount),
        transferNotes: trimOrNull(body.transferNotes),
        transferSubmittedAt: now,
      },
    };
  }

  if (section === "interests") {
    if (isAdmin) {
      const glowUpInterest = trimOrNull(body.glowUpInterest);
      const onSiteServiceInterest = trimOrNull(body.onSiteServiceInterest);

      return {
        ok: true,
        data: {
          glowUpInterest,
          onSiteServiceInterest,
          interestsSubmittedAt: glowUpInterest || onSiteServiceInterest ? now : null,
        },
      };
    }

    const data: Record<string, unknown> = {
      interestsSubmittedAt: now,
    };

    if (body.glowUpInterest) data.glowUpInterest = body.glowUpInterest as string;
    if (body.onSiteServiceInterest) data.onSiteServiceInterest = body.onSiteServiceInterest as string;

    if (!data.glowUpInterest && !data.onSiteServiceInterest) {
      return { ok: false, error: "No interest data provided.", status: 400 };
    }

    return { ok: true, data };
  }

  return { ok: false, error: "Invalid form section.", status: 400 };
}
