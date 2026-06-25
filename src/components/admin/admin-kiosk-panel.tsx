"use client";

import { useEffect, useState } from "react";
import { Monitor, Power, Printer } from "lucide-react";
import { theme } from "@/lib/theme";

export function AdminKioskPanel({ onMessage }: { onMessage: (message: string) => void }) {
  const [displayCode, setDisplayCode] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const code = sessionStorage.getItem("admin_kiosk_code");
    if (code) {
      setDisplayCode(code);
      setStatus("ACTIVE");
    }
  }, []);

  const openTv = () => {
    window.open("/kiosk", "_blank", "noopener,noreferrer");
    onMessage("Open /kiosk on the TV browser, then scan the QR code with your phone.");
  };

  const endSession = async () => {
    if (!displayCode) return;
    const res = await fetch("/api/admin/kiosk/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayCode }),
    });
    const data = await res.json();
    if (!res.ok) {
      onMessage(data.error ?? "Failed to end kiosk.");
      return;
    }
    sessionStorage.removeItem("admin_kiosk_code");
    setDisplayCode("");
    setStatus("ENDED");
    onMessage("Kiosk session ended.");
  };

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: theme.border }}>
      <div className="mb-4 flex items-center gap-2">
        <Monitor size={18} className="text-[#c3a379]" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#c3a379]">Live photo wall kiosk</h3>
      </div>
      <p className="mb-4 text-sm text-gray-600">
        Open <span className="font-mono text-[#2a2723]">/kiosk</span> on the venue TV. Scan the QR code while signed
        in as admin to start the live slideshow of guest stories, uploads, and Instagram hashtag photos.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={openTv}
          className="rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest"
          style={{ backgroundColor: theme.btnDark, color: theme.gold }}
        >
          Open TV page
        </button>
        <a
          href="/admin/print/table-cards"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-600"
          style={{ borderColor: theme.border }}
        >
          <Printer size={12} /> Print table QRs
        </a>
        {displayCode && status === "ACTIVE" && (
          <button
            type="button"
            onClick={() => void endSession()}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-600"
            style={{ borderColor: theme.border }}
          >
            <Power size={12} /> End session
          </button>
        )}
      </div>
      {displayCode && (
        <p className="mt-4 text-xs text-gray-500">
          Active code: <span className="font-mono text-[#2a2723]">{displayCode}</span>
          {status ? ` · ${status}` : ""}
        </p>
      )}
      <p className="mt-4 text-xs text-gray-400">
        Use <strong>Connect Google Drive</strong> below to archive uploads. Vision auto-approves clean
        photos; use Photo Wall to hide anything you don&apos;t want on the TV.
      </p>
    </section>
  );
}
