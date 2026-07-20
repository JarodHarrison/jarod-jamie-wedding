import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const SOURCE_EMAIL = "akara-gooden@guests.jarodandjamiewedding.com";
const TARGET_EMAIL = "akarag28@gmail.com";
const MERGED_NAME = "Akara Chan";

function coalesce<T>(target: T | null | undefined, source: T | null | undefined): T | null | undefined {
  if (target !== null && target !== undefined && target !== "") return target;
  return source ?? target;
}

async function reassignGuestRelations(sourceId: string, targetId: string) {
  await prisma.guest.updateMany({
    where: { plusOneGuestId: sourceId },
    data: { plusOneGuestId: targetId },
  });

  await prisma.transferMatch.updateMany({
    where: { guestLowId: sourceId },
    data: { guestLowId: targetId },
  });
  await prisma.transferMatch.updateMany({
    where: { guestHighId: sourceId },
    data: { guestHighId: targetId },
  });

  await prisma.inAppNotification.updateMany({
    where: { guestId: sourceId },
    data: { guestId: targetId },
  });

  await prisma.guestStory.updateMany({
    where: { guestId: sourceId },
    data: { guestId: targetId },
  });

  await prisma.guestSharedPhoto.updateMany({
    where: { guestId: sourceId },
    data: { guestId: targetId },
  });

  await prisma.guestAttractionTicket.updateMany({
    where: { guestId: sourceId },
    data: { guestId: targetId },
  });

  await prisma.annitaQuestionLog.updateMany({
    where: { guestId: sourceId },
    data: { guestId: targetId },
  });

  const sourceTrip = await prisma.goldCoastTrip.findUnique({ where: { guestId: sourceId } });
  const targetTrip = await prisma.goldCoastTrip.findUnique({ where: { guestId: targetId } });
  if (sourceTrip && !targetTrip) {
    await prisma.goldCoastTrip.update({
      where: { guestId: sourceId },
      data: { guestId: targetId },
    });
  }

  const sourceBingo = await prisma.photoboothBingoProgress.findUnique({
    where: { guestId: sourceId },
  });
  const targetBingo = await prisma.photoboothBingoProgress.findUnique({
    where: { guestId: targetId },
  });
  if (sourceBingo && !targetBingo) {
    await prisma.photoboothBingoProgress.update({
      where: { guestId: sourceId },
      data: { guestId: targetId },
    });
  }

  await prisma.photoboothBingoProgress.updateMany({
    where: { verifiedByGuestId: sourceId },
    data: { verifiedByGuestId: targetId },
  });
}

