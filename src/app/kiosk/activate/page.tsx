import { Suspense } from "react";
import KioskActivateClient from "./activate-client";

export default function KioskActivatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f4ee]" />}>
      <KioskActivateClient />
    </Suspense>
  );
}
