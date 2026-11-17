import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  guestHasActivatedAppAccount,
  guestRecordIsActivated,
  unclaimedGuestAccountWhere,
} from "./guest-account-status";

describe("guestHasActivatedAppAccount", () => {
  it("treats imported invites with no login as unclaimed", () => {
    assert.equal(
      guestHasActivatedAppAccount({
        passwordPlaintext: null,
        linkedLoginCount: 0,
        passkeyCount: 0,
      }),
      false,
    );
  });

  it("treats email/password signups as activated", () => {
    assert.equal(
      guestHasActivatedAppAccount({
        passwordPlaintext: "secret-password",
        linkedLoginCount: 0,
        passkeyCount: 0,
      }),
      true,
    );
  });

  it("treats Google-linked accounts as activated even without a stored password", () => {
    assert.equal(
      guestHasActivatedAppAccount({
        passwordPlaintext: null,
        linkedLoginCount: 1,
        passkeyCount: 0,
      }),
      true,
    );
  });

  it("treats passkey-only accounts as activated even without a stored password", () => {
    assert.equal(
      guestHasActivatedAppAccount({
        passwordPlaintext: null,
        linkedLoginCount: 0,
        passkeyCount: 1,
      }),
      true,
    );
  });
});

describe("guestRecordIsActivated", () => {
  it("does not let a Sayi-imported Google user be claimed again", () => {
    assert.equal(
      guestRecordIsActivated({
        passwordPlaintext: null,
        _count: { linkedLogins: 1, passkeyCredentials: 0 },
      }),
      true,
    );
  });

  it("still allows claiming a true imported invite", () => {
    assert.equal(
      guestRecordIsActivated({
        passwordPlaintext: null,
        _count: { linkedLogins: 0, passkeyCredentials: 0 },
      }),
      false,
    );
  });
});

describe("unclaimedGuestAccountWhere", () => {
  it("requires no password, Google login, or passkey", () => {
    assert.deepEqual(unclaimedGuestAccountWhere, {
      passwordPlaintext: null,
      linkedLogins: { none: {} },
      passkeyCredentials: { none: {} },
    });
  });
});
