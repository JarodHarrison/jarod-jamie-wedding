"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Bus, Camera, Heart, LogOut, Mail, Store, Users } from "lucide-react";
import { AdminBroadcastEmail } from "@/components/admin/admin-broadcast-email";
import { AdminBroadcastPush } from "@/components/admin/admin-broadcast-push";
import { AdminDriveConnect } from "@/components/admin/admin-drive-connect";
import { AdminVisionStatus } from "@/components/admin/admin-vision-status";
import { AdminGmailConnect } from "@/components/admin/admin-gmail-connect";
import { AdminGuestList } from "@/components/admin/admin-guest-list";
import { AdminGuestPhotos } from "@/components/admin/admin-guest-photos";
import { AdminGuestStories } from "@/components/admin/admin-guest-stories";
import { AdminKioskPanel } from "@/components/admin/admin-kiosk-panel";
import { AdminVendors } from "@/components/admin/admin-vendors";
import { AdminSectionCard } from "@/components/admin/admin-section-card";
import {
  AdminGuestStatModal,
  type GuestStatCategory,
} from "@/components/admin/admin-guest-stat-modal";
import {
  AdminTransferOverviewModal,
  type TransferOverviewModal,
} from "@/components/admin/admin-transfer-overview-modal";
import { theme } from "@/lib/theme";
import type { AdminGuest } from "@/types/wedding";

type AdminDashboardProps = {
  adminName: string;
  onLogout: () => void;
  onUnauthorized?: () => void;
};

type AdminView = "hub" | "guests" | "shuttle" | "updates" | "stories" | "photos" | "vendors";

type CommandStats = {
  guests: { total: number; rsvpAccepted: number; rsvpPending: number; profilePhotos: number };
  stories: { total: number; hidden: number; reported: number };
  bingo: { playing: number; completed: number };
  transfers: { returnShuttleMcy: number; returnShuttleBne: number; buddyMatches: number };
};