async function main() {
  const source = await prisma.guest.findUnique({ where: { email: SOURCE_EMAIL } });
  const target = await prisma.guest.findUnique({
    where: { email: TARGET_EMAIL },
    include: { linkedLogins: true },
  });

  if (!source) {
    console.error(`Source guest not found: ${SOURCE_EMAIL}`);
    process.exit(1);
  }
  if (!target) {
    console.error(`Target guest not found: ${TARGET_EMAIL}`);
    process.exit(1);
  }

  console.log(`Merging "${source.name}" (${source.email}) into "${target.name}" (${target.email})`);

  await reassignGuestRelations(source.id, target.id);

  const merged = await prisma.guest.update({
    where: { id: target.id },
    data: {
      name: MERGED_NAME,
      tier: coalesce(target.tier, source.tier) as typeof target.tier,
      rsvpStatus: target.rsvpStatus === "PENDING" ? source.rsvpStatus : target.rsvpStatus,
      phone: coalesce(target.phone, source.phone),
      plusOneName: coalesce(target.plusOneName, source.plusOneName),
      plusOneGuestId: coalesce(target.plusOneGuestId, source.plusOneGuestId),
      companionPhotoMime: coalesce(target.companionPhotoMime, source.companionPhotoMime),
      companionPhotoData: coalesce(target.companionPhotoData, source.companionPhotoData),
      partyRole: coalesce(target.partyRole, source.partyRole),
      isMc: target.isMc || source.isMc,
      dietaryNotes: coalesce(target.dietaryNotes, source.dietaryNotes),
      songRequest: coalesce(target.songRequest, source.songRequest),
      rsvpSubmittedAt: coalesce(target.rsvpSubmittedAt, source.rsvpSubmittedAt),
      accommodationType: coalesce(target.accommodationType, source.accommodationType),
      accommodationName: coalesce(target.accommodationName, source.accommodationName),
      accommodationAddress: coalesce(target.accommodationAddress, source.accommodationAddress),
      checkInDate: coalesce(target.checkInDate, source.checkInDate),
      checkOutDate: coalesce(target.checkOutDate, source.checkOutDate),
      needsShuttle: coalesce(target.needsShuttle, source.needsShuttle),
      accommodationNotes: coalesce(target.accommodationNotes, source.accommodationNotes),
      accommodationSubmittedAt: coalesce(target.accommodationSubmittedAt, source.accommodationSubmittedAt),
      assignedRoomName: coalesce(target.assignedRoomName, source.assignedRoomName),
      assignedRoomDetails: coalesce(target.assignedRoomDetails, source.assignedRoomDetails),
      assignedRoomCheckIn: coalesce(target.assignedRoomCheckIn, source.assignedRoomCheckIn),
      assignedRoomCheckOut: coalesce(target.assignedRoomCheckOut, source.assignedRoomCheckOut),
      assignedRoomConfiguration: coalesce(target.assignedRoomConfiguration, source.assignedRoomConfiguration),
      roomAllocationImportedAt: coalesce(target.roomAllocationImportedAt, source.roomAllocationImportedAt),
      bedPreference: coalesce(target.bedPreference, source.bedPreference),
      wantsSharedTransfer: coalesce(target.wantsSharedTransfer, source.wantsSharedTransfer),
      shareTransferContactDetails: coalesce(
        target.shareTransferContactDetails,
        source.shareTransferContactDetails,
      ),
      arrivalAirport: coalesce(target.arrivalAirport, source.arrivalAirport),
      arrivalDate: coalesce(target.arrivalDate, source.arrivalDate),
      arrivalTime: coalesce(target.arrivalTime, source.arrivalTime),
      arrivalMaxWait: coalesce(target.arrivalMaxWait, source.arrivalMaxWait),
      departureAirport: coalesce(target.departureAirport, source.departureAirport),
      departureDate: coalesce(target.departureDate, source.departureDate),
      departureTime: coalesce(target.departureTime, source.departureTime),
      flightNumber: coalesce(target.flightNumber, source.flightNumber),
      passengerCount: coalesce(target.passengerCount, source.passengerCount),
      transferNotes: coalesce(target.transferNotes, source.transferNotes),
      transferSubmittedAt: coalesce(target.transferSubmittedAt, source.transferSubmittedAt),
      returnShuttleInterest: coalesce(target.returnShuttleInterest, source.returnShuttleInterest),
      returnShuttleAirport: coalesce(target.returnShuttleAirport, source.returnShuttleAirport),
      returnShuttleRegisteredAt: coalesce(
        target.returnShuttleRegisteredAt,
        source.returnShuttleRegisteredAt,
      ),
      glowUpInterest: coalesce(target.glowUpInterest, source.glowUpInterest),
      onSiteServiceInterest: coalesce(target.onSiteServiceInterest, source.onSiteServiceInterest),
      interestsSubmittedAt: coalesce(target.interestsSubmittedAt, source.interestsSubmittedAt),
      giftColourChoice1: coalesce(target.giftColourChoice1, source.giftColourChoice1),
      giftColourChoice2: coalesce(target.giftColourChoice2, source.giftColourChoice2),
      giftColoursSubmittedAt: coalesce(target.giftColoursSubmittedAt, source.giftColoursSubmittedAt),
      profilePhotoMime: coalesce(target.profilePhotoMime, source.profilePhotoMime),
      profilePhotoData: coalesce(target.profilePhotoData, source.profilePhotoData),
      guestOfHost: coalesce(target.guestOfHost, source.guestOfHost),
      guestRelationship: coalesce(target.guestRelationship, source.guestRelationship),
      guestRelationshipNote: coalesce(target.guestRelationshipNote, source.guestRelationshipNote),
      profileUpdatedAt: coalesce(target.profileUpdatedAt, source.profileUpdatedAt),
      sayiPartyName: coalesce(target.sayiPartyName, source.sayiPartyName),
      sayiLink: coalesce(target.sayiLink, source.sayiLink),
      sayiPlusOneAllowed: coalesce(target.sayiPlusOneAllowed, source.sayiPlusOneAllowed),
      mailingAddress: coalesce(target.mailingAddress, source.mailingAddress),
      sayiImportedAt: coalesce(target.sayiImportedAt, source.sayiImportedAt),
      sayiCustomData: target.sayiCustomData ?? source.sayiCustomData ?? undefined,
      seatingTableKey: coalesce(target.seatingTableKey, source.seatingTableKey),
      seatingSortOrder: coalesce(target.seatingSortOrder, source.seatingSortOrder),
    },
    select: {
      id: true,
      name: true,
      email: true,
      tier: true,
      rsvpStatus: true,
      sayiPartyName: true,
      accommodationName: true,
      assignedRoomName: true,
      linkedLogins: { select: { email: true, provider: true } },
    },
  });

  await prisma.guest.delete({ where: { id: source.id } });

  console.log("\nMerged guest:");
  console.log(JSON.stringify(merged, null, 2));
  console.log(`\nDeleted duplicate import record: ${SOURCE_EMAIL}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
