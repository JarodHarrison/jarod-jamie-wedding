"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Printer } from "lucide-react";

const CARD_COUNT = 12;
const CARDS_PER_ROW = 2;

export function TableCardsPrintClient() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/share-photo`
      : `${process.env.NEXT_PUBLIC_APP_URL ?? "https://jarodandjamiewedding.com"}/share-photo`;

  useEffect(() => {
    void fetch("/api/admin/drive/status")
      .then((res) => setAuthorized(res.ok))
      .catch(() => setAuthorized(false));
  }, []);

  useEffect(() => {
    void QRCode.toDataURL(shareUrl, { margin: 1, width: 200 }).then(setQrDataUrl);
  }, [shareUrl]);

  if (authorized === null) {
    return <div className="min-h-screen bg-[#f7f4ee] p-8 text-center text-gray-500">Loading…</div>;
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#f7f4ee] p-8 text-center">
        <p className="text-[#2a2723]">Sign in as admin to print table cards.</p>
        <a href="/" className="mt-4 inline-block text-sm text-[#c3a379] underline">
          Back to app
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#2a2723]">
      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-[#e2d5c4] bg-[#f7f4ee]/95 px-6 py-4 backdrop-blur">
        <div>
          <h1 className="font-serif text-xl">Table card QR printouts</h1>
          <p className="text-xs text-gray-500">
            {CARD_COUNT} cards · guests scan to upload at {shareUrl}
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2a2723] px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#c3a379]"
        >
          <Printer size={14} /> Print
        </button>
      </div>

      <div className="print-area mx-auto max-w-5xl p-6">
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: `repeat(${CARDS_PER_ROW}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: CARD_COUNT }, (_, index) => (
            <div
              key={index}
              className="table-card flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#c3a379]/50 bg-white p-6 text-center"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#c3a379]">
                Jarod & Jamie
              </p>
              <h2 className="mt-2 font-serif text-2xl">Share your photos</h2>
              <p className="mt-2 max-w-[14rem] text-xs leading-relaxed text-gray-600">
                Scan to upload a moment from our wedding — it may appear on the live photo wall.
              </p>
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="Upload photos QR code"
                  className="mt-4 h-36 w-36 rounded-xl border border-[#e2d5c4] p-2"
                />
              ) : (
                <div className="mt-4 h-36 w-36 animate-pulse rounded-xl bg-gray-100" />
              )}
              <p className="mt-3 text-[9px] uppercase tracking-widest text-gray-400">
                Or use #J-rodandJamo on Instagram
              </p>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .print-area {
            max-width: none !important;
            padding: 0 !important;
          }
          .table-card {
            break-inside: avoid;
            page-break-inside: avoid;
            min-height: 3.8in;
            border-style: solid !important;
            margin: 0.15in;
          }
        }
      `}</style>
    </div>
  );
}
