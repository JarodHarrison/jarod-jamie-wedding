"use client";

import { useLayoutEffect } from "react";
import { applyWeddingTheme, readStoredWeddingTheme } from "@/lib/theme";

/** Applies stored theme before paint: no <script> tags (avoids React 19 console noise). */
export function WeddingThemeBoot() {
  useLayoutEffect(() => {
    applyWeddingTheme(readStoredWeddingTheme());
  }, []);

  return null;
}
