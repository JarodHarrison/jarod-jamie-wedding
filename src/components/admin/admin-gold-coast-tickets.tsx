"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2, Upload } from "lucide-react";
import {
  GOLD_COAST_TICKET_ACCEPT,
  type SerializedGoldCoastTicket,
} from "@/lib/gold-coast-tickets";
import { theme } from "@/lib/theme";

type AdminGoldCoastTicketsProps = {
  guestId: string;
  onError: (message: string) => void;
};

export function AdminGoldCoastTickets({ guestId, onError }: AdminGoldCoastTicketsProps) {
  const [tickets, setTickets] = useState<SerializedGoldCoastTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/guests/${guestId}/gold-coast-tickets`);
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Failed to load attraction tickets.");
        return;
      }
      setTickets(data.tickets ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when guest changes
  }, [guestId]);

  const uploadTicket = async (attractionId: string, file: File) => {
    setUploadingId(attractionId);
    onError("");
    try {
      const formData = new FormData();
      formData.append("ticket", file);
      const res = await fetch(
        `/api/admin/guests/${guestId}/gold-coast-tickets/${attractionId}`,
        { method: "POST", body: formData },
      );
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Failed to upload ticket.");
        return;
      }
      setTickets((current) =>
        current.map((ticket) =>
          ticket.attractionId === attractionId ? data.ticket : ticket,
        ),
      );
    } finally {
      setUploadingId(null);
    }
  };

  const removeTicket = async (attractionId: string) => {
    onError("");
    const res = await fetch(
      `/api/admin/guests/${guestId}/gold-coast-tickets/${attractionId}`,
      { method: "DELETE" },
    );
    const data = await res.json();
    if (!res.ok) {
      onError(data.error ?? "Failed to remove ticket.");
      return;
    }
    setTickets((current) =>
      current.map((ticket) =>
        ticket.attractionId === attractionId ? data.ticket : ticket,
      ),
    );
  };

  if (loading) {
    return <p className="text-xs text-gray-400">Loading tickets…</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-gray-500">
        Upload a PDF or image ticket for each Gold Coast attraction. Guests see these in their
        profile once uploaded.
      </p>

      {tickets.map((ticket) => (
        <div
          key={ticket.attractionId}
          className="rounded-lg border bg-white px-3 py-3"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#2a2723]">{ticket.title}</p>
              {ticket.hasTicket ? (
                <p className="truncate text-[10px] text-gray-500">{ticket.fileName ?? "Ticket attached"}</p>
              ) : (
                <p className="text-[10px] text-gray-400">No ticket uploaded</p>
              )}
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-gray-600">
                {uploadingId === ticket.attractionId ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Upload size={11} />
                )}
                {ticket.hasTicket ? "Replace" : "Upload"}
                <input
                  type="file"
                  accept={GOLD_COAST_TICKET_ACCEPT}
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) void uploadTicket(ticket.attractionId, file);
                  }}
                />
              </label>
              {ticket.hasTicket && (
                <>
                  <a
                    href={`/api/admin/guests/${guestId}/gold-coast-tickets/${ticket.attractionId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#2a2723]"
                    style={{ borderColor: theme.border }}
                  >
                    <FileText size={11} />
                    View
                  </a>
                  <button
                    type="button"
                    onClick={() => void removeTicket(ticket.attractionId)}
                    className="rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-gray-500"
                    style={{ borderColor: theme.border }}
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