export function AdminDashboard({ adminName, onLogout, onUnauthorized }: AdminDashboardProps) {
  const [guests, setGuests] = useState<AdminGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [view, setView] = useState<AdminView>("hub");
  const [filter, setFilter] = useState<"all" | "pending-rsvp" | "submitted">("all");
  const [driverLink, setDriverLink] = useState<string | null>(null);
  const [commandStats, setCommandStats] = useState<CommandStats | null>(null);
  const [transferModal, setTransferModal] = useState<TransferOverviewModal>(null);
  const [guestStatModal, setGuestStatModal] = useState<GuestStatCategory | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const onUnauthorizedRef = useRef(onUnauthorized);
  onUnauthorizedRef.current = onUnauthorized;

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, left: 0 });
  }, [view]);

  const loadGuests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/guests");
      const data = await res.json();
      if (res.status === 401) {
        onUnauthorizedRef.current?.();
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
  }, []);

  useEffect(() => {
    loadGuests();
  }, [loadGuests]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) setCommandStats(await res.json());
      } catch {
        // non-blocking
      }
    })();
  }, [guests.length]);

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
    stories: "Story Moderation",
    photos: "Photo Moderation",
    vendors: "Vendors",
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
            {commandStats && (
              <>
                {" "}
                · {commandStats.bingo.completed} bingo wins · {commandStats.stories.reported} reported stories
              </>
            )}
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
              {(
                [
                  { label: "RSVP In", value: stats.rsvpIn, category: "rsvp-in" as const },
                  { label: "On-site", value: stats.onSite, category: "on-site" as const },
                  { label: "Off-site", value: stats.offSite, category: "off-site" as const },
                  { label: "Transfers", value: stats.transfers, category: "transfers" as const },
                ] as const
              ).map((stat) => (
                <button
                  key={stat.label}
                  type="button"
                  onClick={() => setGuestStatModal(stat.category)}
                  className="rounded-xl border bg-white p-3 text-center shadow-sm transition-colors hover:bg-[#faf8f4]"
                  style={{ borderColor: theme.border }}
                >
                  <p className="text-lg font-bold text-[#2a2723]">{stat.value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    {stat.label}
                  </p>
                </button>
              ))}
            </section>

            {commandStats && (
              <section className="mb-8 grid grid-cols-2 gap-2">
                {[
                  {
                    label: "Return MCY",
                    value: commandStats.transfers.returnShuttleMcy,
                    onClick: () => setTransferModal({ kind: "return-shuttle", airport: "MCY" }),
                  },
                  {
                    label: "Return BNE",
                    value: commandStats.transfers.returnShuttleBne,
                    onClick: () => setTransferModal({ kind: "return-shuttle", airport: "BNE" }),
                  },
                  {
                    label: "Buddy matches",
                    value: commandStats.transfers.buddyMatches,
                    onClick: () => setTransferModal({ kind: "buddy-matches" }),
                  },
                ].map((stat) => (
                  <button
                    key={stat.label}
                    type="button"
                    onClick={stat.onClick}
                    className="rounded-xl border bg-white p-3 text-center shadow-sm transition-colors hover:bg-[#faf8f4]"
                    style={{ borderColor: theme.border }}
                  >
                    <p className="text-lg font-bold text-[#2a2723]">{stat.value}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      {stat.label}
                    </p>
                  </button>
                ))}
              </section>
            )}

            {commandStats && (
              <section className="mb-8 grid grid-cols-2 gap-2">
                {(
                  [
                    {
                      label: "Photos",
                      value: commandStats.guests.profilePhotos,
                      category: "photos" as const,
                    },
                    {
                      label: "Bingo playing",
                      value: commandStats.bingo.playing,
                      category: "bingo-playing" as const,
                    },
                    {
                      label: "Bingo done",
                      value: commandStats.bingo.completed,
                      category: "bingo-done" as const,
                    },
                    {
                      label: "Stories",
                      value: commandStats.stories.total,
                      category: "story-authors" as const,
                    },
                  ] as const
                ).map((stat) => (
                  <button
                    key={stat.label}
                    type="button"
                    onClick={() => setGuestStatModal(stat.category)}
                    className="rounded-xl border bg-[#f7f4ee] p-3 text-center transition-colors hover:bg-[#f0ebe3]"
                    style={{ borderColor: theme.border }}
                  >
                    <p className="text-lg font-bold text-[#2a2723]">{stat.value}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      {stat.label}
                    </p>
                  </button>
                ))}
              </section>
            )}

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
                title="Vendors"
                description="Upload supplier contacts, contracts, and notes for the wedding party."
                actionLabel="Manage Vendors"
                icon={Store}
                onClick={() => setView("vendors")}
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
              <AdminSectionCard
                title="Photo Wall"
                description="Approve guest uploads before they appear on the live TV slideshow."
                actionLabel="Moderate Photos"
                icon={Camera}
                onClick={() => setView("photos")}
              />
              <AdminSectionCard
                title="Story Wall"
                description="Moderate guest stories — hide, approve, or delete reported content."
                actionLabel="Moderate Stories"
                icon={Heart}
                onClick={() => setView("stories")}
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
            <AdminKioskPanel onMessage={setMessage} />
            <AdminVisionStatus />
            <AdminDriveConnect />
            <AdminGmailConnect />
            <AdminBroadcastPush guestCount={guests.length} onMessage={setMessage} />
            <AdminBroadcastEmail guestCount={guests.length} onMessage={setMessage} />
          </div>
        )}

        {view === "stories" && <AdminGuestStories onMessage={setMessage} />}

        {view === "photos" && <AdminGuestPhotos onMessage={setMessage} />}

        {view === "vendors" && <AdminVendors />}
      </div>

      <AdminTransferOverviewModal modal={transferModal} onClose={() => setTransferModal(null)} />
      <AdminGuestStatModal
        category={guestStatModal}
        guests={guests}
        onClose={() => setGuestStatModal(null)}
      />
    </div>
  );
}
