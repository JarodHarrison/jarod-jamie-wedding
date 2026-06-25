"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GuestPhotoSharePanel } from "@/components/wedding/photos/guest-photo-share-panel";

export default function SharePhotoPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setAuthed(Boolean(data.user)))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return <div className="min-h-screen bg-[#f7f4ee]" />;
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f4ee] px-6">
        <div className="max-w-md rounded-3xl border border-[#e2d5c4] bg-white p-8 text-center">
          <h1 className="font-serif text-3xl text-[#2a2723]">Share a wedding photo</h1>
          <p className="mt-4 text-sm text-gray-600">Sign in to your guest account first, then come back to upload.</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-[#2a2723] px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#c3a379]"
          >
            Open wedding app
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ee] px-6 py-10">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-center font-serif text-3xl text-[#2a2723]">Share a moment</h1>
        <GuestPhotoSharePanel />
      </div>
    </div>
  );
}
