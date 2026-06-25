export const ANNITA_FAB_POSITION_KEY = "annita-fab-position";
export const ANNITA_FAB_HIDDEN_KEY = "annita-fab-hidden";

export type AnnitaFabPosition = {
  x: number;
  y: number;
};

export function readAnnitaFabHidden(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(ANNITA_FAB_HIDDEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeAnnitaFabHidden(hidden: boolean) {
  try {
    if (hidden) localStorage.setItem(ANNITA_FAB_HIDDEN_KEY, "1");
    else localStorage.removeItem(ANNITA_FAB_HIDDEN_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent("annita-fab:hidden", { detail: hidden }));
}

export function readAnnitaFabPosition(): AnnitaFabPosition | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ANNITA_FAB_POSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AnnitaFabPosition;
    if (typeof parsed.x === "number" && typeof parsed.y === "number") return parsed;
    return null;
  } catch {
    return null;
  }
}

export function writeAnnitaFabPosition(position: AnnitaFabPosition | null) {
  try {
    if (position) localStorage.setItem(ANNITA_FAB_POSITION_KEY, JSON.stringify(position));
    else localStorage.removeItem(ANNITA_FAB_POSITION_KEY);
  } catch {
    // ignore
  }
}

/** Bottom-centre dismiss target — fraction of viewport width/height */
export const ANNITA_DISMISS_ZONE = {
  x: 0.5,
  y: 0.88,
  radius: 44,
} as const;

export function isOverAnnitaDismissZone(x: number, y: number, viewportWidth: number, viewportHeight: number) {
  const centerX = viewportWidth * ANNITA_DISMISS_ZONE.x;
  const centerY = viewportHeight * ANNITA_DISMISS_ZONE.y;
  const dx = x - centerX;
  const dy = y - centerY;
  return Math.hypot(dx, dy) <= ANNITA_DISMISS_ZONE.radius;
}
