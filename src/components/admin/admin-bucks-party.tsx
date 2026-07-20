"use client";

import { BucksOrganiserPortal } from "@/components/bucks-party/bucks-organiser-portal";

type AdminBucksPartyProps = {
  onBack: () => void;
};

/** Wedding-admin Bucks section: full organiser portal + appoint organisers. */
export function AdminBucksParty({ onBack }: AdminBucksPartyProps) {
  return <BucksOrganiserPortal onBack={onBack} canAppointOrganisers />;
}
