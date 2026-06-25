"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyWeddingTheme,
  readStoredWeddingTheme,
  WEDDING_THEME_STORAGE_KEY,
  type WeddingThemeMode,
} from "@/lib/theme";

type WeddingThemeContextValue = {
  themeMode: WeddingThemeMode;
  setThemeMode: (mode: WeddingThemeMode) => void;
  toggleTheme: () => void;
  isRainbow: boolean;
};

const WeddingThemeContext = createContext<WeddingThemeContextValue | null>(null);

export function WeddingThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<WeddingThemeMode>("classic");

  useEffect(() => {
    const stored = readStoredWeddingTheme();
    setThemeModeState(stored);
    applyWeddingTheme(stored);
  }, []);

  const setThemeMode = useCallback((mode: WeddingThemeMode) => {
    setThemeModeState(mode);
    applyWeddingTheme(mode);
    try {
      localStorage.setItem(WEDDING_THEME_STORAGE_KEY, mode);
    } catch {
      // ignore private browsing
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeModeState((current) => {
      const next: WeddingThemeMode = current === "rainbow" ? "classic" : "rainbow";
      applyWeddingTheme(next);
      try {
        localStorage.setItem(WEDDING_THEME_STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      toggleTheme,
      isRainbow: themeMode === "rainbow",
    }),
    [setThemeMode, themeMode, toggleTheme],
  );

  return <WeddingThemeContext.Provider value={value}>{children}</WeddingThemeContext.Provider>;
}

export function useWeddingTheme() {
  const context = useContext(WeddingThemeContext);
  if (!context) {
    throw new Error("useWeddingTheme must be used within WeddingThemeProvider");
  }
  return context;
}
