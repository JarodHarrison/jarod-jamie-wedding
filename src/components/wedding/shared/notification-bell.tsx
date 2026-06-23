"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { theme } from "@/lib/theme";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

type NotificationBellProps = {
  className?: string;
};

export function NotificationBell({ className }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<AppNotification | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      const next: AppNotification[] = data.notifications ?? [];
      const nextUnread = data.unreadCount ?? 0;

      setNotifications((prev) => {
        const prevUnread = prev.filter((n) => !n.readAt).map((n) => n.id);
        const brandNew = next.find((n) => !n.readAt && !prevUnread.includes(n.id));
        if (brandNew && !open) {
          setToast(brandNew);
          window.setTimeout(() => setToast(null), 5000);
        }
        return next;
      });
      setUnreadCount(nextUnread);
    } catch {
      // Guest may not be logged in or network blip — ignore
    }
  }, [open]);

  useEffect(() => {
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 45_000);
    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    setLoading(true);
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read-all" }),
      });
      const now = new Date().toISOString();
      setNotifications((current) => current.map((n) => ({ ...n, readAt: n.readAt ?? now })));
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const formatWhen = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setToast(null);
        }}
        className={`relative rounded-full p-2 transition-colors hover:bg-black/5 ${className ?? ""}`}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        <Bell size={18} className="text-[#2a2723]" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c3a379] px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {toast && (
        <div
          className="fixed left-4 right-4 top-20 z-50 mx-auto max-w-sm animate-fade-in rounded-2xl border bg-white p-4 shadow-xl"
          style={{ borderColor: theme.border }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">New update</p>
          <p className="mt-1 font-medium text-[#2a2723]">{toast.title}</p>
          <p className="mt-1 text-sm text-gray-600">{toast.body}</p>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div
            className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border bg-[#f7f4ee] shadow-2xl"
            style={{ borderColor: theme.border }}
          >
            <div
              className="flex items-center justify-between border-b px-5 py-4"
              style={{ borderColor: theme.border }}
            >
              <h2 className="font-serif text-xl text-[#2a2723]">Notifications</h2>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    disabled={loading}
                    className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379] disabled:opacity-50"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1 hover:bg-black/5"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {notifications.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">No notifications yet.</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => {
                        if (!notification.readAt) void markRead(notification.id);
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                        notification.readAt ? "bg-white/60" : "bg-white shadow-sm"
                      }`}
                      style={{ borderColor: theme.border }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-[#2a2723]">{notification.title}</p>
                        {!notification.readAt && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#c3a379]" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{notification.body}</p>
                      <p className="mt-2 text-[10px] uppercase tracking-wider text-gray-400">
                        {formatWhen(notification.createdAt)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
