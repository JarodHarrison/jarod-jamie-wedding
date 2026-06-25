"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { theme } from "@/lib/theme";
import { VENDOR_DOCUMENT_ACCEPT } from "@/lib/vendors";
import type { Vendor } from "@/types/wedding";

const inputClass =
  "w-full rounded-lg border bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#c3a379]";

const emptyForm = {
  name: "",
  category: "",
  contactName: "",
  phone: "",
  email: "",
  website: "",
  notes: "",
  sortOrder: "0",
};

export function AdminVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const loadVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/vendors");
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Failed to load vendors.");
        return;
      }
      setVendors(data.vendors ?? []);
    } catch {
      setMessage("Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVendors();
  }, [loadVendors]);

  const createVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sortOrder: Number(form.sortOrder) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Failed to create vendor.");
        return;
      }
      setVendors((current) => [...current, data.vendor].sort((a, b) => a.sortOrder - b.sortOrder));
      setForm(emptyForm);
      setMessage(`${data.vendor.name} added.`);
    } finally {
      setCreating(false);
    }
  };

  const deleteVendor = async (id: string, name: string) => {
    if (!confirm(`Delete vendor "${name}"?`)) return;
    const res = await fetch(`/api/admin/vendors/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error ?? "Failed to delete vendor.");
      return;
    }
    setVendors((current) => current.filter((vendor) => vendor.id !== id));
  };

  const uploadDocument = async (id: string, file: File) => {
    setUploadingId(id);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("document", file);
      const res = await fetch(`/api/admin/vendors/${id}/document`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Failed to upload document.");
        return;
      }
      setVendors((current) =>
        current.map((vendor) => (vendor.id === id ? data.vendor : vendor)),
      );
      setMessage("Document uploaded.");
    } finally {
      setUploadingId(null);
    }
  };

  const removeDocument = async (id: string) => {
    const res = await fetch(`/api/admin/vendors/${id}/document`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Failed to remove document.");
      return;
    }
    setVendors((current) =>
      current.map((vendor) => (vendor.id === id ? data.vendor : vendor)),
    );
  };

  if (loading) {
    return <p className="text-sm text-gray-400">Loading vendors…</p>;
  }

  return (
    <div className="space-y-6">
      <section
        className="rounded-2xl border bg-white p-5 shadow-sm"
        style={{ borderColor: theme.border }}
      >
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#c3a379]">
          Add vendor
        </h3>
        <form className="space-y-3" onSubmit={createVendor}>
          <div className="grid grid-cols-2 gap-3">
            <input
              className={inputClass}
              style={{ borderColor: theme.border }}
              placeholder="Vendor name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className={inputClass}
              style={{ borderColor: theme.border }}
              placeholder="Category * (e.g. Florist)"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              className={inputClass}
              style={{ borderColor: theme.border }}
              placeholder="Contact name"
              value={form.contactName}
              onChange={(e) => setForm({ ...form, contactName: e.target.value })}
            />
            <input
              className={inputClass}
              style={{ borderColor: theme.border }}
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <input
            className={inputClass}
            style={{ borderColor: theme.border }}
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className={inputClass}
            style={{ borderColor: theme.border }}
            placeholder="Website"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
          <textarea
            className={`${inputClass} min-h-[72px]`}
            style={{ borderColor: theme.border }}
            placeholder="Notes for the wedding party"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <button
            type="submit"
            disabled={creating}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest disabled:opacity-60"
            style={{ backgroundColor: theme.btnDark, color: theme.gold }}
          >
            <Plus size={14} /> {creating ? "Adding…" : "Add vendor"}
          </button>
        </form>
      </section>

      <div className="space-y-4">
        {vendors.map((vendor) => (
          <article
            key={vendor.id}
            className="rounded-2xl border bg-white p-4 shadow-sm"
            style={{ borderColor: theme.border }}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-serif text-lg text-[#2a2723]">{vendor.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#c3a379]">
                  {vendor.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void deleteVendor(vendor.id, vendor.name)}
                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                aria-label={`Delete ${vendor.name}`}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              {vendor.contactName && <p>Contact: {vendor.contactName}</p>}
              {vendor.phone && <p>Phone: {vendor.phone}</p>}
              {vendor.email && <p>Email: {vendor.email}</p>}
              {vendor.website && (
                <p>
                  Website:{" "}
                  <a href={vendor.website} target="_blank" rel="noreferrer" className="underline">
                    {vendor.website}
                  </a>
                </p>
              )}
              {vendor.notes && <p className="text-xs leading-relaxed text-gray-500">{vendor.notes}</p>}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-600">
                {uploadingId === vendor.id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Upload size={12} />
                )}
                {vendor.hasDocument ? "Replace file" : "Upload file"}
                <input
                  type="file"
                  accept={VENDOR_DOCUMENT_ACCEPT}
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) void uploadDocument(vendor.id, file);
                  }}
                />
              </label>
              {vendor.hasDocument && (
                <>
                  <a
                    href={`/api/admin/vendors/${vendor.id}/document`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#2a2723]"
                    style={{ borderColor: theme.border }}
                  >
                    <FileText size={12} /> View
                  </a>
                  <button
                    type="button"
                    onClick={() => void removeDocument(vendor.id)}
                    className="rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500"
                    style={{ borderColor: theme.border }}
                  >
                    Remove file
                  </button>
                </>
              )}
            </div>
          </article>
        ))}

        {vendors.length === 0 && (
          <p className="text-center text-sm text-gray-400">No vendors yet — add your first one above.</p>
        )}
      </div>
    </div>
  );
}
