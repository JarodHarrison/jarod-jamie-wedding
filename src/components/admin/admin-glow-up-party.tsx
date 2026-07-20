"use client";

import { GlowUpAdminPortal } from "@/components/glow-up-party/glow-up-admin-portal";

type AdminGlowUpPartyProps = {
  onBack: () => void;
};

/** Wedding-admin Pump Party / Glow-Up section. */
export function AdminGlowUpParty({ onBack }: AdminGlowUpPartyProps) {
  return <GlowUpAdminPortal onBack={onBack} />;
}
