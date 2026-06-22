"use client";

import { useState } from "react";
import { ChevronRight, Lock, Mail, User } from "lucide-react";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";
import { theme } from "@/lib/theme";
import { HeroImage } from "@/components/wedding/shared/hero-image";
import type { AdminUser, WeddingUser } from "@/types/wedding";

type LoginScreenProps = {
  onGuestLogin: (user: WeddingUser) => void;
  onAdminLogin: (admin: AdminUser) => void;
};

type AuthMode = "signin" | "signup" | "forgot";

export function LoginScreen({ onGuestLogin, onAdminLogin }: LoginScreenProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError("");
    setInfo("");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to send reset link.");
        return;
      }

      setInfo(data.message ?? "Check your email for a reset link.");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "forgot") {
      await handleForgotPassword(e);
      return;
    }

    setError("");
    setInfo("");
    setLoading(true);

    const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/signup";
    const payload =
      mode === "signin"
        ? { email, password }
        : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? (mode === "signin" ? "Login failed." : "Sign up failed."));
        return;
      }

      if (data.user) {
        onGuestLogin(data.user);
        return;
      }

      if (data.admin) {
        onAdminLogin(data.admin);
        return;
      }

      setError(mode === "signin" ? "Login failed." : "Sign up failed.");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === "signin" ? "Welcome" : mode === "signup" ? "Join Us" : "Forgot Password";

  return (
    <div className="animate-fade-in relative flex min-h-0 flex-1 flex-col items-center justify-center px-8">
      <div className="absolute inset-0 z-0">
        <HeroImage alt="Background" className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f7f4ee]/80 via-[#f7f4ee]/60 to-[#f7f4ee]" />
      </div>

      <div
        className="relative z-10 w-full max-w-sm rounded-[2rem] border bg-white/80 p-8 shadow-xl backdrop-blur-lg"
        style={{ borderColor: theme.border }}
      >
        <div className="mb-6 text-center">
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border bg-[#f7f4ee] text-[#c3a379]"
            style={{ borderColor: theme.border }}
          >
            <Lock size={20} />
          </div>
          <h1 className="mb-1 font-serif text-3xl text-[#2a2723]">{title}</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-[#c3a379]">
            Jarod & Jamie&apos;s Wedding
          </p>
        </div>

        {mode !== "forgot" && (
          <div className="mb-6 flex rounded-full bg-[#e2d5c4]/30 p-1 shadow-inner">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={`flex-1 rounded-full py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${mode === "signin" ? "bg-white text-[#2a2723] shadow-md" : "text-gray-500"}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`flex-1 rounded-full py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${mode === "signup" ? "bg-white text-[#2a2723] shadow-md" : "text-gray-500"}`}
            >
              Sign Up
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                autoComplete="name"
                placeholder="Full Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                className="w-full rounded-xl border bg-white py-4 pl-11 pr-4 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#c3a379]"
                style={{ borderColor: theme.border }}
                required
              />
            </div>
          )}
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              autoComplete="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                setInfo("");
              }}
              className="w-full rounded-xl border bg-white py-4 pl-11 pr-4 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#c3a379]"
              style={{ borderColor: theme.border }}
              required
            />
          </div>
          {mode !== "forgot" && (
            <div>
              <input
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder={
                  mode === "signup"
                    ? `Password (min. ${MIN_PASSWORD_LENGTH} characters)`
                    : "Password"
                }
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="w-full rounded-xl border bg-white px-4 py-4 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#c3a379]"
                style={{ borderColor: theme.border }}
                required
                minLength={mode === "signup" ? MIN_PASSWORD_LENGTH : undefined}
              />
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#c3a379] hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
          )}
          {mode === "forgot" && (
            <p className="text-center text-xs leading-relaxed text-gray-500">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
          )}
          {error && (
            <p className="text-center text-[10px] font-bold uppercase tracking-wider text-red-500">
              {error}
            </p>
          )}
          {info && (
            <p className="text-center text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              {info}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-xs font-bold uppercase tracking-widest shadow-md transition-transform active:scale-95 disabled:opacity-60"
            style={{ backgroundColor: theme.btnDark, color: theme.gold }}
          >
            {loading
              ? mode === "signin"
                ? "Signing in..."
                : mode === "signup"
                  ? "Creating account..."
                  : "Sending..."
              : mode === "signin"
                ? "Access App"
                : mode === "signup"
                  ? "Create Account"
                  : "Send Reset Link"}{" "}
            <ChevronRight size={14} />
          </button>
        </form>

        {mode === "forgot" && (
          <button
            type="button"
            onClick={() => switchMode("signin")}
            className="mt-4 w-full text-center text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-[#2a2723]"
          >
            Back to sign in
          </button>
        )}

        {mode === "signup" && (
          <p className="mt-6 text-center text-[10px] leading-relaxed text-gray-400">
            New accounts start with standard access. Jarod & Jamie may upgrade your permission for
            on-site or penthouse events.
          </p>
        )}
      </div>
    </div>
  );
}
