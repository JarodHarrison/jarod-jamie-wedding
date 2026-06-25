const CACHE_KEY = "wedding-offline-v1";

type OfflineBundle = {
  savedAt: string;
  itineraryHtml?: string;
  faqSnippets?: string[];
};

export function saveOfflineBundle(partial: Omit<OfflineBundle, "savedAt">) {
  if (typeof window === "undefined") return;
  try {
    const existing = loadOfflineBundle();
    const next: OfflineBundle = {
      savedAt: new Date().toISOString(),
      ...existing,
      ...partial,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota errors
  }
}

export function loadOfflineBundle(): OfflineBundle | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OfflineBundle;
  } catch {
    return null;
  }
}
