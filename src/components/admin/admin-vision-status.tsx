"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Eye, AlertCircle } from "lucide-react";
import { theme } from "@/lib/theme";

type VisionStatus = {
  configured: boolean;
  enabled: boolean;
  autoApproveCleanAndBorderline: boolean;
};

export function AdminVisionStatus() {
  const [status, setStatus] = useState<VisionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testMessage, setTestMessage] = useState("");

  const loadStatus = async () => {
    try {
      const res = await fetch("/api/admin/vision/status");
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

  const runTest = async () => {
    setTesting(true);
    setTestMessage("");
    try {
      const res = await fetch("/api/admin/vision/status", { method: "POST" });
      const data = await res.json();
      setTestMessage(data.message ?? data.error ?? "Vision check failed.");
    } catch {
      setTestMessage("Vision check failed.");
    } finally {
      setTesting(false);
    }
  };

  const active = status?.enabled;

  return (
    <section
      className="rounded-2xl border bg-white p-4 shadow-sm"
      style={{ borderColor: theme.border }}
    >
      <div className="mb-2 flex items-center gap-2">
        <Eye size={16} className="text-[#c3a379]" />
        <h2 className="font-serif text-lg text-[#2a2723]">Photo safety (Cloud Vision)</h2>
      </div>

      {loading ? (
        <p className="text-xs text-gray-400">Checking Vision setup…</p>
      ) : !status ? (
        <p className="text-xs text-red-500">Could not load Vision status.</p>
      ) : active ? (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Cloud Vision active</p>
              <p className="mt-1">
                Guest uploads are scanned for unsafe content. Clean and borderline photos go live
                automatically; only clearly unsafe images are blocked.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={testing}
            onClick={() => void runTest()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-[10px] font-bold uppercase tracking-widest disabled:opacity-60"
            style={{ borderColor: theme.border, color: theme.btnDark }}
          >
            {testing ? "Checking API…" : "Test Vision API"}
          </button>
          {testMessage && <p className="text-xs text-gray-600">{testMessage}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Vision not active in this environment</p>
              <p className="mt-1">
                {!status.configured
                  ? "Add GOOGLE_API_KEY to your environment. Cloud Vision API should be enabled on the same Google Cloud project."
                  : "Vision moderation is turned off via GUEST_PHOTO_VISION_MODERATION=false."}
              </p>
            </div>
          </div>
          {status.configured && (
            <button
              type="button"
              disabled={testing}
              onClick={() => void runTest()}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest disabled:opacity-60"
              style={{ backgroundColor: theme.btnDark, color: theme.gold }}
            >
              {testing ? "Checking API…" : "Test Vision API"}
            </button>
          )}
          {testMessage && <p className="text-xs text-gray-600">{testMessage}</p>}
        </div>
      )}
    </section>
  );
}
