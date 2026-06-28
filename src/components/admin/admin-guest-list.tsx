"use client";

import { ChevronDown, Heart, Link2, Plus, RefreshCw, Shield, Trash2, BadgeCheck } from "lucide-react";
import { useState } from "react";
import { GUEST_TIER_LABELS } from "@/lib/api-utils";
import { getGuestCompanionSummary } from "@/lib/guest-companion-display";
import { theme } from "@/lib/theme";
import { AdminGuestEditor } from "@/components/admin/admin-guest-editor";
import { AdminGuestImport } from "@/components/admin/admin-guest-import";
import { AdminRoomImport } from "@/components/admin/admin-room-import";
import type { AdminGuest, GuestTier } from "@/types/wedding";

const TIERS: GuestTier[] = ["PENTHOUSE", "ON_SITE", "OFF_SITE"];

type AdminGuestListProps = {
  guests: AdminGuest[];
  loading: boolean;
  filter: "all" | "pending-rsvp" | "submitted";
  onFilterChange: (filter: "all" | "pending-rsvp" | "submitted") => void;
  onRefresh: () => void;
  onMessage: (message: string) => void;
  onGuestsChange: (guests: AdminGuest[]) => void;
};

export function AdminGuestList({
  guests,
  loading,
  filter,
  onFilterChange,
  onRefresh,
  onMessage,
  onGuestsChange,
}: AdminGuestListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: "",
    email: "",
    tier: "OFF_SITE" as GuestTier,
    password: "",
  });

  const filteredGuests = guests.filter((guest) => {
    if (filter === "pending-rsvp") return guest.rsvpStatus === "PENDING";
    if (filter === "submitted") return guest.rsvpSubmittedAt !== null;
    return true;
  });

  const rsvpColor = (status: AdminGuest["rsvpStatus"]) => {
    if (status === "ACCEPTED") return "text-emerald-600";
    if (status === "DECLINED") return "text-rose-500";
    return "text-gray-400";
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    onMessage("");

    const res = await fetch("/api/admin/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newGuest.name,
        email: newGuest.email,
        tier: newGuest.tier,
        password: newGuest.password || undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      onMessage(data.error ?? "Failed to create guest.");
      return;
    }

    onMessage(
      `Guest "${data.guest.name}" created.${data.temporaryPassword ? ` Temp password: ${data.temporaryPassword}` : ""}`,
    );
    setNewGuest({ name: "", email: "", tier: "OFF_SITE", password: "" });
    setShowAddForm(false);
    onRefresh();
  };

  const handleTierChange = async (id: string, tier: GuestTier) => {
    const res = await fetch(`/api/admin/guests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });
    if (res.ok) onRefresh();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove guest "${name}"?`)) return;
    const res = await fetch(`/api/admin/guests/${id}`, { method: "DELETE" });
    if (res.ok) {
      onMessage(`Removed ${name}.`);
      if (expandedId === id) setExpandedId(null);
      onRefresh();
    }
  };

  const handleMakeAdmin = async (id: string, name: string) => {
    if (!confirm(`Grant admin access to "${name}"? They can sign in with their existing password.`)) {
      return;
    }

    onMessage("");
    const res = await fetch(`/api/admin/guests/${id}/make-admin`, { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      onMessage(data.error ?? "Failed to grant admin access.");
      return;
    }

    onMessage(data.message ?? `${name} is now an admin.`);
    onRefresh();
  };

  const handleGuestUpdated = (updated: AdminGuest) => {
    onGuestsChange(guests.map((g) => (g.id === updated.id ? updated : g)));
    onMessage(`Updated ${updated.name}.`);
  };

  const openLinkedGuest = (guestId: string) => {
    const inFilter = filteredGuests.some((g) => g.id === guestId);
    if (!inFilter) {
      onFilterChange("all");
    }
    setExpandedId(guestId);
  };

  return (
    <div>
      <AdminGuestImport onMessage={onMessage} onImported={onRefresh} />
      <AdminRoomImport onMessage={onMessage} onImported={onRefresh} />

      <button
        type="button"
        onClick={() => setShowAddForm((open) => !open)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold uppercase tracking-widest shadow-md"
        style={{ backgroundColor: theme.btnDark, color: theme.gold }}
      >
        <Plus size={14} /> {showAddForm ? "Cancel" : "Add Guest"}
      </button>

      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 space-y-3 rounded-2xl border bg-white p-4 shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <input
            type="text"
            placeholder="Full Name"
            value={newGuest.name}
            onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
            className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#c3a379]"
            style={{ borderColor: theme.border }}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newGuest.email}
            onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
            className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#c3a379]"
            style={{ borderColor: theme.border }}
            required
          />
          <select
            value={newGuest.tier}
            onChange={(e) => setNewGuest({ ...newGuest, tier: e.target.value as GuestTier })}
            className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#c3a379]"
            style={{ borderColor: theme.border }}
          >
            {TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {GUEST_TIER_LABELS[tier]}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Password (optional — blank until they sign up)"
            value={newGuest.password}
            onChange={(e) => setNewGuest({ ...newGuest, password: e.target.value })}
            className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#c3a379]"
            style={{ borderColor: theme.border }}
          />
          <button
            type="submit"
            className="w-full rounded-xl py-3 text-xs font-bold uppercase tracking-widest"
            style={{ backgroundColor: theme.btnDark, color: theme.gold }}
          >
            Create Guest
          </button>
        </form>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-lg text-[#2a2723]">All Guests</h2>
        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#2a2723]"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["pending-rsvp", "Pending RSVP"],
            ["submitted", "RSVP Submitted"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onFilterChange(key)}
            className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
              filter === key ? "bg-[#2a2723] text-[#c3a379]" : "border bg-white text-gray-500"
            }`}
            style={filter !== key ? { borderColor: theme.border } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-gray-400">Loading guests...</p>
      ) : filteredGuests.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No guests match this filter.</p>
      ) : (
        <div className="space-y-3">
          {filteredGuests.map((guest) => {
            const isExpanded = expandedId === guest.id;
            const companion = getGuestCompanionSummary(guest);
            return (
              <div
                key={guest.id}
                className="rounded-2xl border bg-white p-4 shadow-sm"
                style={{ borderColor: theme.border }}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : guest.id)}
                  className="flex w-full items-start justify-between gap-3 text-left"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#2a2723]">{guest.name}</p>
                      {guest.hasAppAccount && (
                        <span
                          className="inline-flex items-center text-emerald-600"
                          title="Signed up in the app"
                          aria-label={`${guest.name} has signed up in the app`}
                        >
                          <BadgeCheck size={16} strokeWidth={2.25} />
                        </span>
                      )}
                      {guest.isAdmin && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#2a2723] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#c3a379]">
                          <Shield size={10} /> Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{guest.email}</p>
                    {companion && (
                      <p className="mt-0.5 text-[10px] text-gray-500">
                        {companion.linked && companion.guestId ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              if (companion.guestId) openLinkedGuest(companion.guestId);
                            }}
                            className="inline-flex items-center gap-1 font-medium text-[#c3a379] hover:underline"
                          >
                            <Link2 size={10} aria-hidden />
                            With {companion.name}
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <Heart size={10} className="text-[#c3a379]" aria-hidden />
                            +1: {companion.name}
                          </span>
                        )}
                      </p>
                    )}
                    {guest.sayiPartyName && (
                      <p className="text-[10px] text-gray-400">Party: {guest.sayiPartyName}</p>
                    )}
                    <p
                      className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${rsvpColor(guest.rsvpStatus)}`}
                    >
                      RSVP: {guest.rsvpStatus} · {GUEST_TIER_LABELS[guest.tier]}
                    </p>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`mt-1 shrink-0 text-[#c3a379] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {isExpanded && (
                  <>
                    <AdminGuestEditor
                      guest={guest}
                      onUpdated={handleGuestUpdated}
                      onError={onMessage}
                    />
                    <select
                      value={guest.tier}
                      onChange={(e) => handleTierChange(guest.id, e.target.value as GuestTier)}
                      className="mb-3 mt-4 w-full rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-[#c3a379]"
                      style={{ borderColor: theme.border }}
                    >
                      {TIERS.map((tier) => (
                        <option key={tier} value={tier}>
                          {GUEST_TIER_LABELS[tier]}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      {!guest.isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleMakeAdmin(guest.id, guest.name)}
                          className="flex flex-1 items-center justify-center gap-1 rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-50"
                          style={{ borderColor: theme.border, color: theme.btnDark }}
                        >
                          <Shield size={12} /> Make Admin
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(guest.id, guest.name)}
                        className="flex-1 rounded-lg border border-red-100 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={14} className="mx-auto" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
