import { GUEST_IMPORT_EMAIL_DOMAIN } from "@/lib/guest-spreadsheet-import";
import { normalizeGuestName } from "@/lib/guest-name";

export type LinkedPlusOne = {
  id: string;
  name: string;
  email: string;
  managedByGuestId: string | null;
  claimed: boolean;
};

export type NameMatch = {
  id: string;
  plusOneGuestId: string | null;
};

export type PlusOneEnsurePlan =
  | { type: "clear-name" }
  | { type: "unlink"; declineAutoCreatedId: string | null }
  | { type: "keep"; guestId: string; canonicalName: string }
  | { type: "rename-linked"; guestId: string; name: string }
  | {
      type: "link-existing";
      guestId: string;
      declineAutoCreatedId: string | null;
    }
  | { type: "create"; name: string }
  | {
      type: "name-only";
      name: string;
      unlinkCurrent: boolean;
      declineAutoCreatedId: string | null;
    };

export function isAutoCreatedManagedPlusOne(
  linked: LinkedPlusOne,
  managerId: string,
): boolean {
  return (
    !linked.claimed &&
    linked.managedByGuestId === managerId &&
    linked.email.trim().toLowerCase().endsWith(`@${GUEST_IMPORT_EMAIL_DOMAIN}`)
  );
}

export function pickUniqueGuestByNormalizedName<T extends { id: string; name: string }>(
  name: string,
  candidates: T[],
  excludeId: string,
): T | null {
  const normalized = normalizeGuestName(name);
  if (!normalized) return null;

  const matches = candidates.filter(
    (guest) => guest.id !== excludeId && normalizeGuestName(guest.name) === normalized,
  );
  return matches.length === 1 ? matches[0] : null;
}

function autoCreatedId(linked: LinkedPlusOne | null, managerId: string): string | null {
  if (!linked) return null;
  return isAutoCreatedManagedPlusOne(linked, managerId) ? linked.id : null;
}

/**
 * Decide how to turn a typed plus-one name into a guest link.
 * Never mints a new attending guest on decline, and never duplicates an
 * existing unique name match.
 */
export function planPlusOneEnsure(input: {
  managerId: string;
  plusOneName: string | null;
  allowCreate: boolean;
  linked: LinkedPlusOne | null;
  uniqueNameMatch: NameMatch | null;
}): PlusOneEnsurePlan {
  const name = input.plusOneName?.trim() || null;
  const ghostId = autoCreatedId(input.linked, input.managerId);

  if (!name) {
    if (!input.linked) return { type: "clear-name" };
    return { type: "unlink", declineAutoCreatedId: ghostId };
  }

  if (input.linked && normalizeGuestName(input.linked.name) === normalizeGuestName(name)) {
    if (!input.allowCreate) {
      return {
        type: "name-only",
        name: input.linked.name,
        unlinkCurrent: true,
        declineAutoCreatedId: ghostId,
      };
    }
    return { type: "keep", guestId: input.linked.id, canonicalName: input.linked.name };
  }

  const match = input.uniqueNameMatch;
  const matchTakenByOther =
    Boolean(match?.plusOneGuestId) && match?.plusOneGuestId !== input.managerId;

  if (input.allowCreate && match && !matchTakenByOther) {
    return {
      type: "link-existing",
      guestId: match.id,
      declineAutoCreatedId: ghostId && ghostId !== match.id ? ghostId : null,
    };
  }

  if (input.allowCreate && ghostId) {
    return { type: "rename-linked", guestId: ghostId, name };
  }

  if (!input.allowCreate || matchTakenByOther) {
    return {
      type: "name-only",
      name,
      unlinkCurrent: Boolean(input.linked),
      declineAutoCreatedId: ghostId,
    };
  }

  return { type: "create", name };
}
