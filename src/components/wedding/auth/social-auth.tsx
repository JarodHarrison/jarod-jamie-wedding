"use client";

import { useCallback, useEffect, useState } from "react";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { Fingerprint, KeyRound } from "lucide-react";
import { theme } from "@/lib/theme";
import type { AdminUser, WeddingUser } from "@/types/wedding";

type AuthProviders = {
  google: boolean;
  passkeys: boolean;
};

type PasskeySettingsProps = {
  onMessage?: (message: string) => void;
};

export function PasskeySettings({ onMessage }: PasskeySettingsProps) {
  const [loading, setLoading] = useState(false);
  const [passkeyCount, setPasskeyCount] = useState(0);

  const loadPasskeys = useCallback(async () => {
    const res = await fetch("/api/auth/passkey");
    if (!res.ok) return;
    const data = await res.json();
    setPasskeyCount((data.passkeys ?? []).length);
  }, []);

  useEffect(() => {
    void loadPasskeys();
  }, [loadPasskeys]);

  const handleAddPasskey = async () => {
    if (!window.PublicKeyCredential) {
      onMessage?.("Passkeys aren't supported on this device or browser.");
      return;
    }

    setLoading(true);
    onMessage?.("");

    try {
      const optionsRes = await fetch("/api/auth/passkey/register/options", { method: "POST" });
      const optionsData = await optionsRes.json();
      if (!optionsRes.ok) {
        onMessage?.(optionsData.error ?? "Failed to start passkey setup.");
        return;
      }

      const registration = await startRegistration({ optionsJSON: optionsData.options });
      const verifyRes = await fetch("/api/auth/passkey/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registration),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        onMessage?.(verifyData.error ?? "Passkey setup failed.");
        return;
      }

      onMessage?.(verifyData.message ?? "Passkey added.");
      await loadPasskeys();
    } catch {
      onMessage?.("Passkey setup was cancelled or failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="mb-6 rounded-2xl border bg-white p-4 shadow-sm"
      style={{ borderColor: theme.border }}
    >
      <div className="mb-2 flex items-center gap-2">
        <Fingerprint size={16} className="text-[#c3a379]" />
        <h2 className="font-serif text-lg text-[#2a2723]">Passkey Sign-In</h2>
      </div>
      <p className="mb-3 text-xs text-gray-500">
        Use Face ID, fingerprint, or your device PIN for faster sign-in next time.
        {passkeyCount > 0 ? ` ${passkeyCount} passkey${passkeyCount === 1 ? "" : "s"} saved.` : ""}
      </p>
      <button
        type="button"
        onClick={handleAddPasskey}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-[10px] font-bold uppercase tracking-widest disabled:opacity-60"
        style={{ borderColor: theme.border, color: theme.btnDark }}
      >
        <KeyRound size={14} />
        {loading ? "Setting up..." : passkeyCount > 0 ? "Add Another Passkey" : "Add Passkey"}
      </button>
    </section>
  );
}

type UsePasskeyLoginOptions = {
  onGuestLogin: (user: WeddingUser, canAccessAdmin?: boolean) => void;
  onAdminLogin: (admin: AdminUser) => void;
  onError: (message: string) => void;
  setLoading: (loading: boolean) => void;
};

export async function signInWithPasskey({
  onGuestLogin,
  onAdminLogin,
  onError,
  setLoading,
}: UsePasskeyLoginOptions) {
  if (!window.PublicKeyCredential) {
    onError("Passkeys aren't supported on this device or browser.");
    return;
  }

  setLoading(true);
  onError("");

  try {
    const optionsRes = await fetch("/api/auth/passkey/login/options", { method: "POST" });
    const optionsData = await optionsRes.json();
    if (!optionsRes.ok) {
      onError(optionsData.error ?? "Failed to start passkey sign-in.");
      return;
    }

    const authentication = await startAuthentication({ optionsJSON: optionsData.options });
    const verifyRes = await fetch("/api/auth/passkey/login/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authentication),
    });
    const data = await verifyRes.json();

    if (!verifyRes.ok) {
      onError(data.error ?? "Passkey sign-in failed.");
      return;
    }

    if (data.user) {
      onGuestLogin(data.user, Boolean(data.canAccessAdmin));
      return;
    }

    if (data.admin) {
      onAdminLogin(data.admin);
      return;
    }

    onError("Passkey sign-in failed.");
  } catch {
    onError("Passkey sign-in was cancelled or failed.");
  } finally {
    setLoading(false);
  }
}

export function useAuthProviders() {
  const [providers, setProviders] = useState<AuthProviders>({ google: false, passkeys: true });

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((res) => res.json())
      .then((data) => setProviders({ google: Boolean(data.google), passkeys: Boolean(data.passkeys) }))
      .catch(() => {
        setProviders({ google: false, passkeys: true });
      });
  }, []);

  return providers;
}

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  google_not_configured: "Google sign-in isn't configured yet.",
  google_denied: "Google sign-in was cancelled.",
  google_state_invalid: "Google sign-in expired. Please try again.",
  google_no_account: "No account found for that Google email. Sign up first or use your password.",
  google_account_exists: "An account with this email already exists. Sign in instead.",
  google_invalid_client: "Google sign-in isn't configured correctly on the server. Please use email/password for now.",
  google_redirect_mismatch: "Google sign-in redirect mismatch. Contact Jarod & Jamie.",
  google_failed: "Google sign-in failed. Please try again.",
};
