"use client";

import { useEffect } from "react";
import type { AppTab } from "@/types/wedding";

/** Re-run `onRefresh` whenever the guest navigates to this tab. */
export function useTabRefresh(tab: AppTab, onRefresh: () => void) {
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ tab: AppTab }>).detail;
      if (detail?.tab === tab) onRefresh();
    };

    window.addEventListener("wedding:tab-activated", handler);
    return () => window.removeEventListener("wedding:tab-activated", handler);
  }, [tab, onRefresh]);
}
