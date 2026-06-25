export const WEDDING_THEME_STORAGE_KEY = "wedding-theme";

export type WeddingThemeMode = "classic" | "rainbow";

/** Theme tokens — values are CSS variables so rainbow mode can override globally. */
export const theme = {
  gold: "var(--wedding-gold)",
  btnDark: "var(--wedding-btn-dark)",
  textDark: "var(--wedding-text-dark)",
  bg: "var(--wedding-bg)",
  border: "var(--wedding-border)",
  cardBg: "var(--wedding-card-bg)",
  rainbowGradient: "var(--wedding-rainbow-gradient)",
} as const;

export const HERO_IMAGE = "/hero.jpg";
export const HERO_FALLBACK = "/wedding-pavilion-placeholder.svg";

export function applyWeddingTheme(mode: WeddingThemeMode) {
  if (typeof document === "undefined") return;
  if (mode === "rainbow") {
    document.documentElement.dataset.theme = "rainbow";
  } else {
    delete document.documentElement.dataset.theme;
  }
}

export function readStoredWeddingTheme(): WeddingThemeMode {
  if (typeof window === "undefined") return "classic";
  try {
    return localStorage.getItem(WEDDING_THEME_STORAGE_KEY) === "rainbow" ? "rainbow" : "classic";
  } catch {
    return "classic";
  }
}
