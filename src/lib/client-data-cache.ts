const CACHE_PREFIX = "wedding-data:";

export function readClientCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeClientCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(data));
  } catch {
    // Storage full or private mode — ignore.
  }
}

/** Fetch JSON, persist on success, fall back to the last good payload offline or on error. */
export async function fetchJsonWithClientCache<T>(
  key: string,
  url: string,
  pick: (json: Record<string, unknown>) => T,
): Promise<T> {
  const cached = readClientCache<T>(key);

  try {
    const res = await fetch(url);
    if (!res.ok) return cached ?? (pick({}) as T);
    const json = (await res.json()) as Record<string, unknown>;
    const data = pick(json);
    writeClientCache(key, data);
    return data;
  } catch {
    return cached ?? (pick({}) as T);
  }
}
