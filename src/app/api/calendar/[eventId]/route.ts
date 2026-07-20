import { NextResponse } from "next/server";
import { buildIcsCalendar } from "@/lib/calendar-links";
import { bucksPartyCalendarEvent } from "@/lib/bucks-party-config";
import { getBucksPartyConfig } from "@/lib/bucks-party-config-server";
import { getCalendarEvent } from "@/lib/wedding-calendar-events";

type RouteContext = { params: Promise<{ eventId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { eventId } = await context.params;

  let event;
  if (eventId === "bucks-party") {
    const config = await getBucksPartyConfig();
    event = bucksPartyCalendarEvent(config);
  } else {
    event = getCalendarEvent(eventId);
  }

  if (!event) {
    return new NextResponse("Event not found.", { status: 404 });
  }

  const ics = buildIcsCalendar(event);
  const filename = `${event.id}.ics`;

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
