"use client";

import { useEffect, useState } from "react";
import { FileText, Ticket } from "lucide-react";
import { theme } from "@/lib/theme";
import type { SerializedGoldCoastTicket } from "@/lib/gold-coast-tickets";

export function GoldCoastTicketsSection() {
  const [tickets, setTickets] = useState<SerializedGoldCoastTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTickets() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/guest/gold-coast/tickets");
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) setError(data.error ?? "Failed to load tickets.");
          return;
        }
        if (!cancelled) setTickets(data.tickets ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadTickets();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-400">Loading tickets…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  const uploadedCount = tickets.filter((ticket) => ticket.hasTicket).length;

  return (
    <div
      className="space-y-4 rounded-2xl border bg-white/60 p-5 shadow-sm"
      style={{ borderColor: theme.border }}
    >
      <p className="text-sm leading-relaxed text-gray-600">
        Your Gold Coast attraction tickets will appear here once we upload them. Save them to your
        phone before each day out.
      </p>

      {uploadedCount === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-gray-400" style={{ borderColor: theme.border }}>
          No tickets uploaded yet. Check back closer to the trip.
        </p>
      ) : (
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">
          {uploadedCount} of {tickets.length} tickets ready
        </p>
      )}

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <div
            key={ticket.attractionId}
            className="flex items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3"
            style={{ borderColor: theme.border }}
          >
            <div className="min-w-0">
              <p className="font-medium text-[#2a2723]">{ticket.title}</p>
              {ticket.hasTicket ? (
                <p className="truncate text-xs text-gray-500">{ticket.fileName ?? "Ticket attached"}</p>
              ) : (
                <p className="text-xs text-gray-400">Not uploaded yet</p>
              )}
            </div>

            {ticket.hasTicket ? (
              <a
                href={`/api/guest/gold-coast/tickets/${ticket.attractionId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-widest"
                style={{ backgroundColor: theme.btnDark, color: theme.gold }}
              >
                <FileText size={12} />
                View
              </a>
            ) : (
              <span
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400"
                style={{ borderColor: theme.border }}
              >
                <Ticket size={12} />
                Pending
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
