/** Per-device flag: this browser has registered or signed in with a passkey. */
export const PASSKEY_DEVICE_READY_KEY = "wedding-passkey-device-ready";

export function isPasskeyDeviceReady(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PASSKEY_DEVICE_READY_KEY) === "1";
}

export function markPasskeyDeviceReady(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PASSKEY_DEVICE_READY_KEY, "1");
}

export function shouldShowPasskeyReminder(): boolean {
  return !isPasskeyDeviceReady();
}
