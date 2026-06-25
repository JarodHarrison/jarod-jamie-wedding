"use client";

import { useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { theme } from "@/lib/theme";
import { GUEST_IMPORT_EMAIL_DOMAIN } from "@/lib/guest-spreadsheet-import";

type AdminGuestImportProps = {
  onMessage: (message: string) => void;
  onImported: () => void;
};

type ImportResult = {
  created: number;
  updated: number;
  skipped: number;
  invited: number;
  format?: "standard" | "sayi";
  generatedEmailCount?: number;
  extraColumns?: string[];
  mergeStats?: { matched: number; attendingOnly: number; rsvpOnly: number };
  errors: { row: number; message: string; email?: string }[];
  passwords: { name: string; email: string; password: string }[];
};

export function AdminGuestImport({ onMessage, onImported }: AdminGuestImportProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const attendingFileRef = useRef<HTMLInputElement>(null);
  const rsvpFileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importMode, setImportMode] = useState<"single" | "sayi-dual">("single");
  const [mode, setMode] = useState<"upsert" | "create">("upsert");
  const [sendInvites, setSendInvites] = useState(false);
  const [lastResult, setLastResult] = useState<ImportResult | null>(null);

  const handleImport = async (event: React.FormEvent) => {
    event.preventDefault();

    if (importMode === "sayi-dual") {
      const attending = attendingFileRef.current?.files?.[0];
      const rsvp = rsvpFileRef.current?.files?.[0];
      if (!attending || !rsvp) {
        onMessage("Choose both the Sayi attending CSV and RSVP CSV.");
        return;
      }
    } else {
      const file = fileRef.current?.files?.[0];
      if (!file) {
        onMessage("Choose a CSV file to import.");
        return;
      }
    }

    setUploading(true);
    onMessage("");
    setLastResult(null);

    try {
      const formData = new FormData();
      if (importMode === "sayi-dual") {
        formData.append("attendingFile", attendingFileRef.current!.files![0]);
        formData.append("rsvpFile", rsvpFileRef.current!.files![0]);
      } else {
        formData.append("file", fileRef.current!.files![0]);
      }
      formData.append("mode", mode);
      formData.append("sendInvites", sendInvites ? "true" : "false");

      const res = await fetch("/api/admin/guests/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        onMessage(data.error ?? "Import failed.");
        return;
      }

      setLastResult(data as ImportResult);
      const imported = data.created + data.updated;
      const mergeNote = data.mergeStats
        ? ` Merged ${data.mergeStats.matched} guests from both files (${data.mergeStats.attendingOnly} attending-only, ${data.mergeStats.rsvpOnly} RSVP-only).`
        : "";
      const formatNote =
        data.format === "sayi"
          ? ` Sayi.do format — ${data.generatedEmailCount ?? 0} placeholder emails, RSVP linked for ${imported} guests.${
              data.extraColumns?.length
                ? ` Extra columns: ${data.extraColumns.slice(0, 4).join(", ")}${data.extraColumns.length > 4 ? "…" : ""}.`
                : ""
            }${mergeNote}`
          : "";

      if (imported === 0 && data.errors.length > 0) {
        onMessage(
          `Import failed — no guests were saved. ${data.errors.length} row error${data.errors.length === 1 ? "" : "s"} (see below). Try uploading again.`,
        );
      } else if (imported === 0) {
        onMessage("Import finished but no guests were created or updated. Check your spreadsheet format.");
      } else {
        onMessage(
          `Import complete — ${data.created} created, ${data.updated} updated, ${data.skipped} skipped.${formatNote}`,
        );
      }
      if (fileRef.current) fileRef.current.value = "";
      if (attendingFileRef.current) attendingFileRef.current.value = "";
      if (rsvpFileRef.current) rsvpFileRef.current.value = "";
      onImported();
    } catch {
      onMessage("Import failed. Please try again.");
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
        <FileSpreadsheet size={14} />
        {open ? "Hide spreadsheet import" : "Import from spreadsheet"}
      </button>

      {open && (
        <form
          onSubmit={handleImport}
          className="mt-4 space-y-4 rounded-2xl border bg-white p-4 shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <p className="text-sm leading-relaxed text-gray-600">
            Upload a single CSV, or merge two <strong className="font-medium">Sayi.do</strong> exports
            (attending list + RSVP responses) for full guest profiles — party, attendance, dietary,
            phone, song requests, and custom questions.
          </p>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["single", "Single CSV"],
                ["sayi-dual", "Sayi: Attending + RSVP"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setImportMode(key)}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  importMode === key ? "bg-[#2a2723] text-[#c3a379]" : "border bg-white text-gray-500"
                }`}
                style={importMode !== key ? { borderColor: theme.border } : undefined}
              >
                {label}
              </button>
            ))}
          </div>

          <a
            href="/api/admin/guests/import"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c3a379]"
          >
            <Download size={12} /> Download template CSV
          </a>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">
              Import mode
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value as "upsert" | "create")}
                className="mt-1 w-full rounded-xl border px-4 py-3 text-sm"
                style={{ borderColor: theme.border }}
              >
                <option value="upsert">Update existing + create new</option>
                <option value="create">Create new only (skip existing emails)</option>
              </select>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3">
              <input
                type="checkbox"
                checked={sendInvites}
                onChange={(event) => setSendInvites(event.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm text-[#2a2723]">
                Email invite to newly created guests (real emails only — not Sayi placeholders)
              </span>
            </label>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className={`block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#f7f4ee] file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-wider ${importMode === "sayi-dual" ? "hidden" : ""}`}
          />

          {importMode === "sayi-dual" && (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-gray-600">
                Sayi guest list — all invitees
                <span className="mt-1 block text-[11px] font-normal text-gray-500">
                  Guest List → cog → Download Guest List ({`guestlist_all_*.csv`})
                </span>
                <input
                  ref={attendingFileRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="mt-2 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#f7f4ee] file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-wider"
                />
              </label>
              <label className="block text-xs font-medium text-gray-600">
                Sayi attendees — RSVP responses
                <span className="mt-1 block text-[11px] font-normal text-gray-500">
                  Guest List → cog → Download Attendees List ({`guestlist_attendees_*.csv`})
                </span>
                <input
                  ref={rsvpFileRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="mt-2 block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#f7f4ee] file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-wider"
                />
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-60"
            style={{ backgroundColor: theme.btnDark, color: theme.gold }}
          >
            <Upload size={14} />
            {uploading ? "Importing…" : "Upload spreadsheet"}
          </button>

          {lastResult && lastResult.errors.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <p className="mb-2 font-bold uppercase tracking-wider">Row warnings</p>
              <ul className="space-y-1">
                {lastResult.errors.slice(0, 8).map((error) => (
                  <li key={`${error.row}-${error.message}`}>
                    Row {error.row}
                    {error.email ? ` (${error.email})` : ""}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {lastResult?.format === "sayi" && (
            <p className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
              Sayi import: placeholder emails use{" "}
              <span className="font-mono">@{GUEST_IMPORT_EMAIL_DOMAIN}</span>. Update each
              guest&apos;s email in admin before sharing login details.
            </p>
          )}

          {lastResult && lastResult.passwords.length > 0 && (
            <div className="rounded-xl border bg-[#f7f4ee] p-3 text-xs text-[#2a2723]" style={{ borderColor: theme.border }}>
              <p className="mb-2 font-bold uppercase tracking-wider text-[#c3a379]">
                New guest passwords
              </p>
              <ul className="space-y-1 font-mono">
                {lastResult.passwords.slice(0, 15).map((entry) => (
                  <li key={entry.email}>
                    {entry.name}: {entry.email} / {entry.password}
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
