"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      className="flex items-center justify-center gap-2 border-b bg-amber-50 px-4 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-amber-800"
      role="status"
    >
      <WifiOff size={12} />
      You&apos;re offline — itinerary & FAQs cached; other features sync when back online
    </div>
  );
}
