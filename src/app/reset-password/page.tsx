"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Lock } from "lucide-react";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";
import { theme } from "@/lib/theme";
import { PhoneFrame } from "@/components/wedding/phone-frame";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [guestName, setGuestName] = useState<string | null>(null);
  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setValidating(false);
      setValid(false);
      return;
    }

    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        setValid(Boolean(data.valid));
        setGuestName(data.guestName ?? null);
      })
      .catch(() => setValid(false))
      .finally(() => setValidating(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to reset password.");
        return;
      }

      setSuccess(data.message ?? "Password updated. You can sign in now.");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 py-10">
      <div
        className="w-full max-w-sm rounded-[2rem] border bg-white/90 p-8 shadow-xl backdrop-blur-lg"
        style={{ borderColor: theme.border }}
      >
        <div className="mb-6 text-center">
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border bg-[#f7f4ee] text-[#c3a379]"
            style={{ borderColor: theme.border }}
          >
            <Lock size={20} />
          </div>
          <h1 className="mb-1 font-serif text-3xl text-[#2a2723]">Reset Password</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-[#c3a379]">
            Jarod &amp; Jamie&apos;s Wedding
          </p>
        </div>

        {validating ? (
          <p className="text-center text-sm text-gray-500">Checking your link…</p>
        ) : !valid ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-gray-600">
              This reset link is invalid or has expired. Request a new one from the sign-in page.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#c3a379]"
            >
              Back to sign in <ChevronRight size={12} />
            </Link>
          </div>
        ) : success ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-emerald-700">{success}</p>
            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-xs font-bold uppercase tracking-widest shadow-md"
              style={{ backgroundColor: theme.btnDark, color: theme.gold }}
            >
              Sign In <ChevronRight size={14} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {guestName && (
              <p className="text-center text-sm text-gray-600">
                Hi {guestName} — choose a new password below.
              </p>
            )}
            <input
              type="password"
              autoComplete="new-password"
              placeholder={`New password (min. ${MIN_PASSWORD_LENGTH} characters)`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border bg-white px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#c3a379]"
              style={{ borderColor: theme.border }}
              required
              minLength={MIN_PASSWORD_LENGTH}
            />
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border bg-white px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#c3a379]"
              style={{ borderColor: theme.border }}
              required
              minLength={MIN_PASSWORD_LENGTH}
            />
            {error && (
              <p className="text-center text-[10px] font-bold uppercase tracking-wider text-red-500">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-xs font-bold uppercase tracking-widest shadow-md disabled:opacity-60"
              style={{ backgroundColor: theme.btnDark, color: theme.gold }}
            >
              {loading ? "Saving..." : "Update Password"} <ChevronRight size={14} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <PhoneFrame>
      <Suspense
        fallback={
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <p className="text-sm text-gray-500">Loading…</p>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </PhoneFrame>
  );
}
