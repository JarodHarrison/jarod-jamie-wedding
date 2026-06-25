"use client";

import { useEffect, useState } from "react";
import {
  getPhaseLabel,
  getWeddingPhase,
  isWeddingFeatureVisible,
  type WeddingFeature,
  type WeddingPhase,
} from "@/lib/wedding-event";

export function useWeddingPhase() {
  const [phase, setPhase] = useState<WeddingPhase>(() => getWeddingPhase());

  useEffect(() => {
    const refresh = () => setPhase(getWeddingPhase());
    refresh();

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    const msUntilMidnight = () => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 0, 0);
      return next.getTime() - now.getTime();
    };

    let timeout = window.setTimeout(function tick() {
      refresh();
      timeout = window.setTimeout(tick, msUntilMidnight());
    }, msUntilMidnight());

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.clearTimeout(timeout);
    };
  }, []);

  return {
    phase,
    phaseLabel: getPhaseLabel(phase),
    isFeatureVisible: (feature: WeddingFeature) => isWeddingFeatureVisible(feature),
  };
}
