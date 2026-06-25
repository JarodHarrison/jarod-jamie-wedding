"use client";

import { useRef, useState } from "react";
import { BedDouble, Upload } from "lucide-react";
import { theme } from "@/lib/theme";

type AdminRoomImportProps = {
  onMessage: (message: string) => void;
  onImported: () => void;
};

type RoomImportResult = {
  matched: number;
  updated: number;
  unmatched: number;
  errors: { row: number; message: string; guestName?: string }[];
  unmatchedGuests: { row: number; guestName: string }[];
};

export function AdminRoomImport({ onMessage, onImported }: AdminRoomImportProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastResult, setLastResult] = useState<RoomImportResult | null>(null);

  const handleImport = async (event: React.FormEvent) => {
    event.preventDefault();

    const file = fileRef.current?.files?.[0];
    if (!file) {
      onMessage("Choose the Spicers room allocation spreadsheet.");
      return;
    }

    setUploading(true);
    onMessage("");
    setLastResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/rooms/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        onMessage(data.error ?? "Room import failed.");
        return;
      }

      setLastResult(data as RoomImportResult);

      if (data.updated === 0) {
        onMessage(
          `No rooms were assigned — ${data.unmatched} guest${data.unmatched === 1 ? "" : "s"} could not be matched by name.`,
        );
      } else {
        onMessage(
          `Room allocation imported — ${data.updated} guest${data.updated === 1 ? "" : "s"} updated${
            data.unmatched > 0 ? `, ${data.unmatched} unmatched` : ""
          }.`,
        );
      }

      if (fileRef.current) fileRef.current.value = "";
      onImported();
    } catch {
      onMessage("Room import failed. Please try again.");
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
        <BedDouble size={14} />
        {open ? "Hide room allocation import" : "Import room allocation"}
      </button>

      {open && (
        <form
          onSubmit={handleImport}
          className="mt-4 space-y-4 rounded-2xl border bg-white p-4 shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <p className="text-sm leading-relaxed text-gray-600">
            Upload the Spicers <strong className="font-medium">Rooming Allocation List</strong> spreadsheet
            (.xlsx). Guests are matched by <strong className="font-medium">name</strong> and shown their
            assigned room in the app under <em>Where I&apos;m Staying</em>.
          </p>

          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#f7f4ee] file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-wider"
          />

          <button
            type="submit"
            disabled={uploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-60"
            style={{ backgroundColor: theme.btnDark, color: theme.gold }}
          >
            <Upload size={14} />
            {uploading ? "Importing…" : "Upload room spreadsheet"}
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
