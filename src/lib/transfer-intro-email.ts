import { sendEmail } from "@/lib/email";
import { transferIntroductionEmailHtml } from "@/lib/email-templates";
import type { TransferMatchKind } from "@/generated/prisma/client";
import { airportLabel, formatTravelWhen } from "@/lib/transfer-match-labels";
import { buildVcard, vcardFilename } from "@/lib/vcard";

type TravelGuest = {
  name: string;
  email: string;
  phone: string | null;
  arrivalAirport: string | null;
  arrivalDate: string | null;
  arrivalTime: string | null;
  departureAirport: string | null;
  departureDate: string | null;
  departureTime: string | null;
};

function travelSummary(guest: TravelGuest, kind: TransferMatchKind): string {
  if (kind === "ARRIVAL") {
    return `arriving at ${airportLabel(guest.arrivalAirport)} on ${formatTravelWhen(guest.arrivalDate, guest.arrivalTime)}`;
  }
  return `departing from ${airportLabel(guest.departureAirport)} on ${formatTravelWhen(guest.departureDate, guest.departureTime)}`;
}

export async function sendTransferIntroductionEmail({
  recipient,
  buddy,
  kind,
}: {
  recipient: TravelGuest;
  buddy: TravelGuest;
  kind: TransferMatchKind;
}): Promise<boolean> {
  const buddySummary = travelSummary(buddy, kind);
  const subject = "A travel buddy for the wedding weekend ✈️";

  const text = [
    `Hi ${recipient.name},`,
    "",
    "Good news — we've matched you with another guest travelling on a similar schedule.",
    "",
    `${buddy.name} is ${buddySummary}. If you'd like to coordinate a lift or share a ride, we've attached their contact card so you can reach out directly.`,
    "",
    "We only shared details because you both agreed to connect through the wedding app.",
    "",
    "Safe travels,",
    "Jarod & Jamie",
  ].join("\n");

  const html = transferIntroductionEmailHtml({
    recipientName: recipient.name,
    buddyName: buddy.name,
    buddySummary,
  });

  const vcard = buildVcard({
    name: buddy.name,
    email: buddy.email,
    phone: buddy.phone,
  });

  return sendEmail({
    to: recipient.email,
    subject,
    text,
    html,
    from: "updates",
    attachments: [
      {
        filename: vcardFilename(buddy.name),
        content: vcard,
        contentType: "text/vcard; charset=utf-8",
      },
    ],
  });
}
