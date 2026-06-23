const MAPS_SCRIPT_ID = "google-maps-shuttle";

export function getMapsApiKey() {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";
}

export function loadGoogleMaps(apiKey: string, onAuthFailure: () => void): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Maps only load in the browser"));

  if (window.google?.maps) return Promise.resolve();

  window.gm_authFailure = onAuthFailure;

  const existing = document.getElementById(MAPS_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Maps failed to load")));
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Maps failed to load"));
    document.head.appendChild(script);
  });
}

declare global {
  interface Window {
    gm_authFailure?: () => void;
    google?: {
      maps?: unknown;
    };
  }
}
