"use client";

import { SubHeader } from "@/components/wedding/shared/sub-header";
import { VenueMapViewer } from "@/components/wedding/shared/venue-map-viewer";
import { useVenueMapAccess } from "@/components/wedding/hooks/use-venue-map-access";
import { theme } from "@/lib/theme";
import type { AppTab } from "@/types/wedding";

type VenueMapScreenProps = {
  setActiveTab: (tab: AppTab) => void;
  isAdmin?: boolean;
  backTab?: AppTab;
};

export function VenueMapScreen({
  setActiveTab,
  isAdmin = false,
  backTab = "guide",
}: VenueMapScreenProps) {
  const { ready, canViewVenueMap: canView, hasOnSiteAccess, unlockHint } =
    useVenueMapAccess(isAdmin);

  return (
    <div className="animate-fade-in animate-slide-right pb-10">
      <SubHeader
        title="Venue Map"
        subtitle="Spicers Clovelly"
        onBack={() => setActiveTab(backTab)}
      />

      <div className="mt-6 px-6">
        {!ready ? (
          <p className="py-8 text-center text-sm text-gray-400">Loading map…</p>
        ) : !canView ? (
          <div
            className="rounded-2xl border bg-white/80 px-5 py-8 text-center text-sm text-gray-600"
            style={{ borderColor: theme.border }}
          >
            <p className="font-serif text-lg text-[#2a2723]">Map not available yet</p>
            {unlockHint && <p className="mt-3 leading-relaxed">{unlockHint}</p>}
          </div>
        ) : (
          <>
            <p className="mb-1 text-sm leading-relaxed text-gray-600">
              {hasOnSiteAccess
                ? "Your on-site map — find your room, the lawns, and Lake View Deck anytime."
                : "The estate map unlocks closer to the wedding. Pinch to zoom and scroll to explore."}
            </p>
            <VenueMapViewer />
          </>
        )}
      </div>
    </div>
  );
}
