"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, RefreshCw, X } from "lucide-react";
import type { SeatingTableKey } from "@/lib/seating-chart";
import { AdminSeatingImport } from "@/components/admin/admin-seating-import";
import type { SeatingChartPayload } from "@/lib/seating-chart";
import { theme } from "@/lib/theme";

type AdminSeatingChartProps = {
  onMessage: (message: string) => void;
};

type AssignTarget = {
  guestId: string;
  guestName: string;
  currentTable: SeatingTableKey | null;
} | null;

export function AdminSeatingChart({ onMessage }: AdminSeatingChartProps) {
  const [chart, setChart] = useState<SeatingChartPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTable, setEditingTable] = useState<SeatingTableKey | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [assignTarget, setAssignTarget] = useState<AssignTarget>(null);

  const loadChart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seating", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        onMessage(data.error ?? "Failed to load seating chart.");
        return;
      }
      setChart(data);
    } catch {
      onMessage("Failed to load seating chart.");
    } finally {
      setLoading(false);
    }
  }, [onMessage]);

  useEffect(() => {
    void loadChart();
  }, [loadChart]);

  const assignGuest = async (guestId: string, tableKey: SeatingTableKey | null) => {
    setSaving(true);
    onMessage("");
    try {
      const res = await fetch("/api/admin/seating", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assign", guestId, tableKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        onMessage(data.error ?? "Failed to update seating.");
        return;
      }
      setChart(data);
      setAssignTarget(null);
    } catch {
      onMessage("Failed to update seating.");
    } finally {
      setSaving(false);
    }
  };

  const saveTableName = async () => {
    if (!editingTable) return;
    const label = editLabel.trim();
    if (!label) {
      onMessage("Table name is required.");
      return;
    }

    setSaving(true);
    onMessage("");
    try {
      const res = await fetch("/api/admin/seating", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rename", tableKey: editingTable, label }),
      });
      const data = await res.json();
      if (!res.ok) {
        onMessage(data.error ?? "Failed to rename table.");
        return;
      }
      setEditingTable(null);
      await loadChart();
    } catch {
      onMessage("Failed to rename table.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="py-8 text-center text-sm text-gray-400">Loading seating chart…</p>;
  }

  if (!chart) {
    return <p className="py-8 text-center text-sm text-gray-400">Could not load seating chart.</p>;
  }

  const guestTables = chart.tables.filter((table) => !table.isBridal);
  const bridalTable = chart.tables.find((table) => table.isBridal);

  return (
    <div>
      <AdminSeatingImport
        onMessage={onMessage}
        onImported={(nextChart) => setChart(nextChart)}
      />

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg text-[#2a2723]">Reception seating</h2>
          <p className="text-xs text-gray-500">
            Tap a guest to move them. Our table is the grooms&apos; bridal table.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadChart()}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#2a2723]"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex min-w-max gap-3">
          {guestTables.map((table) => (
            <TableColumn
              key={table.key}
              table={table}
              onEdit={() => {
                setEditingTable(table.key);
                setEditLabel(table.label);
              }}
              onGuestClick={(guest) =>
                setAssignTarget({
                  guestId: guest.id,
                  guestName: guest.displayName,
                  currentTable: table.key,
                })
              }
            />
          ))}
        </div>
      </div>

      {bridalTable && (
        <div className="mb-6">
          <TableColumn
            table={bridalTable}
            subtitle="Grooms' table"
            wide
            onEdit={() => {
              setEditingTable(bridalTable.key);
              setEditLabel(bridalTable.label);
            }}
            onGuestClick={(guest) =>
              setAssignTarget({
                guestId: guest.id,
                guestName: guest.displayName,
                currentTable: bridalTable.key,
              })
            }
          />
        </div>
      )}

      <section
        className="rounded-2xl border bg-white p-4 shadow-sm"
        style={{ borderColor: theme.border }}
      >
        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Unassigned ({chart.unassigned.length})
        </h3>
        {chart.unassigned.length === 0 ? (
          <p className="text-sm text-gray-500">Every attending guest has a table.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {chart.unassigned.map((guest) => (
              <button
                key={guest.id}
                type="button"
                onClick={() =>
                  setAssignTarget({
                    guestId: guest.id,
                    guestName: guest.displayName,
                    currentTable: null,
                  })
                }
                className="rounded-xl border bg-[#faf8f4] px-3 py-2 text-left text-sm text-[#2a2723] transition-colors hover:bg-[#f0ebe3]"
                style={{ borderColor: theme.border }}
              >
                {guest.displayName}
              </button>
            ))}
          </div>
        )}
      </section>

      {editingTable && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div
            className="w-full max-w-sm rounded-2xl border bg-white p-5 shadow-xl"
            style={{ borderColor: theme.border }}
          >
            <h3 className="font-serif text-lg text-[#2a2723]">Rename table</h3>
            <input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className="mt-4 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#c3a379]"
              style={{ borderColor: theme.border }}
              autoFocus
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setEditingTable(null)}
                className="flex-1 rounded-xl border px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500"
                style={{ borderColor: theme.border }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveTableName()}
                className="flex-1 rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
                style={{ backgroundColor: theme.btnDark, color: theme.gold }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div
            className="max-h-[80vh] w-full max-w-sm overflow-hidden rounded-2xl border bg-white shadow-xl"
            style={{ borderColor: theme.border }}
          >
            <div
              className="flex items-center justify-between border-b px-5 py-4"
              style={{ borderColor: theme.border }}
            >
              <div>
                <h3 className="font-serif text-lg text-[#2a2723]">Move guest</h3>
                <p className="text-xs text-gray-500">{assignTarget.guestName}</p>
              </div>
              <button
                type="button"
                onClick={() => setAssignTarget(null)}
                className="rounded-full p-2 text-gray-400 hover:bg-[#f7f4ee]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[50vh] space-y-2 overflow-y-auto px-5 py-4">
              {chart.tables.map((table) => (
                <button
                  key={table.key}
                  type="button"
                  disabled={saving || assignTarget.currentTable === table.key}
                  onClick={() => void assignGuest(assignTarget.guestId, table.key)}
                  className="flex w-full items-center justify-between rounded-xl border bg-[#faf8f4] px-4 py-3 text-left text-sm disabled:opacity-50"
                  style={{ borderColor: theme.border }}
                >
                  <span className="text-[#2a2723]">
                    {table.label}
                    {table.isBridal && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-gray-400">
                        Grooms&apos; table
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {table.guests.length}/{table.maxGuests}
                  </span>
                </button>
              ))}
              <button
                type="button"
                disabled={saving || assignTarget.currentTable === null}
                onClick={() => void assignGuest(assignTarget.guestId, null)}
                className="w-full rounded-xl border px-4 py-3 text-left text-sm text-gray-600 disabled:opacity-50"
                style={{ borderColor: theme.border }}
              >
                Unassigned
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TableColumn({
  table,
  subtitle,
  wide,
  onEdit,
  onGuestClick,
}: {
  table: SeatingChartPayload["tables"][number];
  subtitle?: string;
  wide?: boolean;
  onEdit: () => void;
  onGuestClick: (guest: { id: string; displayName: string }) => void;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border bg-[#faf8f4] shadow-sm ${wide ? "w-full" : "w-44 shrink-0"}`}
      style={{ borderColor: theme.border }}
    >
      <div
        className="flex items-center justify-between border-b px-3 py-3"
        style={{ borderColor: theme.border }}
      >
        <div className="min-w-0">
          <h3 className="truncate font-serif text-base text-[#2a2723]">{table.label}</h3>
          {subtitle && <p className="text-[9px] uppercase tracking-wider text-gray-400">{subtitle}</p>}
          <p className="text-[9px] text-gray-400">
            {table.guests.length}/{table.maxGuests}
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-white hover:text-[#2a2723]"
          aria-label={`Rename ${table.label}`}
        >
          <Pencil size={14} />
        </button>
      </div>
      <div className={`space-y-2 overflow-y-auto p-2 ${wide ? "max-h-48" : "max-h-[22rem]"}`}>
        {table.guests.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-gray-400">No guests yet</p>
        ) : (
          table.guests.map((guest) => (
            <button
              key={guest.id}
              type="button"
              onClick={() => onGuestClick(guest)}
              className="w-full rounded-xl border bg-white px-3 py-2.5 text-left text-sm text-[#2a2723] transition-colors hover:bg-[#f7f4ee]"
              style={{ borderColor: theme.border }}
            >
              {guest.displayName}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
