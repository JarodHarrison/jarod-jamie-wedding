"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, HardDrive, Link2, AlertCircle } from "lucide-react";
import { theme } from "@/lib/theme";

type DriveStatus = {
  driveConnected: boolean;
  googleClientConfigured: boolean;
  folderIdConfigured: boolean;
  autoApprovePhotos: boolean;
};

export function AdminDriveConnect() {
  const [status, setStatus] = useState<DriveStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = async () => {
    try {
      const res = await fetch("/api/admin/drive/status");
      if (res.ok) setStatus(await res.json());
    } catch {
      // non-blocking
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const handleConnect = () => {
    window.location.href = "/api/admin/drive/connect";
  };

  const canConnect = status?.googleClientConfigured && !status.driveConnected;

  return (
    <section
      className="rounded-2xl border bg-white p-4 shadow-sm"
      style={{ borderColor: theme.border }}
    >
      <div className="mb-2 flex items-center gap-2">
        <HardDrive size={16} className="text-[#c3a379]" />
        <h2 className="font-serif text-lg text-[#2a2723]">Google Drive (guest photos)</h2>
      </div>

      {loading ? (
        <p className="text-xs text-gray-400">Checking Drive setup…</p>
      ) : !status ? (
        <p className="text-xs text-red-500">Could not load Drive status.</p>
      ) : status.driveConnected ? (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Google Drive connected</p>
              <p className="mt-1">
                Guest uploads are archived to Drive with the guest&apos;s name in the file description.
                {status.folderIdConfigured ? null : (
                  <>
                    {" "}
                    Add <span className="font-mono">GOOGLE_DRIVE_FOLDER_ID</span> to target a folder.
                  </>
                )}
              </p>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-gray-500">
            {status.autoApprovePhotos
              ? "Clean and borderline uploads go live on the TV wall automatically. Vision blocks only clearly unsafe images."
              : "New uploads wait for admin approval before appearing on the TV wall."}
          </p>
          <button
            type="button"
            onClick={handleConnect}
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#c3a379]"
          >
            <Link2 size={12} /> Reconnect Drive
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Drive not connected</p>
              <p className="mt-1">
                Guest photo uploads still work in the app and on the TV wall, but won&apos;t be backed up to
                Google Drive until you connect.
              </p>
            </div>
          </div>

          {!status.googleClientConfigured && (
            <p className="text-[11px] text-red-600">
              Add <span className="font-mono">GOOGLE_CLIENT_ID</span> and{" "}
              <span className="font-mono">GOOGLE_CLIENT_SECRET</span> first.
            </p>
          )}

          <ol className="list-decimal space-y-1 pl-4 text-[11px] leading-relaxed text-gray-600">
            <li>Enable the Google Drive API in Google Cloud Console.</li>
            <li>
              OAuth consent screen → add scope{" "}
              <span className="font-mono">drive.file</span> and add your admin Google account as a test user.
            </li>
            <li>
              Add this redirect URI in Google Cloud:{" "}
              <span className="block break-all font-mono text-[10px] text-gray-500">
                https://jarodandjamiewedding.com/api/admin/drive/callback
              </span>
            </li>
            <li>Create a folder in Drive for guest photos and note its folder ID from the URL.</li>
            <li>
              Click <strong>Connect Google Drive</strong> and sign in with the account that owns the folder.
            </li>
            <li>
              Copy <span className="font-mono">GOOGLE_DRIVE_REFRESH_TOKEN</span> and{" "}
              <span className="font-mono">GOOGLE_DRIVE_FOLDER_ID</span> into Vercel.
            </li>
          </ol>

          <button
            type="button"
            onClick={handleConnect}
            disabled={!canConnect}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
            style={{ backgroundColor: theme.btnDark, color: theme.gold }}
          >
            <Link2 size={14} />
            Connect Google Drive
          </button>
        </div>
      )}
    </section>
  );
}
