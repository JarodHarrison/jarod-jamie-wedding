"use client";

import { useRef, useState } from "react";
import { LayoutGrid, Upload } from "lucide-react";
import type { SeatingChartPayload } from "@/lib/seating-chart";
import { theme } from "@/lib/theme";

type AdminSeatingImportProps = {
  onMessage: (message: string) => void;
  onImported: (chart: SeatingChartPayload) => void;
};

type SeatingImportResult = {
  matched: number;
  updated: number;
  unmatched: number;
  errors: { row: number; message: string; guestName?: string }[];
  unmatchedGuests: { row: number; guestName: string }[];
  chart?: SeatingChartPayload;
};

export function AdminSeatingImport({ onMessage, onImported }: AdminSeatingImportProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastResult, setLastResult] = useState<SeatingImportResult | null>(null);

  const handleImport = async (event: React.FormEvent) => {
    event.preventDefault();

    const file = fileRef.current?.files?.[0];
    if (!file) {
      onMessage("Choose a seating chart CSV.");
      return;
    }

    setUploading(true);
    onMessage("");
    setLastResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/seating/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        onMessage(data.error ?? "Seating import failed.");
        return;
      }

      setLastResult(data as SeatingImportResult);

      if (data.updated === 0) {
        onMessage(
          `No seats were assigned: ${data.unmatched} guest${data.unmatched === 1 ? "" : "s"} could not be matched by name.`,
        );
      } else {
        onMessage(
          `Seating imported: ${data.updated} guest${data.updated === 1 ? "" : "s"} seated${
            data.unmatched > 0 ? `, ${data.unmatched} unmatched` : ""
          }.`,
        );
      }

      if (data.chart) {
        onImported(data.chart);
      }

      if (fileRef.current) fileRef.current.value = "";
    } catch {
      onMessage("Seating import failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border bg-white py-3.5 text-xs font-bold uppercase tracking-widest shadow-sm"
        style={{ borderColor: theme.border, color: theme.btnDark }}
      >
        <LayoutGrid size={14} />
        {open ? "Hide CSV import" : "Import seating CSV"}
      </button>

      {open && (
        <form
          onSubmit={handleImport}
          className="mt-4 space-y-4 rounded-2xl border bg-white p-4 shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <p className="text-sm leading-relaxed text-gray-600">
            Upload a CSV with one row per guest (<strong className="font-medium">name, table</strong>)
            or a wide layout with table names across the top row (
            <strong className="font-medium">Left Table, Centre Table, Right Table, Our Table</strong>
            ). Guests are matched by name.
          </p>

          <a
            href="/api/admin/seating/import"
            className="inline-block text-xs font-bold uppercase tracking-wider text-[#c3a379] underline"
          >
            Download CSV template
          </a>

          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#f7f4ee] file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-wider"
          />

          <button
            type="submit"
            disabled={uploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-60"
            style={{ backgroundColor: theme.btnDark, color: theme.gold }}
          >
            <Upload size={14} />
            {uploading ? "Importing…" : "Upload seating CSV"}
          </button>

          {lastResult && lastResult.unmatchedGuests.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <p className="mb-2 font-bold uppercase tracking-wider">Unmatched guests</p>
              <ul className="space-y-1">
                {lastResult.unmatchedGuests.slice(0, 12).map((entry) => (
                  <li key={`${entry.row}-${entry.guestName}`}>
                    Row {entry.row}: {entry.guestName}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
