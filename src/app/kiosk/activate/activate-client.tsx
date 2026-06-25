"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function KioskActivateClient() {
  const searchParams = useSearchParams();
  const code = (searchParams.get("code") ?? "").toUpperCase();
  const [message, setMessage] = useState("Activating kiosk…");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!code) {
      setMessage("Missing kiosk code.");
      return;
    }

    void (async () => {
      const res = await fetch("/api/kiosk/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (res.status === 401) {
        setMessage("Please sign in as admin on your phone, then scan the QR code again.");
        return;
      }

      if (!res.ok) {
        setMessage(data.error ?? "Could not activate kiosk.");
        return;
      }

      setOk(true);
      setMessage(`Kiosk ${data.displayCode} is live on the TV.`);
      sessionStorage.setItem("admin_kiosk_code", data.displayCode);
    })();
  }, [code]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f4ee] px-6">
      <div className="max-w-md rounded-3xl border border-[#e2d5c4] bg-white p-8 text-center shadow-sm">
        <h1 className="font-serif text-3xl text-[#2a2723]">Photo Wall Kiosk</h1>
        <p className="mt-4 text-sm leading-relaxed text-gray-600">{message}</p>
        {!ok && (
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-[#2a2723] px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#c3a379]"
          >
            Open app & sign in
          </Link>
        )}
        {ok && (
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-[#2a2723] px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#c3a379]"
          >
            Back to app
          </Link>
        )}
      </div>
    </div>
  );
}
