import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireGuestSession } from "@/lib/auth/session";
import { createPartyMember, loadPartyMembers } from "@/lib/guest-party";

export async function GET() {
  try {
    const session = await requireGuestSession();
    const members = await loadPartyMembers(session.id);
    return NextResponse.json({ members });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    console.error("[guest/party GET]", error);
    return jsonError("Failed to load your party.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireGuestSession();
    const body = await request.json();
    const members = await createPartyMember(session.id, {
      name: body.name ?? "",
      email: body.email,
      phone: body.phone,
      dietaryNotes: body.dietaryNotes,
      songRequest: body.songRequest,
      rsvpStatus: body.rsvpStatus,
      linkAsPlusOne: body.linkAsPlusOne === true,
    });
    return NextResponse.json({ members }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    const message = error instanceof Error ? error.message : "Failed to add party member.";
    const status =
      message.includes("already") || message.includes("valid") || message.includes("enter")
        ? 400
        : 500;
    if (status === 500) console.error("[guest/party POST]", error);
    return jsonError(message, status);
  }
}
