"use client";

import { useCallback, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { GuestPhotoWall } from "@/components/wedding/shared/guest-photo-wall";
import { GuestPhotoLightbox } from "@/components/wedding/shared/guest-photo-lightbox";
import { useTabRefresh } from "@/components/wedding/hooks/use-tab-refresh";
import { RainbowText } from "@/components/wedding/shared/rainbow-text";
import type { GuestProfileCardData } from "@/lib/guest-profile-card";
import {
  applyPhotosToRoster,
  type GuestProfilePhoto,
  type PartyMemberWithPhoto,
} from "@/lib/party-photo-match";
import {
  partyFamilyGroups,
  partyGrooms,
  partyWeddingParty,
} from "@/lib/party-roster";
import { theme } from "@/lib/theme";

const PERSON_PLACEHOLDER = "/party/person-placeholder.svg";

type PartyPhotoLightbox = {
  src: string;
  alt: string;
  profile?: GuestProfileCardData | null;
};

function PersonAvatar({
  name,
  imageSrc,
  guestProfile,
  onPhotoTap,
}: {
  name: string;
  imageSrc?: string;
  guestProfile?: GuestProfileCardData;
  onPhotoTap?: (photo: PartyPhotoLightbox) => void;
}) {
  const canExpand = Boolean(imageSrc && imageSrc !== PERSON_PLACEHOLDER);
  const content = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc ?? PERSON_PLACEHOLDER}
        alt={name}
        className="h-full w-full object-cover"
      />
    </>
  );

  if (canExpand && onPhotoTap && imageSrc) {
    return (
      <button
        type="button"
        onClick={() => onPhotoTap({ src: imageSrc, alt: name, profile: guestProfile })}
        className="relative h-14 w-14 shrink-0 cursor-zoom-in overflow-hidden rounded-full border-2 bg-[#f7f4ee] shadow-sm"
        style={{ borderColor: theme.border }}
        aria-label={`View ${name} full screen`}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 bg-[#f7f4ee] shadow-sm"
      style={{ borderColor: theme.border }}
    >
      {content}
    </div>
  );
}

function PersonRow({
  person,
  onPhotoTap,
}: {
  person: PartyMemberWithPhoto;
  onPhotoTap?: (photo: PartyPhotoLightbox) => void;
}) {
  return (
    <div
      className="flex items-center gap-3 border-b py-3 last:border-0 last:pb-0"
      style={{ borderColor: theme.border }}
    >
      <PersonAvatar
        name={person.name}
        imageSrc={person.imageSrc}
        guestProfile={person.guestProfile}
        onPhotoTap={onPhotoTap}
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-[#2a2723]">{person.name}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{person.role}</p>
      </div>
    </div>
  );
}

function FamilyAccordion({
  title,
  members,
  defaultOpen = false,
  onPhotoTap,
}: {
  title: string;
  members: PartyMemberWithPhoto[];
  defaultOpen?: boolean;
  onPhotoTap?: (photo: PartyPhotoLightbox) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="overflow-hidden rounded-3xl border bg-white/80 shadow-sm"
      style={{ borderColor: theme.border }}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
        aria-expanded={open}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex -space-x-2">
            {members.slice(0, 3).map((member) => {
              const canExpand = Boolean(member.imageSrc && member.imageSrc !== PERSON_PLACEHOLDER);
              const avatar = (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.imageSrc ?? PERSON_PLACEHOLDER}
                    alt=""
                    className="h-full w-full object-cover"
                    aria-hidden
                  />
                </>
              );

              if (canExpand && onPhotoTap && member.imageSrc) {
                return (
                  <button
                    key={member.name}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onPhotoTap({ src: member.imageSrc!, alt: member.name, profile: member.guestProfile });
                    }}
                    className="relative h-10 w-10 cursor-zoom-in overflow-hidden rounded-full border-2 border-white bg-[#f7f4ee]"
                    aria-label={`View ${member.name} full screen`}
                  >
                    {avatar}
                  </button>
                );
              }

              return (
                <div
                  key={member.name}
                  className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-[#f7f4ee]"
                >
                  {avatar}
                </div>
              );
            })}
          </div>
          <div className="min-w-0">
            <h4 className="font-serif text-lg text-[#2a2723]">{title}</h4>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {members.length} members
            </p>
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`shrink-0 text-[#c3a379] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t px-5 pb-5 pt-1" style={{ borderColor: theme.border }}>
          {members.map((member) => (
            <PersonRow key={member.name} person={member} onPhotoTap={onPhotoTap} />
          ))}
        </div>
      )}
    </div>
  );
}

function GroomCard({
  person,
  onPhotoTap,
}: {
  person: PartyMemberWithPhoto;
  onPhotoTap?: (photo: PartyPhotoLightbox) => void;
}) {
  const canExpand = Boolean(person.imageSrc && person.imageSrc !== PERSON_PLACEHOLDER);
  const photo = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={person.imageSrc ?? PERSON_PLACEHOLDER}
        alt={person.name}
        className="h-full w-full object-cover"
      />
    </>
  );

  return (
    <div
      className="flex flex-col items-center rounded-3xl border bg-white/80 p-5 text-center shadow-sm"
      style={{ borderColor: theme.gold }}
    >
      {canExpand && onPhotoTap && person.imageSrc ? (
        <button
          type="button"
          onClick={() =>
            onPhotoTap({ src: person.imageSrc!, alt: person.name, profile: person.guestProfile })
          }
          className="relative mb-3 h-24 w-24 cursor-zoom-in overflow-hidden rounded-full border-2 shadow-md"
          style={{ borderColor: theme.gold }}
          aria-label={`View ${person.name} full screen`}
        >
          {photo}
        </button>
      ) : (
        <div
          className="relative mb-3 h-24 w-24 overflow-hidden rounded-full border-2 shadow-md"
          style={{ borderColor: theme.gold }}
        >
          {photo}
        </div>
      )}
      <p className="font-serif text-xl text-[#2a2723]">{person.name}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">{person.role}</p>
    </div>
  );
}

export function PartyScreen() {
  const [profilePhotos, setProfilePhotos] = useState<GuestProfilePhoto[]>([]);
  const [lightbox, setLightbox] = useState<PartyPhotoLightbox | null>(null);

  const loadProfilePhotos = useCallback(async () => {
    try {
      const res = await fetch("/api/party/photos", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setProfilePhotos(data.guests ?? []);
    } catch {
      // non-blocking
    }
  }, []);

  useTabRefresh("party", loadProfilePhotos);

  const groomsWithPhotos = useMemo(
    () => applyPhotosToRoster(partyGrooms, profilePhotos),
    [profilePhotos],
  );

  const weddingPartyWithPhotos = useMemo(
    () => applyPhotosToRoster(partyWeddingParty, profilePhotos),
    [profilePhotos],
  );

  const familyGroupsWithPhotos = useMemo(
    () =>
      partyFamilyGroups.map((family) => ({
        ...family,
        members: applyPhotosToRoster([...family.members], profilePhotos),
      })),
    [profilePhotos],
  );

  return (
    <div className="animate-fade-in animate-slide-up pb-10">
      <div className="wedding-screen-top sticky top-0 z-20 bg-[#f7f4ee]/90 px-8 pb-6 text-center backdrop-blur-md">
        <RainbowText
          as="h2"
          className="mb-2 font-serif text-sm uppercase tracking-[0.15em] text-gray-500"
        >
          VIPs
        </RainbowText>
        <RainbowText as="h1" className="font-serif text-3xl text-[var(--wedding-text-dark)]">
          Wedding Party & Family
        </RainbowText>
      </div>

      <div className="mt-4 space-y-8 px-6">
        <div>
          <h3
            className="mb-4 border-b pb-2 font-serif text-xl"
            style={{ borderColor: theme.border, color: theme.gold }}
          >
            The Grooms
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {groomsWithPhotos.map((person) => (
              <GroomCard key={person.name} person={person} onPhotoTap={setLightbox} />
            ))}
          </div>
        </div>

        <div>
          <h3
            className="mb-4 border-b pb-2 font-serif text-xl"
            style={{ borderColor: theme.border, color: theme.gold }}
          >
            The Wedding Party
          </h3>
          <div className="grid gap-4">
            {weddingPartyWithPhotos.map((person) => (
              <div
                key={person.name}
                className="flex items-center gap-3 rounded-2xl border bg-white/80 p-4 shadow-sm"
                style={{ borderColor: theme.border }}
              >
                <PersonAvatar
                  name={person.name}
                  imageSrc={person.imageSrc}
                  guestProfile={person.guestProfile}
                  onPhotoTap={setLightbox}
                />
                <div>
                  <p className="font-serif text-lg text-[#2a2723]">{person.name}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {person.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3
            className="border-b pb-2 font-serif text-xl"
            style={{ borderColor: theme.border, color: theme.gold }}
          >
            The Families
          </h3>

          {familyGroupsWithPhotos.map((family, index) => (
            <FamilyAccordion
              key={family.id}
              title={family.title}
              members={family.members}
              defaultOpen={index === 0}
              onPhotoTap={setLightbox}
            />
          ))}
        </div>

        <section
          className="rounded-3xl border bg-white/80 p-5 shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <h3 className="mb-1 font-serif text-xl" style={{ color: theme.gold }}>
            Who&apos;s coming
          </h3>
          <p className="mb-4 text-sm text-gray-500">
            Guests who&apos;ve RSVP&apos;d and added a profile photo.
          </p>
          <GuestPhotoWall />
        </section>
      </div>

      <GuestPhotoLightbox
        open={Boolean(lightbox)}
        src={lightbox?.src ?? ""}
        alt={lightbox?.alt ?? ""}
        profile={lightbox?.profile}
        onClose={() => setLightbox(null)}
      />
    </div>
  );
}
