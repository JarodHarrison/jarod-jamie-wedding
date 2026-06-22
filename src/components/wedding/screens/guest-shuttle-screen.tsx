"use client";

import { useEffect, useState } from "react";
import { Bus, RefreshCw } from "lucide-react";
import { ShuttleMap } from "@/components/shuttle/shuttle-map";
import { SubHeader } from "@/components/wedding/shared/sub-header";
import { theme } from "@/lib/theme";
import type { AppTab } from "@/types/wedding";
import type { ShuttleLiveState } from "@/types/shuttle";

type GuestShuttleScreenProps = {
  setActiveTab: (tab: AppTab) => void;
};

export function GuestShuttleScreen({ setActiveTab }: GuestShuttleScreenProps) {
  const [state, setState] = useState<ShuttleLiveState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    const res = await fetch("/api/shuttle/live");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Unable to load shuttle.");
      setLoading(false);
      return;
    }
    setState(data);
    setError("");
    setLoading(false);
  };

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => {
      void load();
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="animate-fade-in pb-10">
      <SubHeader title="Live Wedding Shuttle" subtitle="Courtesy bus" onBack={() => setActiveTab("guide")} />

      <div className="space-y-4 px-6 pt-6">
        {loading ? (
          <p className="text-center text-sm text-gray-400">Loading live shuttle...</p>
        ) : error ? (
          <p className="text-center text-sm text-red-500">{error}</p>
        ) : state ? (
          <>
            {!state.visible && (
              <div
                className="rounded-2xl border bg-white/70 p-4 text-sm text-gray-600"
                style={{ borderColor: theme.border }}
              >
                Live shuttle tracking will be available on the wedding weekend (25–27 September 2026).
              </div>
            )}

            <div
              className="rounded-2xl border bg-white p-5 shadow-sm"
              style={{ borderColor: theme.border }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Bus size={18} className="text-[#c3a379]" />
                <h2 className="font-serif text-lg text-[#2a2723]">Live Wedding Shuttle</h2>
              </div>
              <p className="text-sm leading-relaxed text-gray-600">{state.message}</p>

              {state.tracking && state.nextStop && (
                <div className="mt-4 space-y-2 border-t pt-4" style={{ borderColor: theme.border }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Next stop</p>
                  <p className="font-medium text-[#2a2723]">{state.nextStop.name}</p>
                  {state.etas.nextStop && (
                    <p className="text-sm text-[#c3a379]">
                      Estimated arrival: {state.etas.nextStop.arrivalLabel}
                    </p>
                  )}
                </div>
              )}

              {state.venue && (
                <div className="mt-4 space-y-1 border-t pt-4" style={{ borderColor: theme.border }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Final destination
                  </p>
                  <p className="font-medium text-[#2a2723]">{state.venue.name}</p>
                  {state.etas.venue && (
                    <p className="text-sm text-gray-600">
                      Estimated arrival: {state.etas.venue.arrivalLabel}
                    </p>
                  )}
                </div>
              )}
            </div>

            <ShuttleMap
              stops={state.stops}
              busLocation={state.location}
              nextStopId={state.nextStop?.id}
              className="h-72 w-full"
            />

            <button
              type="button"
              onClick={load}
              className="flex w-full items-center justify-center gap-2 rounded-xl border bg-white py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500"
              style={{ borderColor: theme.border }}
            >
              <RefreshCw size={12} /> Refresh
            </button>

            {!state.tracking && state.visible && (
              <p className="text-center text-xs text-gray-500">
                The shuttle location is temporarily unavailable. Please be ready at your scheduled pickup time.
              </p>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
