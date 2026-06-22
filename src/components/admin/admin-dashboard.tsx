"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, LogOut, Plus, RefreshCw, Shield, Trash2 } from "lucide-react";
import { GUEST_TIER_LABELS } from "@/lib/api-utils";
import { theme } from "@/lib/theme";
import { AdminGuestEditor } from "@/components/admin/admin-guest-editor";
import type { AdminGuest, GuestTier } from "@/types/wedding";

type AdminDashboardProps = {
  adminName: string;
  onLogout: () => void;
  onUnauthorized?: () => void;
};

const TIERS: GuestTier[] = ["PENTHOUSE", "ON_SITE", "OFF_SITE"];

export function AdminDashboard({ adminName, onLogout, onUnauthorized }: AdminDashboardProps) {
  const [guests, setGuests] = useState<AdminGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending-rsvp" | "submitted">("all");
  const [driverLink, setDriverLink] = useState<string | null>(null);

  const [newGuest, setNewGuest] = useState({
    name: "",
    email: "",
    tier: "OFF_SITE" as GuestTier,
    password: "",
  });

  const loadGuests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/guests");
      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      const data = await res.json();
      setGuests(data.guests ?? []);
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    loadGuests();
  }, [loadGuests]);

  const filteredGuests = guests.filter((guest) => {
    if (filter === "pending-rsvp") return guest.rsvpStatus === "PENDING";
    if (filter === "submitted") return guest.rsvpSubmittedAt !== null;
    return true;
  });

  const stats = {
    total: guests.length,
    accepted: guests.filter((g) => g.rsvpStatus === "ACCEPTED").length,
    declined: guests.filter((g) => g.rsvpStatus === "DECLINED").length,
    pending: guests.filter((g) => g.rsvpStatus === "PENDING").length,
    accommodation: guests.filter((g) => g.accommodationSubmittedAt).length,
    transfer: guests.filter((g) => g.transferSubmittedAt).length,
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setTempPassword(null);

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
      setMessage(data.error ?? "Failed to create guest.");
      return;
    }

    setTempPassword(data.temporaryPassword);
    setMessage(`Guest "${data.guest.name}" created successfully.`);
    setNewGuest({ name: "", email: "", tier: "OFF_SITE", password: "" });
    setShowAddForm(false);
    loadGuests();
  };

  const handleTierChange = async (id: string, tier: GuestTier) => {
    const res = await fetch(`/api/admin/guests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });
    if (res.ok) loadGuests();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove guest "${name}"?`)) return;
    const res = await fetch(`/api/admin/guests/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMessage(`Removed ${name}.`);
      if (expandedId === id) setExpandedId(null);
      loadGuests();
    }
  };

  const handleMakeAdmin = async (id: string, name: string) => {
    if (!confirm(`Grant admin access to "${name}"? They can sign in with their existing password.`)) {
      return;
    }

    setMessage("");
    const res = await fetch(`/api/admin/guests/${id}/make-admin`, { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error ?? "Failed to grant admin access.");
      return;
    }

    setMessage(data.message ?? `${name} is now an admin.`);
    loadGuests();
  };

  const handleGuestUpdated = (updated: AdminGuest) => {
    setGuests((current) => current.map((g) => (g.id === updated.id ? updated : g)));
    setMessage(`Updated ${updated.name}.`);
  };

  const handleDriverMagicLink = async () => {
    setDriverLink(null);
    const res = await fetch("/api/shuttle/driver/magic-link", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Failed to create driver link.");
      return;
    }
    setDriverLink(data.url);
    setMessage("Driver magic link created — valid for 1 hour. Send it to your shuttle driver.");
  };

  const rsvpColor = (status: AdminGuest["rsvpStatus"]) => {
    if (status === "ACCEPTED") return "text-emerald-600";
    if (status === "DECLINED") return "text-rose-500";
    return "text-gray-400";
  };

  return (
    <div className="animate-fade-in flex h-full flex-col">
      <header
        className="wedding-screen-top sticky top-0 z-20 border-b bg-[#f7f4ee]/90 px-6 pb-4 backdrop-blur-md"
        style={{ borderColor: theme.border }}
      >
        <button
          type="button"
          onClick={onLogout}
          className="wedding-top-offset absolute right-6 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-[#2a2723]"
        >
          <LogOut size={12} /> Sign Out
        </button>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Admin · {adminName}
        </p>
        <h1 className="font-serif text-2xl text-[#2a2723]">Guest Management</h1>
        <p className="mt-1 text-xs text-gray-500">
          {stats.total} guests · {stats.accepted} attending · {stats.pending} pending RSVP
        </p>
      </header>

      <div className="flex-1 overflow-y-auto scroll-smooth px-6 py-6 pb-6">
        {(message || tempPassword) && (
          <div
            className="mb-6 rounded-2xl border bg-white p-4 shadow-sm"
            style={{ borderColor: theme.border }}
          >
            {message && <p className="text-sm text-[#2a2723]">{message}</p>}
            {tempPassword && (
              <p className="mt-2 font-mono text-lg font-bold text-[#c3a379]">{tempPassword}</p>
            )}
          </div>
        )}

        <section className="mb-6 grid grid-cols-3 gap-2">
          {[
            { label: "RSVP In", value: stats.accepted },
            { label: "Accommodation", value: stats.accommodation },
            { label: "Transfers", value: stats.transfer },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border bg-white p-3 text-center shadow-sm"
              style={{ borderColor: theme.border }}
            >
              <p className="text-lg font-bold text-[#2a2723]">{stat.value}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{stat.label}</p>
            </div>
          ))}
        </section>

        <section className="mb-6 rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: theme.border }}>
          <h2 className="mb-2 font-serif text-lg text-[#2a2723]">Shuttle Driver</h2>
          <p className="mb-3 text-xs text-gray-500">
            Driver portal: <span className="font-mono">/driver</span> — PIN from seed (default 260926) or generate a one-time magic link.
          </p>
          <button
            type="button"
            onClick={handleDriverMagicLink}
            className="w-full rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest"
            style={{ backgroundColor: theme.btnDark, color: theme.gold }}
          >
            Generate Driver Magic Link
          </button>
          {driverLink && (
            <p className="mt-3 break-all font-mono text-[10px] text-[#2a2723]">{driverLink}</p>
          )}
        </section>

        <section className="mb-6">
          <button
            type="button"
            onClick={() => setShowAddForm((open) => !open)}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold uppercase tracking-widest shadow-md"
            style={{ backgroundColor: theme.btnDark, color: theme.gold }}
          >
            <Plus size={14} /> {showAddForm ? "Cancel" : "Add Guest"}
          </button>

          {showAddForm && (
            <form
              onSubmit={handleCreate}
              className="mt-4 space-y-3 rounded-2xl border bg-white p-4 shadow-sm"
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
                onChange={(e) =>
                  setNewGuest({ ...newGuest, tier: e.target.value as GuestTier })
                }
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
                placeholder="Password (auto if blank)"
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
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg text-[#2a2723]">All Guests</h2>
            <button
              type="button"
              onClick={loadGuests}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#2a2723]"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          <div className="mb-4 flex gap-2">
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
                onClick={() => setFilter(key)}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  filter === key
                    ? "bg-[#2a2723] text-[#c3a379]"
                    : "border bg-white text-gray-500"
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
                          {guest.isAdmin && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-[#2a2723] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#c3a379]">
                              <Shield size={10} /> Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{guest.email}</p>
                        <p className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${rsvpColor(guest.rsvpStatus)}`}>
                          RSVP: {guest.rsvpStatus}
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
                          onError={setMessage}
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
        </section>
      </div>
    </div>
  );
}
