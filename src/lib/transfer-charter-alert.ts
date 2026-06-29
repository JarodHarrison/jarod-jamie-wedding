import { sendNotificationEmail } from "@/lib/email";
import { adminGuestEventEmailHtml } from "@/lib/email-templates";
import {
  CHARTER_GUEST_THRESHOLD,
  RETURN_SHUTTLE,
  returnShuttleAirportLabel,
} from "@/lib/return-shuttle";
import { airportLabel } from "@/lib/transfer-match-labels";
import { prisma } from "@/lib/prisma";

async function sendCharterAlertOnce(
  alertKey: string,
  subject: string,
  detailLines: string[],
): Promise<void> {
  const existing = await prisma.transferCharterAlert.findUnique({ where: { alertKey } });
  if (existing) return;

  const sent = await sendNotificationEmail(
    subject,
    detailLines.join("\n"),
    adminGuestEventEmailHtml(subject, detailLines, "https://jarodandjamiewedding.com/admin"),
  );

  if (!sent) return;

  await prisma.transferCharterAlert.create({ data: { alertKey } });
}

export async function checkReturnShuttleCharterAlerts(): Promise<void> {
  for (const airport of ["MCY", "BNE"] as const) {
    const guests = await prisma.guest.findMany({
      where: {
        returnShuttleInterest: true,
        returnShuttleAirport: airport,
        rsvpStatus: "ACCEPTED",
      },
      select: { name: true },
      orderBy: { name: "asc" },
    });

    if (guests.length < CHARTER_GUEST_THRESHOLD) continue;

    const alertKey = `return-shuttle-${airport}`;
    const airportName = returnShuttleAirportLabel(airport);
    await sendCharterAlertOnce(
      alertKey,
      `Private charter opportunity — ${guests.length} guests on return shuttle (${airport})`,
      [
        `${guests.length} guests have registered for the return coach to ${airportName}.`,
        `Departure: ${RETURN_SHUTTLE.displayDate} at ${RETURN_SHUTTLE.displayTime} from Spicers Clovelly.`,
        `Airport: ${airportName}`,
        `Guests: ${guests.map((g) => g.name).join(", ")}`,
        "This may be worth exploring as a private charter or larger coach.",
      ],
    );
  }
}

export async function checkArrivalClusterCharterAlerts(): Promise<void> {
  const guests = await prisma.guest.findMany({
    where: {
      rsvpStatus: "ACCEPTED",
      wantsSharedTransfer: true,
      arrivalAirport: { not: null },
      arrivalDate: { not: null },
      arrivalTime: { not: null },
      arrivalMaxWait: { not: null },
    },
    select: {
      name: true,
      arrivalAirport: true,
      arrivalDate: true,
    },
  });

  const clusters = new Map<string, { airport: string; date: string; names: string[] }>();

  for (const guest of guests) {
    if (!guest.arrivalAirport || !guest.arrivalDate) continue;
    const key = `${guest.arrivalAirport}:${guest.arrivalDate}`;
    const cluster = clusters.get(key) ?? {
      airport: guest.arrivalAirport,
      date: guest.arrivalDate,
      names: [],
    };
    cluster.names.push(guest.name);
    clusters.set(key, cluster);
  }

  for (const [key, cluster] of clusters) {
    if (cluster.names.length < CHARTER_GUEST_THRESHOLD) continue;

    const alertKey = `arrival-cluster-${key}`;
    await sendCharterAlertOnce(
      alertKey,
      `Private charter opportunity — ${cluster.names.length} guests arriving ${cluster.airport} on ${cluster.date}`,
      [
        `${cluster.names.length} guests are interested in shared airport transport with similar arrival plans.`,
        `Airport: ${airportLabel(cluster.airport)}`,
        `Date: ${cluster.date}`,
        `Guests: ${cluster.names.join(", ")}`,
        "Consider a private charter or coordinated group transfer for this window.",
      ],
    );
  }
}

export async function checkTransferCharterAlerts(): Promise<void> {
  await Promise.all([checkReturnShuttleCharterAlerts(), checkArrivalClusterCharterAlerts()]);
}
