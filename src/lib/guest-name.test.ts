import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findUniqueFirstNameGuest } from "./guest-name";

describe("findUniqueFirstNameGuest", () => {
  const laurenRoberts = { id: "lauren-roberts", name: "Lauren Roberts" };
  const sarahWilliams = { id: "sarah-williams", name: "Sarah Williams" };

  it("does not claim a different surname when the signup name is a full name", () => {
    assert.equal(
      findUniqueFirstNameGuest("Lauren Smith", [laurenRoberts]),
      null,
    );
    assert.equal(
      findUniqueFirstNameGuest("Sarah Jones", [sarahWilliams]),
      null,
    );
  });

  it("still matches a unique first-name-only signup to the only imported guest", () => {
    assert.equal(findUniqueFirstNameGuest("Lauren", [laurenRoberts]), laurenRoberts);
  });

  it("does not match when two imported guests share that first name", () => {
    assert.equal(
      findUniqueFirstNameGuest("Lauren", [
        laurenRoberts,
        { id: "lauren-other", name: "Lauren Chen" },
      ]),
      null,
    );
  });

  it("ignores short first-name tokens", () => {
    assert.equal(findUniqueFirstNameGuest("Al", [{ id: "al", name: "Al Harrison" }]), null);
  });
});
