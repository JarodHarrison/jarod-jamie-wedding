"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Link2, Mail, AlertCircle } from "lucide-react";
import { theme } from "@/lib/theme";

type GmailStatus = {
  gmailConnected: boolean;
  googleClientConfigured: boolean;
  senderEmail: string | null;
  smtpFallbackConfigured: boolean;
  transport?: "gmail" | "smtp" | "none";
};

export function AdminGmailConnect() {
  const [status, setStatus] = useState<GmailStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testSending, setTestSending] = useState(false);
  const [testMessage, setTestMessage] = useState("");

  const loadStatus = async () => {
    try {
      const res = await fetch("/api/admin/gmail/status");
      if (res.ok) setStatus(await res.json());
    } catch {
      // non-blocking
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const handleTestSend = async () => {
    setTestSending(true);
    setTestMessage("");
    try {
      const res = await fetch("/api/admin/gmail/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setTestMessage(data.error ?? "Test send failed.");
        return;
      }
      setTestMessage(data.message ?? "Test email sent.");
    } catch {
      setTestMessage("Test send failed.");
    } finally {
      setTestSending(false);
    }
  };

  const canSend = status?.transport && status.transport !== "none";

  const handleConnect = () => {
    window.location.href = "/api/admin/gmail/connect";
  };

  const canConnect = status?.googleClientConfigured && !status.gmailConnected;

  return (
    <section
      className="rounded-2xl border bg-white p-4 shadow-sm"
      style={{ borderColor: theme.border }}
    >
      <div className="mb-2 flex items-center gap-2">
        <Mail size={16} className="text-[#c3a379]" />
        <h2 className="font-serif text-lg text-[#2a2723]">Email (Google Workspace)</h2>
      </div>

      {loading ? (
        <p className="text-xs text-gray-400">Checking email setup…</p>
      ) : !status ? (
        <p className="text-xs text-red-500">Could not load email status.</p>
      ) : status.gmailConnected ? (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Gmail connected</p>
              <p className="mt-1">
                Sending via Gmail API (OAuth 2.0)
                {status.senderEmail ? (
                  <>
                    {" "}
                    as <span className="font-mono">{status.senderEmail}</span>
                  </>
                ) : null}
                .
              </p>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-gray-500">
            Welcome emails, invites, password resets, and broadcasts use your Workspace mailboxes.
            Reconnect if you rotate credentials.
          </p>
          <button
            type="button"
            onClick={handleConnect}
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#c3a379]"
          >
            <Link2 size={12} /> Reconnect Gmail
          </button>
          {canSend && (
            <button
              type="button"
              disabled={testSending}
              onClick={() => void handleTestSend()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-[10px] font-bold uppercase tracking-widest disabled:opacity-60"
              style={{ borderColor: theme.border, color: theme.btnDark }}
            >
              {testSending ? "Sending…" : "Send test email"}
            </button>
          )}
          {testMessage && <p className="text-xs text-gray-600">{testMessage}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Email not connected</p>
              <p className="mt-1">
                Guest welcome emails, invites, and broadcasts won&apos;t send until you connect Gmail
                with OAuth (no app password needed).
              </p>
            </div>
          </div>

          {!status.googleClientConfigured && (
            <p className="text-[11px] text-red-600">
              Add <span className="font-mono">GOOGLE_CLIENT_ID</span> and{" "}
              <span className="font-mono">GOOGLE_CLIENT_SECRET</span> to your environment first.
            </p>
          )}

          <ol className="list-decimal space-y-1 pl-4 text-[11px] leading-relaxed text-gray-600">
            <li>Enable the Gmail API in Google Cloud Console.</li>
            <li>
              OAuth consent screen → add scope <span className="font-mono">gmail.send</span> and add{" "}
              <span className="font-mono">theboys@jarodandjamiewedding.com</span> as a{" "}
              <strong>test user</strong> (required while app is in Testing).
            </li>
            <li>
              Paste this redirect URI into Google Cloud (do <strong>not</strong> open it):{" "}
              <span className="block break-all font-mono text-[10px] text-gray-500">
                https://jarodandjamiewedding.com/api/admin/gmail/callback
              </span>
            </li>
            <li>
              Click <strong>Connect Gmail</strong> below and sign in as{" "}
              <span className="font-mono">theboys@jarodandjamiewedding.com</span>
            </li>
            <li>Copy <span className="font-mono">GMAIL_REFRESH_TOKEN</span> into Vercel env vars</li>
          </ol>

          <button
            type="button"
            onClick={handleConnect}
            disabled={!canConnect}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
            style={{ backgroundColor: theme.btnDark, color: theme.gold }}
          >
            <Link2 size={14} />
            Connect Gmail
          </button>
          {canSend && (
            <button
              type="button"
              disabled={testSending}
              onClick={() => void handleTestSend()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-[10px] font-bold uppercase tracking-widest disabled:opacity-60"
              style={{ borderColor: theme.border, color: theme.btnDark }}
            >
              {testSending ? "Sending…" : `Send test email (${status?.transport})`}
            </button>
          )}
          {testMessage && <p className="text-xs text-gray-600">{testMessage}</p>}
        </div>
      )}
    </section>
  );
}
