import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { JAROD_ADMIN_EMAIL, JAROD_GUEST_EMAIL, JAMIE_ADMIN_EMAIL } from "./account-roles";
import {
  adminRecordGrantsGuestAccess,
  shouldBlockUnverifiedAdminSignup,
} from "./admin-access-policy";

const jamieGuestId = "guest-jamie-hotmail";
const attackerId = "guest-attacker";
const promotedId = "guest-promoted";

describe("adminRecordGrantsGuestAccess", () => {
  it("denies a signup that only matches a host admin email", () => {
    assert.equal(
      adminRecordGrantsGuestAccess(attackerId, JAMIE_ADMIN_EMAIL, {
        email: JAMIE_ADMIN_EMAIL,
        linkedGuestId: jamieGuestId,
      }),
      false,
    );
  });

  it("denies Jarod's guest-only Gmail even if an admin row is linked", () => {
    assert.equal(
      adminRecordGrantsGuestAccess("guest-jarod", JAROD_GUEST_EMAIL, {
        email: JAROD_GUEST_EMAIL,
        linkedGuestId: "guest-jarod",
      }),
      false,
    );
  });

  it("grants a Make Admin guest whose Admin row is bound to them", () => {
    assert.equal(
      adminRecordGrantsGuestAccess(promotedId, "coordinator@example.com", {
        email: "coordinator@example.com",
        linkedGuestId: promotedId,
      }),
      true,
    );
  });

  it("does not treat host admin linkage as guest-session admin for a different email", () => {
    assert.equal(
      adminRecordGrantsGuestAccess(jamieGuestId, "jamie_stocks27@hotmail.com", {
        email: JAMIE_ADMIN_EMAIL,
        linkedGuestId: jamieGuestId,
      }),
      false,
    );
  });

  it("denies legacy Make Admin rows that were never bound to a guest id", () => {
    assert.equal(
      adminRecordGrantsGuestAccess(promotedId, "coordinator@example.com", {
        email: "coordinator@example.com",
        linkedGuestId: null,
      }),
      false,
    );
  });
});

describe("shouldBlockUnverifiedAdminSignup", () => {
  it("blocks creating a new guest for a host admin mailbox", () => {
    assert.equal(
      shouldBlockUnverifiedAdminSignup(null, {
        email: JAROD_ADMIN_EMAIL,
        linkedGuestId: "guest-jarod",
      }),
      true,
    );
  });

  it("allows claiming the guest that Make Admin already bound", () => {
    assert.equal(
      shouldBlockUnverifiedAdminSignup(promotedId, {
        email: "coordinator@example.com",
        linkedGuestId: promotedId,
      }),
      false,
    );
  });

  it("blocks claiming a different guest that happens to use the admin email", () => {
    assert.equal(
      shouldBlockUnverifiedAdminSignup(attackerId, {
        email: JAMIE_ADMIN_EMAIL,
        linkedGuestId: jamieGuestId,
      }),
      true,
    );
  });

  it("does not block ordinary guest signup", () => {
    assert.equal(shouldBlockUnverifiedAdminSignup(null, null), false);
  });
});
