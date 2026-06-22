import type { GuestProfileSection, SerializedGuestProfile } from "@/lib/guest-profile";

export type ProfileTask = {
  id: string;
  section: GuestProfileSection;
  label: string;
  appTab: string;
  starter: string;
  priority: "required" | "recommended" | "optional";
};

export function getIncompleteProfileTasks(profile: SerializedGuestProfile): ProfileTask[] {
  const tasks: ProfileTask[] = [];

  if (!profile.rsvpSubmittedAt || profile.rsvpStatus === "PENDING") {
    tasks.push({
      id: "rsvp",
      section: "rsvp",
      label: "RSVP (attending, phone, dietary needs, song request)",
      appTab: "RSVP tab",
      starter: "Help me complete my RSVP",
      priority: "required",
    });
  }

  if (!profile.accommodationSubmittedAt) {
    tasks.push({
      id: "accommodation",
      section: "accommodation",
      label: "Accommodation details (where you're staying & shuttle planning)",
      appTab: "Travel & Stay tab",
      starter: "I need to add my accommodation details",
      priority: profile.tier === "OFF_SITE" ? "required" : "recommended",
    });
  }

  if (!profile.transferSubmittedAt) {
    tasks.push({
      id: "transfer",
      section: "transfer",
      label: "Airport transfer interest (flights & shared transport)",
      appTab: "Travel & Stay → Flights",
      starter: "Help me register my flight details",
      priority: "optional",
    });
  }

  if (!profile.interestsSubmittedAt) {
    tasks.push({
      id: "interests",
      section: "interests",
      label: "Pre-wedding services (glow-up or on-site hair/barber)",
      appTab: "Guide tab",
      starter: "I'm interested in pre-wedding services",
      priority: "optional",
    });
  }

  return tasks;
}

export function buildProfileStatusSummary(profile: SerializedGuestProfile): string {
  const tasks = getIncompleteProfileTasks(profile);
  const lines: string[] = [
    `Guest profile for ${profile.name} (${profile.email}, tier: ${profile.tier}):`,
  ];

  if (profile.rsvpSubmittedAt) {
    lines.push(
      `- RSVP: ${profile.rsvpStatus}${profile.phone ? `, phone on file` : ""}${profile.plusOneName ? `, plus-one: ${profile.plusOneName}` : ""}${profile.dietaryNotes ? `, dietary: ${profile.dietaryNotes}` : ""}${profile.songRequest ? `, song: ${profile.songRequest}` : ""}`,
    );
  } else {
    lines.push("- RSVP: not submitted yet");
  }

  if (profile.accommodationSubmittedAt) {
    lines.push(
      `- Accommodation: ${profile.accommodationType ?? "submitted"}${profile.accommodationName ? ` at ${profile.accommodationName}` : ""}${profile.needsShuttle ? " (needs shuttle)" : ""}`,
    );
  } else {
    lines.push("- Accommodation: not submitted yet");
  }

  if (profile.transferSubmittedAt) {
    lines.push(
      `- Airport transfer: ${profile.wantsSharedTransfer ? "interested in sharing" : "not sharing"}${profile.arrivalAirport ? `, arriving ${profile.arrivalAirport}` : ""}`,
    );
  } else {
    lines.push("- Airport transfer: not submitted yet");
  }

  if (profile.interestsSubmittedAt) {
    const bits = [profile.glowUpInterest, profile.onSiteServiceInterest].filter(Boolean);
    lines.push(`- Guide interests: ${bits.join(", ") || "submitted"}`);
  } else {
    lines.push("- Guide interests: not submitted yet");
  }

  if (tasks.length === 0) {
    lines.push("\nAll main forms are complete — no outstanding tasks.");
  } else {
    lines.push("\nOutstanding tasks (nudge the guest warmly if relevant):");
    for (const task of tasks) {
      lines.push(`- [${task.priority}] ${task.label} → ${task.appTab}`);
    }
  }

  return lines.join("\n");
}

export function mergeFormPayload(
  section: GuestProfileSection,
  args: Record<string, unknown>,
  existing: SerializedGuestProfile,
): Record<string, unknown> {
  if (section === "rsvp") {
    const attending =
      args.attending === "ACCEPTED" || args.attending === "DECLINED"
        ? args.attending
        : existing.rsvpStatus !== "PENDING"
          ? existing.rsvpStatus
          : undefined;

    return {
      attending,
      phone: args.phone ?? existing.phone ?? "",
      plusOneName: args.plusOneName ?? existing.plusOneName ?? "",
      dietaryNotes: args.dietaryNotes ?? existing.dietaryNotes ?? "",
      songRequest: args.songRequest ?? existing.songRequest ?? "",
    };
  }

  if (section === "accommodation") {
    return {
      accommodationType: args.accommodationType ?? existing.accommodationType ?? "",
      accommodationName: args.accommodationName ?? existing.accommodationName ?? "",
      accommodationAddress: args.accommodationAddress ?? existing.accommodationAddress ?? "",
      checkInDate: args.checkInDate ?? existing.checkInDate ?? "",
      checkOutDate: args.checkOutDate ?? existing.checkOutDate ?? "",
      needsShuttle:
        typeof args.needsShuttle === "boolean" ? args.needsShuttle : (existing.needsShuttle ?? false),
      accommodationNotes: args.accommodationNotes ?? existing.accommodationNotes ?? "",
    };
  }

  if (section === "transfer") {
    return {
      wantsSharedTransfer:
        typeof args.wantsSharedTransfer === "boolean"
          ? args.wantsSharedTransfer
          : (existing.wantsSharedTransfer ?? true),
      arrivalAirport: args.arrivalAirport ?? existing.arrivalAirport ?? "",
      arrivalDate: args.arrivalDate ?? existing.arrivalDate ?? "",
      arrivalTime: args.arrivalTime ?? existing.arrivalTime ?? "",
      departureAirport: args.departureAirport ?? existing.departureAirport ?? "",
      departureDate: args.departureDate ?? existing.departureDate ?? "",
      departureTime: args.departureTime ?? existing.departureTime ?? "",
      flightNumber: args.flightNumber ?? existing.flightNumber ?? "",
      passengerCount:
        args.passengerCount !== undefined
          ? args.passengerCount
          : (existing.passengerCount ?? null),
      transferNotes: args.transferNotes ?? existing.transferNotes ?? "",
    };
  }

  return {
    glowUpInterest: args.glowUpInterest ?? existing.glowUpInterest ?? "",
    onSiteServiceInterest: args.onSiteServiceInterest ?? existing.onSiteServiceInterest ?? "",
  };
}
