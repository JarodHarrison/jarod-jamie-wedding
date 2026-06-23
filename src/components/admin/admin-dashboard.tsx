"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Bus, LogOut, Mail, Users } from "lucide-react";
import { AdminBroadcastEmail } from "@/components/admin/admin-broadcast-email";
import { AdminBroadcastPush } from "@/components/admin/admin-broadcast-push";
import { AdminGuestList } from "@/components/admin/admin-guest-list";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import { theme } from "@/lib/theme";
import type { AdminGuest } from "@/types/wedding";

type AdminDashboardProps = {
  adminName: string;
  onLogout: () => void;
  onUnauthorized?: () => void;
};

type AdminView = "hub" | "guests" | "shuttle" | "updates";

export function AdminDashboard({ adminName, onLogout, onUnauthorized }: AdminDashboardProps) {
  const [guests, setGuests] = useState<AdminGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [view, setView] = useState<AdminView>("hub");
  const [filter, setFilter] = useState<"all" | "pending-rsvp" | "submitted">("all");
  const [driverLink, setDriverLink] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, left: 0 });
  }, [view]);

  const loadGuests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/guests");
      const data = await res.json();
      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      if (!res.ok) {
        setMessage(data.error ?? "Failed to load guests.");
        return;
      }
      setGuests(data.guests ?? []);
    } catch {
      setMessage("Failed to load guests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    loadGuests();
  }, [loadGuests]);

  const stats = {
    total: guests.length,
    rsvpIn: guests.filter((g) => g.rsvpStatus === "ACCEPTED").length,
    onSite: guests.filter((g) => g.tier === "ON_SITE" || g.tier === "PENTHOUSE").length,
    offSite: guests.filter((g) => g.tier === "OFF_SITE").length,
    transfers: guests.filter((g) => g.transferSubmittedAt).length,
    pending: guests.filter((g) => g.rsvpStatus === "PENDING").length,
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
    setMessage("Driver magic link created — valid for 1 hour.");
  };

  const subViewTitle: Record<Exclude<AdminView, "hub">, string> = {
    guests: "Guest List",
    shuttle: "Shuttle Driver",
    updates: "Guest Updates",
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

        {view !== "hub" ? (
          <button
            type="button"
            onClick={() => setView("hub")}
            className="mb-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#c3a379]"
          >
            <ArrowLeft size={12} /> Back
          </button>
        ) : (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Admin · {adminName}
          </p>
        )}

        <h1 className="font-serif text-2xl text-[#2a2723]">
          {view === "hub" ? "Guest Management" : subViewTitle[view]}
        </h1>
        {view === "hub" && (
          <p className="mt-1 text-xs text-gray-500">
            {stats.total} guests · {stats.rsvpIn} attending · {stats.pending} pending RSVP
          </p>
        )}
      </header>

      <div ref={contentRef} className="flex-1 overflow-y-auto scroll-smooth px-6 py-6 pb-6">
        {message && (
          <div
            className="mb-6 rounded-2xl border bg-white p-4 shadow-sm"
            style={{ borderColor: theme.border }}
          >
            <p className="text-sm text-[#2a2723]">{message}</p>
          </div>
        )}

        {view === "hub" && (
          <>
            <section className="mb-8 grid grid-cols-2 gap-2">
              {[
                { label: "RSVP In", value: stats.rsvpIn },
                { label: "On-site", value: stats.onSite },
                { label: "Off-site", value: stats.offSite },
                { label: "Transfers", value: stats.transfers },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border bg-white p-3 text-center shadow-sm"
                  style={{ borderColor: theme.border }}
                >
                  <p className="text-lg font-bold text-[#2a2723]">{stat.value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </section>

            <div className="space-y-4">
              <AdminSectionCard
                title="Guest List"
                description="Add guests, edit RSVPs, accommodation, transfers, and admin access."
                actionLabel="Manage Guests"
                icon={Users}
                variant="dark"
                onClick={() => setView("guests")}
              />
              <AdminSectionCard
                title="Shuttle Driver"
                description="Generate a one-time magic link for your courtesy bus driver portal."
                actionLabel="Driver Portal"
                icon={Bus}
                onClick={() => setView("shuttle")}
              />
              <AdminSectionCard
                title="Guest Updates"
                description="Send email broadcasts or in-app push notifications to guests."
                actionLabel="Send Updates"
                icon={Mail}
                variant="gold"
                onClick={() => setView("updates")}
              />
            </div>
          </>
        )}

        {view === "guests" && (
          <AdminGuestList
            guests={guests}
            loading={loading}
            filter={filter}
            onFilterChange={setFilter}
            onRefresh={loadGuests}
            onMessage={setMessage}
            onGuestsChange={setGuests}
          />
        )}

        {view === "shuttle" && (
          <section className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: theme.border }}>
            <p className="mb-4 text-sm text-gray-500">
              Driver portal lives at <span className="font-mono text-[#2a2723]">/driver</span>. Use the
              seeded PIN (default 260926) or generate a one-time magic link below.
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
              <p className="mt-4 break-all rounded-xl bg-[#f7f4ee] p-3 font-mono text-[10px] text-[#2a2723]">
                {driverLink}
              </p>
            )}
          </section>
        )}

        {view === "updates" && (
          <div className="space-y-6">
            <AdminBroadcastPush guestCount={guests.length} onMessage={setMessage} />
            <AdminBroadcastEmail guestCount={guests.length} onMessage={setMessage} />
          </div>
        )}
      </div>
    </div>
  );
}
