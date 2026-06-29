"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { RETURN_SHUTTLE } from "@/lib/return-shuttle";
import { theme } from "@/lib/theme";

type TransferOverviewModal =
  | { kind: "return-shuttle"; airport: "MCY" | "BNE" }
  | { kind: "buddy-matches" }
  | null;

type ReturnShuttleGuest = { id: string; name: string };

type BuddyMatch = {
  id: string;
  kind: "ARRIVAL" | "DEPARTURE";
  status: "PENDING" | "INTRODUCED" | "DECLINED";
  guestA: { id: string; name: string };
  guestB: { id: string; name: string };
  guestLowConsent: boolean | null;
  guestHighConsent: boolean | null;
  introducedAt: string | null;
  createdAt: string;
};

type TransferOverviewData = {
  matches: BuddyMatch[];
  returnShuttle: { MCY: ReturnShuttleGuest[]; BNE: ReturnShuttleGuest[] };
  returnShuttleLabels: { MCY: string; BNE: string };
};

type AdminTransferOverviewModalProps = {
  modal: TransferOverviewModal;
  onClose: () => void;
};

function matchStatusLabel(match: BuddyMatch): string {
  if (match.status === "INTRODUCED") return "Introduced";
  if (match.guestLowConsent === true && match.guestHighConsent === true) {
    return "Both agreed — introducing";
  }
  if (match.guestLowConsent === true || match.guestHighConsent === true) {
    return "One guest agreed";
  }
  return "Awaiting response";
}

export function AdminTransferOverviewModal({ modal, onClose }: AdminTransferOverviewModalProps) {
  const [data, setData] = useState<TransferOverviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!modal) return;

    setLoading(true);
    setError("");
    void (async () => {
      try {
        const res = await fetch("/api/admin/transfer-overview", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? "Failed to load transfer details.");
          return;
        }
        setData(json);
      } catch {
        setError("Failed to load transfer details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [modal]);

  if (!modal) return null;

  const title =
    modal.kind === "return-shuttle"
      ? `Return shuttle — ${modal.airport}`
      : "Travel buddy matches";

  const shuttleGuests =
    modal.kind === "return-shuttle" && data ? data.returnShuttle[modal.airport] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl border bg-white shadow-xl"
        style={{ borderColor: theme.border }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-overview-title"
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: theme.border }}
        >
          <div>
            <h2 id="transfer-overview-title" className="font-serif text-lg text-[#2a2723]">
              {title}
            </h2>
            {modal.kind === "return-shuttle" && (
              <p className="mt-1 text-xs text-gray-500">
                {RETURN_SHUTTLE.displayDate} · leaves {RETURN_SHUTTLE.displayTime}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-[#f7f4ee] hover:text-[#2a2723]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          {loading && <p className="text-sm text-gray-400">Loading…</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {!loading && !error && modal.kind === "return-shuttle" && (
            <>
              {shuttleGuests.length === 0 ? (
                <p className="text-sm text-gray-500">No guests registered yet.</p>
              ) : (
                <ul className="space-y-2">
                  {shuttleGuests.map((guest) => (
                    <li
                      key={guest.id}
                      className="rounded-xl border bg-[#faf8f4] px-4 py-3 text-sm text-[#2a2723]"
                      style={{ borderColor: theme.border }}
                    >
                      {guest.name}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {!loading && !error && modal.kind === "buddy-matches" && (
            <>
              {!data?.matches.length ? (
                <p className="text-sm text-gray-500">No active travel buddy matches yet.</p>
              ) : (
                <ul className="space-y-3">
                  {data.matches.map((match) => (
                    <li
                      key={match.id}
                      className="rounded-xl border bg-[#faf8f4] px-4 py-3"
                      style={{ borderColor: theme.border }}
                    >
                      <p className="text-sm font-medium text-[#2a2723]">
                        {match.guestA.name} ↔ {match.guestB.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {match.kind === "ARRIVAL" ? "Arrival overlap" : "Departure overlap"} ·{" "}
                        {matchStatusLabel(match)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export type { TransferOverviewModal };
