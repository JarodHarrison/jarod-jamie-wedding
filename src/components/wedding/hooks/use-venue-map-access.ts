"use client";

import { useEffect, useState } from "react";
import { canViewVenueMap, venueMapUnlockHint } from "@/lib/venue-map";

type VenueMapAccessState = {
  ready: boolean;
  hasOnSiteAccess: boolean;
  canViewVenueMap: boolean;
  unlockHint: string | null;
};

export function useVenueMapAccess(isAdmin = false): VenueMapAccessState {
  const [state, setState] = useState<VenueMapAccessState>({
    ready: isAdmin,
    hasOnSiteAccess: isAdmin,
    canViewVenueMap: isAdmin,
    unlockHint: null,
  });

  useEffect(() => {
    if (isAdmin) {
      setState({
        ready: true,
        hasOnSiteAccess: true,
        canViewVenueMap: true,
        unlockHint: null,
      });
      return;
    }

    let cancelled = false;

    void fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const hasOnSiteAccess = Boolean(data.hasOnSiteAccess);
        setState({
          ready: true,
          hasOnSiteAccess,
          canViewVenueMap: canViewVenueMap(hasOnSiteAccess, new Date(), { isAdmin: false }),
          unlockHint: venueMapUnlockHint(hasOnSiteAccess),
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState({
          ready: true,
          hasOnSiteAccess: false,
          canViewVenueMap: false,
          unlockHint: venueMapUnlockHint(false),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  return state;
}
