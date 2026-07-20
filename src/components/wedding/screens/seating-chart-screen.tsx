"use client";

import { useEffect, useState } from "react";
import { SubHeader } from "@/components/wedding/shared/sub-header";
import type { SeatingChartPayload } from "@/lib/seating-chart";
import { theme } from "@/lib/theme";
import type { AppTab } from "@/types/wedding";

type SeatingChartScreenProps = {
  setActiveTab: (tab: AppTab) => void;
};

export function SeatingChartScreen({ setActiveTab }: SeatingChartScreenProps) {
  const [chart, setChart] = useState<SeatingChartPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/guest/seating", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Could not load seating chart.");
          return;
        }
        setChart(data);
      } catch {
        setError("Could not load seating chart.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const guestTables = chart?.tables.filter((table) => !table.isBridal) ?? [];
  const bridalTable = chart?.tables.find((table) => table.isBridal);

  return (
    <div className="animate-fade-in flex h-full flex-col">
      <SubHeader title="Seating Chart" subtitle="The Pavilion" onBack={() => setActiveTab("itinerary")} />

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {loading && <p className="text-center text-sm text-gray-400">Loading seating chart…</p>}
        {error && <p className="text-center text-sm text-red-500">{error}</p>}

        {!loading && !error && chart && (
          <div className="space-y-6">
            {chart.yourTableLabel ? (
              <div
                className="rounded-2xl border bg-white p-5 text-center shadow-sm"
                style={{ borderColor: theme.border }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">You&apos;re at</p>
                <p className="mt-1 font-serif text-2xl text-[#2a2723]">{chart.yourTableLabel}</p>
              </div>
            ) : (
              <div
                className="rounded-2xl border bg-white p-5 text-center shadow-sm"
                style={{ borderColor: theme.border }}
              >
                <p className="text-sm text-gray-500">Your table hasn&apos;t been assigned yet. Check back soon.</p>
              </div>
            )}

            <div
              className="rounded-2xl border bg-white p-5 shadow-sm"
              style={{ borderColor: theme.border }}
            >
              <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Room layout
              </p>
              <div className="mx-auto max-w-md">
                <div className="grid grid-cols-3 gap-3">
                  {guestTables.map((table) => (
                    <LayoutTable
                      key={table.key}
                      label={table.label}
                      count={table.guests.length}
                      highlighted={chart.yourTableKey === table.key}
                      tall
                    />
                  ))}
                </div>
                {bridalTable && (
                  <div className="mt-4 flex justify-center">
                    <LayoutTable
                      label={bridalTable.label}
                      subtitle="Grooms' table"
                      count={bridalTable.guests.length}
                      highlighted={chart.yourTableKey === bridalTable.key}
                      wide
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {chart.tables.map((table) => (
                <section
                  key={table.key}
                  className="rounded-2xl border bg-white p-4 shadow-sm"
                  style={{
                    borderColor: chart.yourTableKey === table.key ? theme.gold : theme.border,
                  }}
                >
                  <div className="mb-3 flex items-baseline justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-lg text-[#2a2723]">{table.label}</h3>
                      {table.isBridal && (
                        <p className="text-[10px] uppercase tracking-wider text-gray-400">Grooms&apos; table</p>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {table.guests.length}/{table.maxGuests}
                    </span>
                  </div>
                  {table.guests.length === 0 ? (
                    <p className="text-sm text-gray-400">No guests seated yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {table.guests.map((guest) => (
                        <li
                          key={guest.id}
                          className={`rounded-xl px-3 py-2 text-sm ${
                            guest.isYou
                              ? "bg-[#2a2723] font-medium text-[#c3a379]"
                              : "bg-[#faf8f4] text-[#2a2723]"
                          }`}
                        >
                          {guest.displayName}
                          {guest.isYou && (
                            <span className="ml-2 text-[10px] uppercase tracking-wider opacity-80">You</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LayoutTable({
  label,
  subtitle,
  count,
  highlighted,
  tall,
  wide,
}: {
  label: string;
  subtitle?: string;
  count: number;
  highlighted: boolean;
  tall?: boolean;
  wide?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border px-2 py-3 text-center ${
        highlighted ? "border-[#c3a379] bg-[#faf8f4]" : "border-[#e2d5c4] bg-[#f7f4ee]"
      } ${tall ? "min-h-28" : ""} ${wide ? "w-full max-w-xs min-h-16" : ""}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#2a2723]">{label}</p>
      {subtitle && <p className="text-[8px] uppercase tracking-wider text-gray-400">{subtitle}</p>}
      <p className="mt-1 text-[9px] text-gray-400">{count} guests</p>
    </div>
  );
}
