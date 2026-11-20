import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { guestNamesCompatibleForEmailLink } from "./guest-name";
import { planPartyMemberEmailLink, type PartyMemberEmailLinkExisting } from "./party-member-email-link";

const manager = {
  sayiPartyName: "Bob's party",
  assignedRoomName: "The Pavilion",
  assignedRoomDetails: "King bed",
  assignedRoomCheckIn: "2026-09-25",
  assignedRoomCheckOut: "2026-09-27",
  assignedRoomConfiguration: "King",
};

function existingGuest(
  overrides: Partial<PartyMemberEmailLinkExisting> = {},
): PartyMemberEmailLinkExisting {
  return {
    claimed: false,
    name: "Sarah Williams",
    phone: "0400 111 111",
    dietaryNotes: "Nut allergy",
    songRequest: "Dancing Queen",
    rsvpStatus: "DECLINED",
    sayiPartyName: "Williams",
    assignedRoomName: "Garden Suite",
    assignedRoomDetails: "Twin",
    assignedRoomCheckIn: "2026-09-25",
    assignedRoomCheckOut: "2026-09-27",
    assignedRoomConfiguration: "Twin",
    ...overrides,
  };
}

describe("guestNamesCompatibleForEmailLink", () => {
  it("matches the same full name", () => {
    assert.equal(guestNamesCompatibleForEmailLink("Sarah Williams", "sarah williams"), true);
  });

  it("matches a first-name-only input to that person's full name", () => {
    assert.equal(guestNamesCompatibleForEmailLink("Sarah", "Sarah Williams"), true);
  });

  it("rejects a different surname", () => {
    assert.equal(guestNamesCompatibleForEmailLink("Sarah Jones", "Sarah Williams"), false);
  });

  it("rejects a different first name", () => {
    assert.equal(guestNamesCompatibleForEmailLink("Eve", "Sarah Williams"), false);
  });
});

describe("planPartyMemberEmailLink", () => {
  it("refuses to attach a claimed guest", () => {
    const plan = planPartyMemberEmailLink(
      { name: "Sarah Williams", rsvpStatus: "ACCEPTED" },
      existingGuest({ claimed: true }),
      manager,
    );
    assert.equal(plan.type, "reject");
  });

  it("refuses to rename a different person found by email", () => {
    const plan = planPartyMemberEmailLink(
      { name: "Eve", rsvpStatus: "ACCEPTED", dietaryNotes: "None" },
      existingGuest(),
      manager,
    );
    assert.deepEqual(plan, {
      type: "reject",
      message:
        "That email is already on the guest list under a different name. Leave the email blank to add a new person, or ask them to sign in.",
    });
  });

  it("does not flip a declined guest to attending or overwrite their details", () => {
    const plan = planPartyMemberEmailLink(
      {
        name: "Sarah Williams",
        rsvpStatus: "ACCEPTED",
        phone: "0400 999 999",
        dietaryNotes: "None",
        songRequest: "New song",
      },
      existingGuest(),
      manager,
    );
    assert.equal(plan.type, "link");
    if (plan.type !== "link") return;
    assert.equal(plan.data.rsvpStatus, "DECLINED");
    assert.equal(plan.data.phone, "0400 111 111");
    assert.equal(plan.data.dietaryNotes, "Nut allergy");
    assert.equal(plan.data.songRequest, "Dancing Queen");
    assert.equal(plan.data.assignedRoomName, "Garden Suite");
  });

  it("can accept a pending guest with a matching name without renaming them", () => {
    const plan = planPartyMemberEmailLink(
      { name: "Sarah", rsvpStatus: "ACCEPTED" },
      existingGuest({ rsvpStatus: "PENDING", name: "Sarah Williams" }),
      manager,
    );
    assert.equal(plan.type, "link");
    if (plan.type !== "link") return;
    assert.equal(plan.data.rsvpStatus, "ACCEPTED");
  });
});
