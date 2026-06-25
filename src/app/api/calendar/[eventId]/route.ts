import { NextResponse } from "next/server";
import { buildIcsCalendar } from "@/lib/calendar-links";
import { getCalendarEvent } from "@/lib/wedding-calendar-events";

type RouteContext = { params: Promise<{ eventId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { eventId } = await context.params;
  const event = getCalendarEvent(eventId);

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
