"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { SubHeader } from "@/components/wedding/shared/sub-header";
import { theme } from "@/lib/theme";
import { VENDOR_PORTAL_DAYS_BEFORE, WEDDING_DATE_ISO } from "@/lib/wedding-event";
import type { AppTab, Vendor } from "@/types/wedding";

type VendorsScreenProps = {
  setActiveTab: (tab: AppTab) => void;
};

export function VendorsScreen({ setActiveTab }: VendorsScreenProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/vendors");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Vendor access is not available yet.");
          return;
        }
        setVendors(data.vendors ?? []);
      } catch {
        setError("Failed to load vendors.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="animate-fade-in animate-slide-right pb-10">
      <SubHeader
        title="Vendors"
        subtitle="Wedding suppliers"
        onBack={() => setActiveTab("home")}
      />

      <div className="mt-6 space-y-4 px-6">
        <p className="text-sm leading-relaxed text-gray-600">
          Vendor contacts unlock for the wedding party from{" "}
          <strong className="text-[#2a2723]">{VENDOR_PORTAL_DAYS_BEFORE} days</strong> before the
          wedding ({WEDDING_DATE_ISO}).
        </p>

        {loading && (
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading…</p>
        )}
        {error && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </p>
        )}

        {vendors.map((vendor) => (
          <article
            key={vendor.id}
            className="rounded-2xl border bg-white/70 p-5 shadow-sm"
            style={{ borderColor: theme.border }}
          >
            <p className="font-serif text-xl text-[#2a2723]">{vendor.name}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#c3a379]">
              {vendor.category}
            </p>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              {vendor.contactName && <p>Contact: {vendor.contactName}</p>}
              {vendor.phone && (
                <p>
                  Phone:{" "}
                  <a href={`tel:${vendor.phone}`} className="underline">
                    {vendor.phone}
                  </a>
                </p>
              )}
              {vendor.email && (
                <p>
                  Email:{" "}
                  <a href={`mailto:${vendor.email}`} className="underline">
                    {vendor.email}
                  </a>
                </p>
              )}
              {vendor.website && (
                <p>
                  Website:{" "}
                  <a href={vendor.website} target="_blank" rel="noreferrer" className="underline">
                    {vendor.website}
                  </a>
                </p>
              )}
              {vendor.notes && <p className="pt-2 text-xs leading-relaxed text-gray-500">{vendor.notes}</p>}
            </div>
            {vendor.hasDocument && (
              <a
                href={`/api/vendors/${vendor.id}/document`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest"
                style={{ backgroundColor: theme.btnDark, color: theme.gold }}
              >
                <FileText size={12} /> Open document
              </a>
            )}
          </article>
        ))}

        {!loading && !error && vendors.length === 0 && (
          <p className="text-center text-sm text-gray-400">No vendors have been added yet.</p>
        )}
      </div>
    </div>
  );
}
