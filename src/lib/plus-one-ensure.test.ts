import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GUEST_IMPORT_EMAIL_DOMAIN } from "./guest-spreadsheet-import";
import {
  pickUniqueGuestByNormalizedName,
  planPlusOneEnsure,
  type LinkedPlusOne,
} from "./plus-one-ensure";

const MANAGER = "mgr-1";

function ghost(overrides: Partial<LinkedPlusOne> = {}): LinkedPlusOne {
  return {
    id: "ghost-1",
    name: "Alex Taylr",
    email: `alex-taylr@${GUEST_IMPORT_EMAIL_DOMAIN}`,
    managedByGuestId: MANAGER,
    claimed: false,
    ...overrides,
  };
}

function importedAlex(): LinkedPlusOne {
  return {
    id: "alex-imported",
    name: "Alex Taylor",
    email: "alex@example.com",
    managedByGuestId: null,
    claimed: false,
  };
}

describe("pickUniqueGuestByNormalizedName", () => {
  const guests = [
    { id: "a", name: "Alex Taylor" },
    { id: "b", name: "Sam Taylor" },
    { id: MANAGER, name: "Alex Taylor" },
  ];

  it("returns the unique full-name match, ignoring the manager", () => {
    assert.equal(pickUniqueGuestByNormalizedName("Alex Taylor", guests, MANAGER)?.id, "a");
  });

  it("returns null when the name is missing", () => {
    assert.equal(pickUniqueGuestByNormalizedName("Jordan Lee", guests, MANAGER), null);
  });

  it("returns null when more than one other guest shares the name", () => {
    const duplicates = [
      { id: "a", name: "Alex Taylor" },
      { id: "c", name: "alex taylor" },
    ];
    assert.equal(pickUniqueGuestByNormalizedName("Alex Taylor", duplicates, MANAGER), null);
  });
});

describe("planPlusOneEnsure", () => {
  it("does not create a guest when RSVP is declined with a prefilled plus-one name", () => {
    const plan = planPlusOneEnsure({
      managerId: MANAGER,
      plusOneName: "Alex Taylor",
      allowCreate: false,
      linked: null,
      uniqueNameMatch: null,
    });
    assert.deepEqual(plan, {
      type: "name-only",
      name: "Alex Taylor",
      unlinkCurrent: false,
      declineAutoCreatedId: null,
    });
  });

  it("unlinks and declines an auto-created plus-one when the RSVP is later declined", () => {
    const linked = ghost({ name: "Alex Taylor", email: `alex-taylor@${GUEST_IMPORT_EMAIL_DOMAIN}` });
    const plan = planPlusOneEnsure({
      managerId: MANAGER,
      plusOneName: "Alex Taylor",
      allowCreate: false,
      linked,
      uniqueNameMatch: { id: linked.id, plusOneGuestId: MANAGER },
    });
    assert.equal(plan.type, "name-only");
    if (plan.type !== "name-only") return;
    assert.equal(plan.unlinkCurrent, true);
    assert.equal(plan.declineAutoCreatedId, linked.id);
  });

  it("links an existing unique guest instead of minting a duplicate", () => {
    const existing = importedAlex();
    const plan = planPlusOneEnsure({
      managerId: MANAGER,
      plusOneName: "Alex Taylor",
      allowCreate: true,
      linked: null,
      uniqueNameMatch: { id: existing.id, plusOneGuestId: null },
    });
    assert.deepEqual(plan, {
      type: "link-existing",
      guestId: existing.id,
      declineAutoCreatedId: null,
    });
  });

  it("creates a guest only when the plus-one is not already on the list", () => {
    const plan = planPlusOneEnsure({
      managerId: MANAGER,
      plusOneName: "Jordan Lee",
      allowCreate: true,
      linked: null,
      uniqueNameMatch: null,
    });
    assert.deepEqual(plan, { type: "create", name: "Jordan Lee" });
  });

  it("renames an unclaimed auto-created plus-one on typo correction", () => {
    const plan = planPlusOneEnsure({
      managerId: MANAGER,
      plusOneName: "Alex Taylor",
      allowCreate: true,
      linked: ghost(),
      uniqueNameMatch: null,
    });
    assert.deepEqual(plan, { type: "rename-linked", guestId: "ghost-1", name: "Alex Taylor" });
  });

  it("prefers linking the real imported guest over renaming a typo ghost", () => {
    const existing = importedAlex();
    const plan = planPlusOneEnsure({
      managerId: MANAGER,
      plusOneName: "Alex Taylor",
      allowCreate: true,
      linked: ghost(),
      uniqueNameMatch: { id: existing.id, plusOneGuestId: null },
    });
    assert.deepEqual(plan, {
      type: "link-existing",
      guestId: existing.id,
      declineAutoCreatedId: "ghost-1",
    });
  });

  it("does not steal a plus-one who is already linked to someone else", () => {
    const existing = importedAlex();
    const plan = planPlusOneEnsure({
      managerId: MANAGER,
      plusOneName: "Alex Taylor",
      allowCreate: true,
      linked: null,
      uniqueNameMatch: { id: existing.id, plusOneGuestId: "other-partner" },
    });
    assert.deepEqual(plan, {
      type: "name-only",
      name: "Alex Taylor",
      unlinkCurrent: false,
      declineAutoCreatedId: null,
    });
  });

  it("clears a typed name without creating anyone", () => {
    const plan = planPlusOneEnsure({
      managerId: MANAGER,
      plusOneName: "  ",
      allowCreate: true,
      linked: null,
      uniqueNameMatch: null,
    });
    assert.deepEqual(plan, { type: "clear-name" });
  });
});
