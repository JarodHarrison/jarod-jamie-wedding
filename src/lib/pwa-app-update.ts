import { APP_BUILD_ID } from "@/lib/app-build-id";

let reloading = false;

export function dispatchTabActivated(tab: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("wedding:tab-activated", { detail: { tab } }));
}

/** If a new deploy is live, reload so the installed PWA picks up fresh JS/CSS. */
export async function checkForAppUpdate(): Promise<void> {
  if (reloading || typeof window === "undefined") return;

  try {
    const res = await fetch("/api/app-version", { cache: "no-store" });
    if (!res.ok) return;

    const data = (await res.json()) as { buildId?: string };
    const serverBuildId = data.buildId?.trim();
    if (
      serverBuildId &&
      serverBuildId !== "development" &&
      serverBuildId !== APP_BUILD_ID
    ) {
      reloading = true;
      window.location.reload();
      return;
    }
  } catch {
    // Offline or transient error — keep using the current bundle.
  }

  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration?.update();
  } catch {
    // Non-fatal — push SW may not be registered yet.
  }
}
