"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Plus, UserRound } from "lucide-react";
import {
  GUEST_OF_HOST_OPTIONS,
  GUEST_RELATIONSHIP_OPTIONS,
} from "@/lib/guest-identity";
import { theme } from "@/lib/theme";

const inputClass =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[var(--wedding-gold)]";

type PartyMember = {
  id: string;
  name: string;
  email: string;
  isPlaceholderEmail: boolean;
  phone: string | null;
  dietaryNotes: string | null;
  songRequest: string | null;
  rsvpStatus: "PENDING" | "ACCEPTED" | "DECLINED";
  guestOfHost: string | null;
  guestRelationship: string | null;
  guestRelationshipNote: string | null;
  claimed: boolean;
  canManage: boolean;
  isSelf: boolean;
  isPlusOneOfViewer: boolean;
  hasProfilePhoto: boolean;
  photoUrl: string | null;
  assignedRoomName: string | null;
  sayiPartyName: string | null;
};

type MyPartySectionProps = {
  onError: (message: string) => void;
};

export function MyPartySection({ onError }: MyPartySectionProps) {
  const [members, setMembers] = useState<PartyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [drafts, setDrafts] = useState<Record<string, Partial<PartyMember>>>({});
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDietary, setNewDietary] = useState("");
  const [linkAsPlusOne, setLinkAsPlusOne] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/guest/party");
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Failed to load your party.");
        return;
      }
      setMembers(data.members ?? []);
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    void load();
  }, [load]);

  const others = members.filter((m) => !m.isSelf);
  const manageable = others.filter((m) => m.canManage);

  function draftFor(member: PartyMember): PartyMember {
    return { ...member, ...(drafts[member.id] ?? {}) };
  }

  function setDraft(id: string, patch: Partial<PartyMember>) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
    setSaved(false);
  }

  async function saveMember(member: PartyMember) {
    const draft = draftFor(member);
    setSaving(true);
    setSaved(false);
    onError("");
    try {
      const res = await fetch(`/api/guest/party/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          email: draft.email,
          phone: draft.phone,
          dietaryNotes: draft.dietaryNotes,
          songRequest: draft.songRequest,
          rsvpStatus: draft.rsvpStatus,
          guestOfHost: draft.guestOfHost,
          guestRelationship: draft.guestRelationship,
          guestRelationshipNote: draft.guestRelationshipNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Failed to save.");
        return;
      }
      setMembers(data.members ?? []);
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[member.id];
        return next;
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  async function linkPlusOne(memberId: string) {
    setSaving(true);
    onError("");
    try {
      const res = await fetch(`/api/guest/party/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkAsPlusOne: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Failed to link plus-one.");
        return;
      }
      setMembers(data.members ?? []);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  async function addMember() {
    setSaving(true);
    setSaved(false);
    onError("");
    try {
      const res = await fetch("/api/guest/party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail || null,
          phone: newPhone || null,
          dietaryNotes: newDietary || null,
          linkAsPlusOne,
          rsvpStatus: "ACCEPTED",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Failed to add guest.");
        return;
      }
      setMembers(data.members ?? []);
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setNewDietary("");
      setAdding(false);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-400">Loading your party…</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        If you&apos;re the first in your couple or family to open the app, you can fill in details for
        anyone who hasn&apos;t signed in yet. When they create their account, they take over their own
        profile.
      </p>

      {others.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-5 text-center text-sm text-gray-500" style={{ borderColor: theme.border }}>
          No one else is linked to your party yet. Add a partner or family member below, or we&apos;ll
          show roommates and import party guests here once they match.
        </p>
      ) : (
        <div className="space-y-3">
          {others.map((member) => {
            const open = openId === member.id;
            const draft = draftFor(member);
            return (
              <div
                key={member.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
                style={{ borderColor: theme.border }}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : member.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-[#f7f4ee]"
                    style={{ borderColor: theme.border }}
                  >
                    {member.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.photoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <UserRound size={18} className="text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[#2a2723]">{member.name}</p>
                    <p className="truncate text-[10px] uppercase tracking-widest text-gray-400">
                      {member.claimed
                        ? "Signed in"
                        : member.canManage
                          ? "Needs details"
                          : "Unclaimed"}
                      {member.isPlusOneOfViewer ? " · Plus-one" : ""}
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>

                {open && (
                  <div className="space-y-3 border-t px-4 pb-4 pt-3" style={{ borderColor: theme.border }}>
                    {member.claimed ? (
                      <p className="text-sm text-gray-500">
                        They&apos;ve signed into the app, so only they can update their profile now.
                      </p>
                    ) : member.canManage ? (
                      <>
                        <label className="block">
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Full name
                          </span>
                          <input
                            value={draft.name}
                            onChange={(e) => setDraft(member.id, { name: e.target.value })}
                            className={inputClass}
                            style={{ borderColor: theme.border }}
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Email {member.isPlaceholderEmail ? "(add their real email)" : ""}
                          </span>
                          <input
                            type="email"
                            value={draft.email}
                            onChange={(e) => setDraft(member.id, { email: e.target.value })}
                            className={inputClass}
                            style={{ borderColor: theme.border }}
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Phone
                          </span>
                          <input
                            value={draft.phone ?? ""}
                            onChange={(e) => setDraft(member.id, { phone: e.target.value })}
                            className={inputClass}
                            style={{ borderColor: theme.border }}
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Dietary requirements
                          </span>
                          <textarea
                            value={draft.dietaryNotes ?? ""}
                            onChange={(e) => setDraft(member.id, { dietaryNotes: e.target.value })}
                            rows={2}
                            className={inputClass}
                            style={{ borderColor: theme.border }}
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Song request
                          </span>
                          <input
                            value={draft.songRequest ?? ""}
                            onChange={(e) => setDraft(member.id, { songRequest: e.target.value })}
                            className={inputClass}
                            style={{ borderColor: theme.border }}
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            RSVP
                          </span>
                          <select
                            value={draft.rsvpStatus}
                            onChange={(e) =>
                              setDraft(member.id, {
                                rsvpStatus: e.target.value as PartyMember["rsvpStatus"],
                              })
                            }
                            className={inputClass}
                            style={{ borderColor: theme.border }}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="DECLINED">Declined</option>
                          </select>
                        </label>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="block">
                            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                              Guest of
                            </span>
                            <select
                              value={draft.guestOfHost ?? ""}
                              onChange={(e) => setDraft(member.id, { guestOfHost: e.target.value })}
                              className={inputClass}
                              style={{ borderColor: theme.border }}
                            >
                              <option value="">Select</option>
                              {GUEST_OF_HOST_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="block">
                            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
                              Relationship
                            </span>
                            <select
                              value={draft.guestRelationship ?? ""}
                              onChange={(e) =>
                                setDraft(member.id, { guestRelationship: e.target.value })
                              }
                              className={inputClass}
                              style={{ borderColor: theme.border }}
                            >
                              <option value="">Select</option>
                              {GUEST_RELATIONSHIP_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => void saveMember(member)}
                            className="rounded-full px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white disabled:opacity-60"
                            style={{ backgroundColor: theme.btnDark }}
                          >
                            {saving ? "Saving…" : "Save details"}
                          </button>
                          {!member.isPlusOneOfViewer && (
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => void linkPlusOne(member.id)}
                              className="rounded-full border px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#2a2723] disabled:opacity-60"
                              style={{ borderColor: theme.border }}
                            >
                              Link as my plus-one
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">Unable to manage this profile.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {manageable.length > 0 && (
        <p className="text-xs text-gray-500">
          {manageable.length} {manageable.length === 1 ? "person" : "people"} in your party still need
          details or haven&apos;t signed in.
        </p>
      )}

      {!adding ? (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border bg-white px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#2a2723]"
          style={{ borderColor: theme.border }}
        >
          <Plus size={14} /> Add partner or family member
        </button>
      ) : (
        <div className="space-y-3 rounded-2xl border bg-white p-4" style={{ borderColor: theme.border }}>
          <p className="font-serif text-lg text-[#2a2723]">Add someone</p>
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Full name
            </span>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className={inputClass}
              style={{ borderColor: theme.border }}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Email (optional)
            </span>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="We'll create a placeholder if blank"
              className={inputClass}
              style={{ borderColor: theme.border }}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Phone (optional)
            </span>
            <input
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className={inputClass}
              style={{ borderColor: theme.border }}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Dietary requirements (optional)
            </span>
            <textarea
              value={newDietary}
              onChange={(e) => setNewDietary(e.target.value)}
              rows={2}
              className={inputClass}
              style={{ borderColor: theme.border }}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-[#2a2723]">
            <input
              type="checkbox"
              checked={linkAsPlusOne}
              onChange={(e) => setLinkAsPlusOne(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Link as my plus-one / companion
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={saving || newName.trim().length < 2}
              onClick={() => void addMember()}
              className="rounded-full px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white disabled:opacity-60"
              style={{ backgroundColor: theme.btnDark }}
            >
              {saving ? "Adding…" : "Add to my party"}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-full border px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-500"
              style={{ borderColor: theme.border }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {saved && (
        <p className="text-center text-xs text-emerald-700">Saved. Their profile is updated.</p>
      )}
    </div>
  );
}
