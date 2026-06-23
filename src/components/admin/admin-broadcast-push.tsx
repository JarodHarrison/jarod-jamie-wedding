"use client";

import { useState } from "react";
import { Bell, Send } from "lucide-react";
import { GUEST_TIER_LABELS } from "@/lib/api-utils";
import { theme } from "@/lib/theme";
import type { GuestTier } from "@/types/wedding";

type AdminBroadcastPushProps = {
  guestCount: number;
  onMessage: (message: string) => void;
};

type Audience = "all" | "accepted" | "pending-rsvp" | GuestTier;

const AUDIENCE_OPTIONS: { value: Audience; label: string }[] = [
  { value: "all", label: "All guests" },
  { value: "accepted", label: "RSVP accepted" },
  { value: "pending-rsvp", label: "Pending RSVP" },
  { value: "PENTHOUSE", label: GUEST_TIER_LABELS.PENTHOUSE },
  { value: "ON_SITE", label: GUEST_TIER_LABELS.ON_SITE },
  { value: "OFF_SITE", label: GUEST_TIER_LABELS.OFF_SITE },
];

export function AdminBroadcastPush({ guestCount, onMessage }: AdminBroadcastPushProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<Audience>("all");
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();
    if (!trimmedTitle || !trimmedMessage) {
      onMessage("Title and message are required.");
      return;
    }

    const audienceLabel = AUDIENCE_OPTIONS.find((option) => option.value === audience)?.label ?? audience;
    if (!confirm(`Send this in-app notification to "${audienceLabel}" guests?`)) {
      return;
    }

    setSending(true);
    onMessage("");

    try {
      const res = await fetch("/api/admin/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          message: trimmedMessage,
          audience,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        onMessage(data.error ?? "Failed to send notification.");
        return;
      }

      onMessage(data.message ?? "Notification sent.");
      setTitle("");
      setMessage("");
    } catch {
      onMessage("Failed to send notification. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: theme.border }}>
      <div className="mb-2 flex items-center gap-2">
        <Bell size={16} className="text-[#c3a379]" />
        <h2 className="font-serif text-lg text-[#2a2723]">In-App Push</h2>
      </div>
      <p className="mb-4 text-xs text-gray-500">
        Delivers instantly inside the wedding app (bell icon on Home). Guests see it when they open
        the app — no email required. {guestCount} guest{guestCount === 1 ? "" : "s"} loaded.
      </p>

      <form onSubmit={handleSend} className="space-y-3">
        <select
          value={audience}
          onChange={(e) => setAudience(e.target.value as Audience)}
          className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#c3a379]"
          style={{ borderColor: theme.border }}
        >
          {AUDIENCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Notification title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#c3a379]"
          style={{ borderColor: theme.border }}
          required
        />

        <textarea
          placeholder="Short message guests will see in the app"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full resize-y rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#c3a379]"
          style={{ borderColor: theme.border }}
          required
        />

        <button
          type="submit"
          disabled={sending}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest disabled:opacity-60"
          style={{ backgroundColor: theme.btnDark, color: theme.gold }}
        >
          <Send size={14} />
          {sending ? "Sending..." : "Send Push Notification"}
        </button>
      </form>
    </section>
  );
}
