import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { requireGuestSession } from "@/lib/auth/session";
import { updateManagedPartyMember } from "@/lib/guest-party";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await requireGuestSession();
    const { id } = await context.params;
    const body = await request.json();

    const members = await updateManagedPartyMember(session.id, id, {
      name: body.name,
      email: body.email,
      phone: body.phone,
      dietaryNotes: body.dietaryNotes,
      songRequest: body.songRequest,
      rsvpStatus: body.rsvpStatus,
      guestOfHost: body.guestOfHost,
      guestRelationship: body.guestRelationship,
      guestRelationshipNote: body.guestRelationshipNote,
      linkAsPlusOne: body.linkAsPlusOne,
    });

    return NextResponse.json({ members });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    const message = error instanceof Error ? error.message : "Failed to update party member.";
    const softFail =
      message.includes("not in your party") ||
      message.includes("already signed") ||
      message.includes("own profile") ||
      message.includes("valid") ||
      message.includes("enter") ||
      message.includes("already used");
    if (!softFail) console.error("[guest/party PATCH]", error);
    return jsonError(message, softFail ? 400 : 500);
  }
}
