"use client";

import { useCallback, useEffect, useState } from "react";
import { Bus, LogOut, MapPin, Navigation } from "lucide-react";
import { theme } from "@/lib/theme";
import { useDriverLocationTracking } from "@/components/shuttle/use-driver-location";
import type { ShuttleLiveState } from "@/types/shuttle";

const CONSENT_TEXT =
  "By starting shuttle tracking, you agree to share your live location with wedding guests for the purpose of showing the shuttle's current location and estimated arrival times. Tracking only occurs while this session is active and will stop when you press Stop Tracking. Keep this screen open during the shuttle run.";

export function DriverPortal() {
  const [pin, setPin] = useState("");
  const [driver, setDriver] = useState<{ id: string; name: string } | null>(null);
  const [live, setLive] = useState<ShuttleLiveState | null>(null);
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const { error: locationError, lastSentAt } = useDriverLocationTracking(tracking);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/shuttle/driver/me");
    const data = await res.json();
    setDriver(data.driver);
    setLive(data.live ?? null);
    setTracking(!!data.activeSession);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    const init = async () => {
      if (token) {
        const res = await fetch("/api/shuttle/driver/magic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (res.ok) {
          window.history.replaceState({}, "", "/driver");
        } else {
          const data = await res.json();
          setError(data.error ?? "Magic link failed.");
        }
      }
      await refresh();
      setLoading(false);
    };

    void init();
  }, [refresh]);

  useEffect(() => {
    if (!tracking) return;
    const interval = window.setInterval(() => {
      void refresh();
    }, 8000);
    return () => window.clearInterval(interval);
  }, [tracking, refresh]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/shuttle/driver/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Login failed.");
      return;
    }
    setDriver(data.driver);
    setPin("");
    await refresh();
  };

  const handleLogout = async () => {
    await fetch("/api/shuttle/driver/me", { method: "DELETE" });
    setDriver(null);
    setTracking(false);
    setLive(null);
  };

  const startTracking = async () => {
    setActionLoading(true);
    setError("");
    const res = await fetch("/api/shuttle/driver/session/start", { method: "POST" });
    const data = await res.json();
    setActionLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not start tracking.");
      return;
    }
    setTracking(true);
    await refresh();
  };

  const stopTracking = async () => {
    setActionLoading(true);
    const res = await fetch("/api/shuttle/driver/session/stop", { method: "POST" });
    setActionLoading(false);
    if (res.ok) {
      setTracking(false);
      await refresh();
    }
  };

  const updateStop = async (action: "arrived" | "departed") => {
    setActionLoading(true);
    setError("");
    const res = await fetch("/api/shuttle/driver/stop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    setActionLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not update stop.");
      return;
    }
    await refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f7f4ee]">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading driver portal...</p>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f7f4ee] px-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-3xl border bg-white p-8 shadow-lg"
          style={{ borderColor: theme.border }}
        >
          <div className="mb-6 text-center">
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.btnDark, color: theme.gold }}
            >
              <Bus size={24} />
            </div>
            <h1 className="font-serif text-2xl text-[#2a2723]">Driver Portal</h1>
            <p className="mt-2 text-sm text-gray-500">Enter your one-time PIN or open your magic link.</p>
          </div>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Driver PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="mb-4 w-full rounded-xl border px-4 py-3 text-center text-lg tracking-[0.3em]"
            style={{ borderColor: theme.border }}
            required
          />
          {error && <p className="mb-3 text-center text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-xl py-3 text-xs font-bold uppercase tracking-widest"
            style={{ backgroundColor: theme.btnDark, color: theme.gold }}
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  const nextStop = live?.nextStop;
  const currentStop = live?.stops.find((s) => s.status === "ARRIVED");

  return (
    <div className="min-h-dvh bg-[#f7f4ee] px-4 py-6 pb-10">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Driver</p>
            <h1 className="font-serif text-2xl text-[#2a2723]">{driver.name}</h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-400"
          >
            <LogOut size={12} /> Sign Out
          </button>
        </div>

        {!tracking ? (
          <div className="rounded-3xl border bg-white p-6 shadow-sm" style={{ borderColor: theme.border }}>
            <p className="mb-6 text-sm leading-relaxed text-gray-600">{CONSENT_TEXT}</p>
            <button
              type="button"
              disabled={actionLoading}
              onClick={startTracking}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-5 text-sm font-bold uppercase tracking-widest shadow-lg disabled:opacity-60"
              style={{ backgroundColor: theme.btnDark, color: theme.gold }}
            >
              <Navigation size={18} /> Start Shuttle Tracking
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className="rounded-3xl border bg-white p-5 shadow-sm"
              style={{ borderColor: theme.border }}
            >
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                Tracking active
              </p>
              <p className="text-sm text-gray-600">Keep this screen open during the shuttle run.</p>
              {lastSentAt && (
                <p className="mt-2 text-[10px] text-gray-400">
                  Last GPS upload: {new Date(lastSentAt).toLocaleTimeString("en-AU")}
                </p>
              )}
            </div>

            <div className="rounded-3xl border bg-white p-5 shadow-sm" style={{ borderColor: theme.border }}>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
                Route status
              </p>
              {nextStop ? (
                <div className="mb-2 flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-[#c3a379]" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Next stop</p>
                    <p className="font-medium text-[#2a2723]">{nextStop.name}</p>
                    <p className="text-xs text-gray-500">{nextStop.address}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">All stops completed.</p>
              )}
              {currentStop && (
                <p className="mt-3 text-sm text-emerald-700">
                  Currently at: {currentStop.name}
                </p>
              )}
              <div className="mt-4 space-y-2">
                {live?.stops.map((stop) => (
                  <div key={stop.id} className="flex justify-between text-xs">
                    <span className="text-gray-600">{stop.stopOrder}. {stop.name}</span>
                    <span className="font-bold uppercase tracking-wider text-gray-400">{stop.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={actionLoading || nextStop?.status === "ARRIVED"}
                onClick={() => updateStop("arrived")}
                className="rounded-2xl border bg-white py-4 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                style={{ borderColor: theme.border, color: theme.btnDark }}
              >
                Arrived at Stop
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => updateStop("departed")}
                className="rounded-2xl border bg-white py-4 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                style={{ borderColor: theme.border, color: theme.btnDark }}
              >
                Departed Stop
              </button>
            </div>

            <button
              type="button"
              disabled={actionLoading}
              onClick={stopTracking}
              className="w-full rounded-2xl border border-red-200 bg-red-50 py-4 text-[10px] font-bold uppercase tracking-widest text-red-600"
            >
              Stop Tracking
            </button>
          </div>
        )}

        {(error || locationError) && (
          <p className="mt-4 text-center text-xs text-red-500">{error || locationError}</p>
        )}
      </div>
    </div>
  );
}
